import { draftStore } from "@/services/inspection/draftStore";
import { complaintService } from "@/services/inspection/complaintService";
import { SCOPE_LOCAL, type InspectionPriority, type RiskLevel, type RiskSignal } from "@/types/analytics";

/**
 * Derives a risk band from observable, explainable counts.
 *
 * This is intentionally simple and transparent. It is an analytical aid, not
 * an autonomous scoring engine, and the reasons behind every band are always
 * surfaced to the officer alongside the band itself.
 */
function band(complaints: number, confirmed: number): RiskLevel {
  const weight = complaints + confirmed * 2;
  if (weight >= 5) return "HIGH";
  if (weight >= 3) return "ELEVATED";
  if (weight >= 1) return "MODERATE";
  return "LOW";
}

function key(value: string): string {
  return value.trim().toLowerCase();
}

export const riskService = {
  /**
   * Risk signals grouped by product and by region.
   *
   * Every signal carries human-readable reasons. Nothing is scored on a
   * hidden model, and no signal implies an enforcement outcome.
   */
  signals(): RiskSignal[] {
    const drafts = draftStore.list();
    const complaints = complaintService.list();
    const signals: RiskSignal[] = [];

    // ── by product ──
    const products = new Map<string, { name: string; complaints: number; inspections: number; confirmed: number }>();

    for (const c of complaints) {
      const name = c.productName.trim();
      if (!name) continue;
      const entry = products.get(key(name)) ?? { name, complaints: 0, inspections: 0, confirmed: 0 };
      entry.complaints += 1;
      products.set(key(name), entry);
    }

    for (const d of drafts) {
      const name = d.product.productName.trim();
      if (!name) continue;
      const entry = products.get(key(name)) ?? { name, complaints: 0, inspections: 0, confirmed: 0 };
      entry.inspections += 1;
      if (d.decision.submittedAt && d.decision.decision === "FAIL") {
        entry.confirmed += d.violations.length || 1;
      }
      products.set(key(name), entry);
    }

    for (const [id, entry] of products) {
      const reasons: string[] = [];
      if (entry.complaints > 0) {
        reasons.push(`${entry.complaints} consumer complaint${entry.complaints > 1 ? "s" : ""} recorded`);
      }
      if (entry.confirmed > 0) {
        reasons.push(`${entry.confirmed} officer-confirmed finding${entry.confirmed > 1 ? "s" : ""}`);
      }
      if (entry.inspections > 0) {
        reasons.push(`${entry.inspections} inspection record${entry.inspections > 1 ? "s" : ""} on file`);
      }
      if (reasons.length === 0) continue;

      signals.push({
        id: `product-${id}`,
        subject: entry.name,
        subjectType: "PRODUCT",
        level: band(entry.complaints, entry.confirmed),
        reasons,
        complaintCount: entry.complaints,
        inspectionCount: entry.inspections,
        confirmedFindingCount: entry.confirmed,
        scope: SCOPE_LOCAL,
      });
    }

    // ── by region ──
    const regions = new Map<string, { name: string; complaints: number; inspections: number }>();

    for (const c of complaints) {
      const name = c.cityArea || "Unspecified";
      const entry = regions.get(key(name)) ?? { name, complaints: 0, inspections: 0 };
      entry.complaints += 1;
      regions.set(key(name), entry);
    }
    for (const d of drafts) {
      const name = d.product.location || "Unspecified";
      const entry = regions.get(key(name)) ?? { name, complaints: 0, inspections: 0 };
      entry.inspections += 1;
      regions.set(key(name), entry);
    }

    for (const [id, entry] of regions) {
      if (entry.complaints === 0) continue;
      signals.push({
        id: `region-${id}`,
        subject: entry.name,
        subjectType: "REGION",
        level: band(entry.complaints, 0),
        reasons: [
          `${entry.complaints} complaint${entry.complaints > 1 ? "s" : ""} reported in this area`,
          `${entry.inspections} inspection${entry.inspections === 1 ? "" : "s"} carried out locally`,
        ],
        complaintCount: entry.complaints,
        inspectionCount: entry.inspections,
        confirmedFindingCount: 0,
        scope: SCOPE_LOCAL,
      });
    }

    const order: Record<RiskLevel, number> = { HIGH: 0, ELEVATED: 1, MODERATE: 2, LOW: 3 };
    return signals.sort((a, b) => order[a.level] - order[b.level]);
  },

  /**
   * Review-priority suggestions.
   *
   * These are advisory prompts for an authorized officer. The platform never
   * schedules or triggers an inspection on its own.
   */
  priorities(): InspectionPriority[] {
    const complaints = complaintService.list();
    const items: InspectionPriority[] = [];

    for (const c of complaints) {
      const rationale: string[] = [];
      if (!c.linkedInspectionId) rationale.push("No inspection has been linked to this complaint yet");
      if (c.status === "MORE_INFORMATION_REQUIRED") rationale.push("Awaiting additional information from the consumer");
      if (c.status === "SUBMITTED") rationale.push("Complaint has not yet been opened by an officer");
      if (c.evidence.length === 0) rationale.push("No photographic evidence attached");
      if (rationale.length === 0) continue;

      items.push({
        id: c.id,
        subject: `${c.productName} · ${c.complaintId}`,
        rationale,
        signalStrength: rationale.length >= 3 ? "HIGH" : rationale.length === 2 ? "ELEVATED" : "MODERATE",
        relatedComplaintIds: [c.complaintId],
        relatedInspectionIds: c.linkedInspectionId ? [c.linkedInspectionId] : [],
      });
    }

    const order: Record<RiskLevel, number> = { HIGH: 0, ELEVATED: 1, MODERATE: 2, LOW: 3 };
    return items.sort((a, b) => order[a.signalStrength] - order[b.signalStrength]);
  },
};
