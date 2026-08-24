import type {
  ComplaintCase,
  ComplaintStatus,
  ComplaintEvent,
  ComplaintActionRequest,
  ComplaintEvidence,
  ConsumerComplaintSubmission,
} from "@/types/complaint";
import type { EvidenceKind, InspectionDraft } from "@/types/inspection";
import { inspectionService } from "./inspectionService";
import { deriveWorkflowState } from "@/features/inspection/draftFactory";
import { STORAGE_KEYS, readJson, writeJson } from "@/services/storage";

/**
 * Seeded demonstration cases.
 *
 * These exist so the officer workspace is not empty during a walkthrough.
 * Every record carries `isDemo: true` and every surface that renders one
 * shows a "Demo" marker. They are not real complaints and no complainant
 * here is a real person.
 */
const DEFAULT_DEMO_COMPLAINTS: ComplaintCase[] = [
  {
    id: "cmp-demo-1",
    complaintId: "CMP-2026-000041",
    status: "SUBMITTED",
    issueType: "FOREIGN_OBJECT",
    description:
      "Opened a sealed pack and found a small insect inside along with the contents. The pack was sealed when purchased and had not been opened before.",
    createdAt: "2026-02-12T08:12:00Z",
    updatedAt: "2026-02-12T08:12:00Z",
    productName: "Classic Salted Potato Chips",
    brand: "SHUDH AHAAR",
    batchNumber: "CP-2607-A19",
    purchaseDate: "2026-02-11",
    purchaseLocation: "Apex Retails, Jaipur",
    mrp: "₹120",
    expiryDate: "06 Months from MFG",
    manufacturer: "Shudh Ahaar Foods Pvt. Ltd.",
    barcode: "8901234567890",
    cityArea: "Jaipur",
    complainantName: "Demo Complainant",
    complainantPhone: "+91 94140 XXXXX",
    complainantEmail: "demo.complainant@example",
    evidence: [
      {
        id: "evd-c1-1",
        kind: "FRONT",
        source: "CONSUMER",
        fileName: "foreign_object_in_pack.jpg",
        mimeType: "image/jpeg",
        sizeBytes: 154200,
        previewUrl: "",
        capturedAt: "2026-02-11T16:30:00Z",
        description: "Foreign object visible inside the sealed pack.",
      }
    ],
    events: [
      {
        id: "evt-1",
        type: "SUBMITTED",
        title: "Complaint submitted",
        description: "Report submitted by a consumer through the citizen portal.",
        timestamp: "2026-02-12T08:12:00Z",
        actorName: "Demo Complainant",
        actorRole: "CONSUMER",
      },
    ],
    infoRequests: [],
    isDemo: true,
  },
  {
    id: "cmp-demo-2",
    complaintId: "CMP-2026-000042",
    status: "MORE_INFORMATION_REQUIRED",
    issueType: "EXPIRED_PRODUCT",
    description: "Product is on the store shelf being sold past its best before date. No clear manufacture date was readable because of poor print contrast.",
    createdAt: "2026-02-10T14:30:00Z",
    updatedAt: "2026-02-11T09:40:00Z",
    productName: "Premium Gram Flour (Besan)",
    brand: "Shudh Ahaar",
    batchNumber: "BB-2607-A19",
    purchaseDate: "2026-02-09",
    purchaseLocation: "Mart Zone, Jodhpur",
    mrp: "₹120",
    cityArea: "Jodhpur",
    complainantName: "Demo Complainant",
    evidence: [],
    events: [
      {
        id: "evt-3",
        type: "SUBMITTED",
        title: "Complaint submitted",
        description: "Report submitted by a consumer through the citizen portal.",
        timestamp: "2026-02-10T14:30:00Z",
        actorName: "Demo Complainant",
        actorRole: "CONSUMER",
      },
      {
        id: "evt-4",
        type: "INFO_REQUESTED",
        title: "Information requested",
        description: "Officer requested a clearer photograph of the manufacture date region.",
        timestamp: "2026-02-11T09:40:00Z",
        actorName: "Demo Inspection Officer",
        actorRole: "INSPECTION_OFFICER",
      },
    ],
    infoRequests: [
      {
        id: "req-1",
        requestReason:
          "The photograph of the reverse panel is blurred. Please provide a sharp close-up of the printed date region.",
        timestamp: "2026-02-11T09:40:00Z",
        officerName: "Demo Inspection Officer",
        status: "PENDING",
        requestedItems: ["Clear close-up photograph of manufacture date stamp"],
      },
    ],
    isDemo: true,
  },
];

