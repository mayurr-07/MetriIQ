import type { EvidenceKind } from "./inspection";

export type ComplaintStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "MORE_INFORMATION_REQUIRED"
  | "EVIDENCE_VERIFIED"
  | "INSPECTION_RECOMMENDED"
  | "INSPECTION_IN_PROGRESS"
  | "RESOLVED"
  | "ESCALATED"
  | "REJECTED";

export type ComplaintIssueType =
  | "FOREIGN_OBJECT"
  | "SPOILED_FOOD"
  | "DAMAGED_PACKAGE"
  | "EXPIRED_PRODUCT"
  | "MISLEADING_LABEL"
  | "COUNTERFEIT"
  | "OTHER";

export type EvidenceSource = "OFFICER" | "CONSUMER";

export interface ComplaintEvidence {
  id: string;
  kind: EvidenceKind;
  source: EvidenceSource;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
  capturedAt: string;
  description?: string;
}

export type ComplaintEventType =
  | "SUBMITTED"
  | "EVIDENCE_ADDED"
  | "OFFICER_ASSIGNED"
  | "OFFICER_OPENED"
  | "INFO_REQUESTED"
  | "LINKED_TO_INSPECTION"
  | "INSPECTION_CREATED"
  | "STATUS_UPDATED"
  | "RESOLVED"
  | "ESCALATED"
  | "REJECTED";

export interface ComplaintEvent {
  id: string;
  type: ComplaintEventType;
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  metadata?: Record<string, string>;
}

export interface ComplaintActionRequest {
  id: string;
  requestReason: string;
  timestamp: string;
  officerName: string;
  status: "PENDING" | "RESPONDED";
  requestedItems: string[];
}

export interface ComplaintResolution {
  outcome: "RESOLVED" | "REJECTED" | "ESCALATED";
  notes: string;
  resolvedAt: string;
  resolvedBy: string;
}

export interface ComplaintCase {
  id: string;
  complaintId: string;
  status: ComplaintStatus;
  issueType: ComplaintIssueType;
  description: string;
  createdAt: string;
  updatedAt: string;
  
  // Product context
  productName: string;
  brand: string;
  batchNumber?: string;
  purchaseDate?: string;
  purchaseLocation?: string;
  mrp?: string;
  expiryDate?: string;
  manufacturer?: string;
  barcode?: string;
  
  // Location
  cityArea: string;
  
  // Consumer details (Privacy-filtered where appropriate)
  complainantName: string;
  complainantPhone?: string;
  complainantEmail?: string;
  
  // System fields
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  linkedInspectionId?: string; // standard inspection ID (e.g. SW-2847-2026)
  linkedInspectionDraftId?: string; // internal draft ID
  evidence: ComplaintEvidence[];
  events: ComplaintEvent[];
  infoRequests: ComplaintActionRequest[];
  resolution?: ComplaintResolution;
  isDemo: boolean;
}

export interface ConsumerComplaintSubmission {
  issueType: ComplaintIssueType;
  description: string;
  productName: string;
  brand: string;
  batchNumber?: string;
  purchaseDate?: string;
  purchaseLocation?: string;
  mrp?: string;
  expiryDate?: string;
  manufacturer?: string;
  barcode?: string;
  cityArea: string;
  complainantName: string;
  complainantPhone?: string;
  complainantEmail?: string;
  images: File[];
}

export const ISSUE_TYPE_LABELS: Record<ComplaintIssueType, string> = {
  FOREIGN_OBJECT: "Foreign Object / Insect",
  SPOILED_FOOD: "Spoiled or Suspicious Food",
  DAMAGED_PACKAGE: "Damaged Package",
  EXPIRED_PRODUCT: "Expired Product",
  MISLEADING_LABEL: "Misleading Label",
  COUNTERFEIT: "Suspected Counterfeit",
  OTHER: "Something Else",
};
