import { inspectionService } from "@/services/inspection/inspectionService";
import { complaintService } from "@/services/inspection/complaintService";
import { draftStore } from "@/services/inspection/draftStore";
import { ISSUE_TYPE_LABELS } from "@/types/complaint";
import type {
  AdminComplaintRow,
  AdminInspectionRow,
  AuditEvent,
  ViolationRecord,
} from "@/types/analytics";

/**
 * Department-level read model.
 *
 * Admin is an OVERSIGHT layer: it joins the officer inspection store and the
 * consumer complaint store into cross-linked rows. It never owns a separate
 * copy of those entities, so Officer and Consumer workflows remain the single
 * source of truth.
 */
export const adminService = {
  /**
   * Inspections joined with the complaint that produced them, when any.
   *
   * Reads the link directly from the inspection record rather than scanning
   * complaints, so the relationship survives even if a complaint is removed.
   */
  listInspections(): AdminInspectionRow[] {
    return draftStore.list().map((draft) => ({
      id: draft.id,
      reference: draft.reference,
      productName: draft.product.productName || "Untitled product",
      brand: draft.product.brand || "—",
      officer: draft.product.location || "Unassigned",
      state: draft.workflowState,
      decision: draft.decision.decision,
      evidenceCount: draft.evidence.length,
      violationCount: draft.violations.length,
      sourceComplaintId: draft.sourceComplaintId,
      updatedAt: draft.updatedAt,
      isDemo: draft.isDemo,
    }));
  },

  /** Complaints joined with the inspection they were converted into, when any. */
  listComplaints(): AdminComplaintRow[] {
    return complaintService.list().map((c) => ({
      id: c.id,
      complaintId: c.complaintId,
      productName: c.productName,
      issueType: ISSUE_TYPE_LABELS[c.issueType],
      status: c.status,
      assignedOfficer: c.assignedOfficerName ?? null,
      linkedInspectionId: c.linkedInspectionId ?? null,
      linkedInspectionDraftId: c.linkedInspectionDraftId ?? null,
      region: c.cityArea,
      updatedAt: c.updatedAt,
      isDemo: c.isDemo,
    }));
  },

  /**
   * Violations recorded against inspections.
   *
   * `origin` preserves the legal distinction. A violation only becomes a
   * FINAL_DECISION once the officer has submitted a FAIL decision.
   */
  listViolations(): ViolationRecord[] {
    const rows: ViolationRecord[] = [];
    for (const draft of draftStore.list()) {
      for (const violation of draft.violations) {
        const submitted = Boolean(draft.decision.submittedAt);
        const failed = draft.decision.decision === "FAIL";
        rows.push({
          id: `${draft.id}-${violation.id}`,
          title: violation.title,
          ruleReference: violation.ruleReference,
          severity: violation.severity,
          origin: submitted && failed ? "FINAL_DECISION" : submitted ? "OFFICER_CONFIRMED" : "AI_FINDING",
          inspectionId: draft.reference,
          inspectionDraftId: draft.id,
          productName: draft.product.productName || "Untitled product",
          detectedValue: violation.detectedValue,
          expectedRequirement: violation.expectedRequirement,
          evidenceCount: draft.evidence.length,
          recordedAt: draft.updatedAt,
          isDemo: draft.isDemo,
        });
      }
    }
    return rows.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  },

  /**
   * Audit trail reconstructed from real recorded activity.
   *
   * Nothing here is invented: inspection events come from stored drafts and
   * complaint events come from the complaint timeline written in Phase 3.
   */
  listAuditEvents(): AuditEvent[] {
    const events: AuditEvent[] = [];

    for (const draft of draftStore.list()) {
      events.push({
        id: `audit-insp-created-${draft.id}`,
        timestamp: draft.createdAt,
        actor: "Inspection Officer",
        actorRole: "INSPECTION_OFFICER",
        action: "INSPECTION_CREATED",
        entity: "Inspection",
        entityId: draft.reference,
        result: "Draft created on this device",
      });
      if (draft.decision.submittedAt) {
        events.push({
          id: `audit-insp-decision-${draft.id}`,
          timestamp: draft.decision.submittedAt,
          actor: "Inspection Officer",
          actorRole: "INSPECTION_OFFICER",
          action: "INSPECTION_DECISION",
          entity: "Inspection",
          entityId: draft.reference,
          result: `Decision recorded: ${draft.decision.decision}`,
        });
      }
    }

    for (const complaint of complaintService.list()) {
      for (const event of complaint.events) {
        events.push({
          id: `audit-cmp-${complaint.id}-${event.id}`,
          timestamp: event.timestamp,
          actor: event.actorName,
          actorRole: event.actorRole,
          action:
            event.type === "SUBMITTED"
              ? "COMPLAINT_CREATED"
              : event.type === "INFO_REQUESTED"
                ? "COMPLAINT_INFO_REQUESTED"
                : event.type === "LINKED_TO_INSPECTION"
                  ? "COMPLAINT_LINKED"
                  : "COMPLAINT_STATUS_CHANGED",
          entity: "Complaint",
          entityId: complaint.complaintId,
          result: event.title,
        });
      }
    }

    return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  /** Counts used by the admin dashboard. All are real local record counts. */
  counts() {
    const inspections = inspectionService.list();
    const complaints = complaintService.list();
    return {
      inspections: inspections.length,
      complaints: complaints.length,
      violations: this.listViolations().length,
      openComplaints: complaints.filter(
        (c) => c.status !== "RESOLVED" && c.status !== "REJECTED",
      ).length,
      pendingDecisions: inspections.filter(
        (i) => i.workflowState !== "PASSED" && i.workflowState !== "FAILED",
      ).length,
      linkedCases: complaints.filter((c) => Boolean(c.linkedInspectionId)).length,
    };
  },
};