function readAll(): ComplaintCase[] {
  const stored = readJson<ComplaintCase[] | null>(STORAGE_KEYS.complaints, null);
  if (stored === null) {
    // Seed the labelled demo cases on first run so the workspace is walkable.
    try {
      writeJson(STORAGE_KEYS.complaints, DEFAULT_DEMO_COMPLAINTS);
    } catch {
      // Seeding is best-effort; the in-memory defaults still render.
    }
    return DEFAULT_DEMO_COMPLAINTS;
  }
  return stored;
}

function writeAll(cases: ComplaintCase[]): void {
  writeJson(STORAGE_KEYS.complaints, cases);
}

export const complaintService = {
  list(): ComplaintCase[] {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  get(id: string): ComplaintCase | null {
    return readAll().find((c) => c.id === id || c.complaintId === id) ?? null;
  },

  async create(submission: ConsumerComplaintSubmission): Promise<ComplaintCase> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const now = new Date().toISOString();
    const id = `cmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const complaintId = `CMP-2026-${String(Math.floor(100000 + Math.random() * 900000))}`;
    
    // Map uploaded files to complaint evidence items. The first two images are
    // treated as the front and back of the pack; anything further is supporting.
    const evidence: ComplaintEvidence[] = submission.images.map((img, index) => {
      const kind: EvidenceKind = index === 0 ? "FRONT" : index === 1 ? "BACK" : "ADDITIONAL";
      return {
        id: `evd-cns-${Date.now()}-${index}`,
        kind,
        source: "CONSUMER",
        fileName: img.name,
        mimeType: img.type || "image/jpeg",
        sizeBytes: img.size,
        previewUrl: URL.createObjectURL(img),
        capturedAt: now,
        description: index === 0 ? "Front of pack" : index === 1 ? "Back of pack" : "Supporting photo",
      };
    });

    const newCase: ComplaintCase = {
      id,
      complaintId,
      status: "SUBMITTED",
      issueType: submission.issueType,
      description: submission.description,
      createdAt: now,
      updatedAt: now,
      productName: submission.productName || "Unknown Packaged Product",
      brand: submission.brand || "—",
      batchNumber: submission.batchNumber,
      purchaseDate: submission.purchaseDate,
      purchaseLocation: submission.purchaseLocation,
      mrp: submission.mrp,
      expiryDate: submission.expiryDate,
      manufacturer: submission.manufacturer,
      barcode: submission.barcode,
      cityArea: submission.cityArea || "Jaipur",
      complainantName: submission.complainantName || "Citizen Reporter",
      complainantPhone: submission.complainantPhone,
      complainantEmail: submission.complainantEmail,
      evidence,
      events: [
        {
          id: `evt-${Date.now()}-0`,
          type: "SUBMITTED",
          title: "Complaint Submitted",
          description: "Grievance submitted by consumer via Citizen Portal.",
          timestamp: now,
          actorName: submission.complainantName || "Citizen Reporter",
          actorRole: "CONSUMER",
        }
      ],
      infoRequests: [],
      isDemo: true, // Marked as Demo since it's locally generated in dev environment
    };

    const all = readAll();
    writeAll([newCase, ...all]);
    return newCase;
  },

  async updateStatus(
    id: string,
    status: ComplaintStatus,
    officerName: string,
    notes: string,
  ): Promise<ComplaintCase> {
    const all = readAll();
    const targetIndex = all.findIndex((c) => c.id === id || c.complaintId === id);
    if (targetIndex === -1) throw new Error("Complaint case not found.");

    const now = new Date().toISOString();
    const current = all[targetIndex];
    
    const event: ComplaintEvent = {
      id: `evt-${Date.now()}`,
      type: "STATUS_UPDATED",
      title: "Status Changed",
      description: `Status updated to ${status.replace(/_/g, " ")}. Note: ${notes || "No explanation provided."}`,
      timestamp: now,
      actorName: officerName,
      actorRole: "INSPECTION_OFFICER",
    };

    const updated: ComplaintCase = {
      ...current,
      status,
      updatedAt: now,
      events: [event, ...current.events],
    };

    // If resolving the complaint
    if (status === "RESOLVED" || status === "REJECTED") {
      updated.resolution = {
        outcome: status,
        notes,
        resolvedAt: now,
        resolvedBy: officerName,
      };
      const resolveEvent: ComplaintEvent = {
        id: `evt-${Date.now()}-res`,
        type: status === "RESOLVED" ? "RESOLVED" : "REJECTED",
        title: status === "RESOLVED" ? "Complaint Resolved" : "Complaint Rejected",
        description: `Case closed. Resolution details: ${notes}`,
        timestamp: now,
        actorName: officerName,
        actorRole: "INSPECTION_OFFICER",
      };
      updated.events.unshift(resolveEvent);
    }

    all[targetIndex] = updated;
    writeAll(all);
    return updated;
  },

  async requestMoreInfo(
    id: string,
    reason: string,
    officerName: string,
    requestedItems: string[],
  ): Promise<ComplaintCase> {
    const all = readAll();
    const targetIndex = all.findIndex((c) => c.id === id || c.complaintId === id);
    if (targetIndex === -1) throw new Error("Complaint case not found.");

    const now = new Date().toISOString();
    const current = all[targetIndex];

    const request: ComplaintActionRequest = {
      id: `req-${Date.now()}`,
      requestReason: reason,
      timestamp: now,
      officerName,
      status: "PENDING",
      requestedItems,
    };

    const event: ComplaintEvent = {
      id: `evt-${Date.now()}`,
      type: "INFO_REQUESTED",
      title: "Information Requested",
      description: `Additional details requested by inspecting officer. Items: ${requestedItems.join(", ")}`,
      timestamp: now,
      actorName: officerName,
      actorRole: "INSPECTION_OFFICER",
    };

    const updated: ComplaintCase = {
      ...current,
      status: "MORE_INFORMATION_REQUIRED",
      updatedAt: now,
      infoRequests: [request, ...current.infoRequests],
      events: [event, ...current.events],
    };

    all[targetIndex] = updated;
    writeAll(all);
    return updated;
  },

  /**
   * Complaint → Inspection Conversion & Linking.
   *
   * Reuses the existing Phase 2A `inspectionService` to create a new draft,
   * pre-populating context, evidence, and reference ID. Registers a cross-linked
   * timeline event in both records for full auditability.
   */
  async convertComplaintToInspection(
    complaintId: string,
    _officerId: string,
    officerName: string,
  ): Promise<{ complaint: ComplaintCase; inspectionDraftId: string }> {
    const all = readAll();
    const targetIndex = all.findIndex((c) => c.id === complaintId || c.complaintId === complaintId);
    if (targetIndex === -1) throw new Error("Complaint case not found.");

    const current = all[targetIndex];
    if (current.linkedInspectionId) {
      return {
        complaint: current,
        inspectionDraftId: current.linkedInspectionDraftId || "",
      };
    }

    const now = new Date().toISOString();

    // 1. Create a new inspection draft with mapped fields
    const draft = inspectionService.create({
      category: "Packaged food", // default
      productName: current.productName,
      brand: current.brand,
      batchNumber: current.batchNumber || "",
      location: current.purchaseLocation || current.cityArea,
      reference: `INSP-FROM-${current.complaintId}`,
    });

    // 2. Map evidence items into the inspection draft (inheriting existing files)
    const mappedEvidence = current.evidence.map((item) => ({
      id: item.id,
      kind: item.kind,
      fileName: item.fileName,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
      previewUrl: item.previewUrl,
      capturedAt: item.capturedAt,
    }));

    // 3. Link back to the originating complaint on the inspection side, so the
    //    relationship is readable from either direction.
    const linkedDraft: InspectionDraft = {
      ...draft,
      isDemo: current.isDemo,
      evidence: mappedEvidence,
      sourceComplaintId: current.complaintId,
      sourceComplaintRecordId: current.id,
    };
    linkedDraft.workflowState = deriveWorkflowState(linkedDraft);
    const updatedDraft = inspectionService.save(linkedDraft);

    // 4. Update the complaint side with active links
    const linkEvent: ComplaintEvent = {
      id: `evt-${Date.now()}`,
      type: "LINKED_TO_INSPECTION",
      title: "Converted to Investigation",
      description: `Officer created inspection draft ${updatedDraft.reference} from this complaint. Product details and evidence were carried across.`,
      timestamp: now,
      actorName: officerName,
      actorRole: "INSPECTION_OFFICER",
    };

    const updatedComplaint: ComplaintCase = {
      ...current,
      status: "INSPECTION_IN_PROGRESS",
      updatedAt: now,
      linkedInspectionId: updatedDraft.reference,
      linkedInspectionDraftId: updatedDraft.id,
      events: [linkEvent, ...current.events],
    };

    all[targetIndex] = updatedComplaint;
    writeAll(all);

    return {
      complaint: updatedComplaint,
      inspectionDraftId: updatedDraft.id,
    };
  },
};
