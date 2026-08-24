import type { ComplaintStatus } from "./complaint";
import type { InspectionWorkflowState } from "./inspection";

/**
 * PROVENANCE — the honesty contract for every number in the platform.
 *
 * Admin and Senior surfaces must always state where a figure came from.
 * `LOCAL` values are truthful counts derived from records actually stored in
 * this browser. `DEMO` values exist only to demonstrate a chart layout and
 * must always be visibly labelled. `UNAVAILABLE` means no service is wired.
 */
export type DataProvenance = "LOCAL" | "DEMO" | "UNAVAILABLE";

export interface DataScope {
  provenance: DataProvenance;
  /** Short label rendered beside the data, e.g. "Local development records". */
  label: string;
  /** Longer sentence explaining the limitation to the user. */
  note: string;
}

export const SCOPE_LOCAL: DataScope = {
  provenance: "LOCAL",
  label: "Local development records",
  note: "Counts are derived from inspection and complaint records stored in this browser. They are not department-wide government statistics.",
};

export const SCOPE_UNAVAILABLE: DataScope = {
  provenance: "UNAVAILABLE",
  label: "Service not connected",
  note: "No backend data source is connected for this module yet.",
};

export const SCOPE_DEMO: DataScope = {
  provenance: "DEMO",
  label: "Demo data · not official",
  note: "This dataset exists only to demonstrate the interface layout. It is not real government data.",
};

/** A metric whose value may legitimately be unknown. */
export interface Metric {
  key: string;
  label: string;
  /** `null` means "awaiting data" — never render a fabricated number. */
  value: number | null;
  hint?: string;
  tone?: "neutral" | "pass" | "review" | "issue";
}

export interface DashboardMetrics {
  scope: DataScope;
  metrics: Metric[];
}

export interface CategoryCount {
  key: string;
  label: string;
  count: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface TrendSeries {
  id: string;
  label: string;
  points: TrendPoint[];
  scope: DataScope;
}

export interface ComplianceMetric {
  ruleId: string;
  ruleCode: string;
  title: string;
  /** How many officer-reviewed checks referenced this rule. */
  observed: number;
  /** Officer-confirmed non-compliance only — never raw AI output. */
  confirmed: number;
  scope: DataScope;
}

export type RiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "HIGH";

export interface RiskSignal {
  id: string;
  subject: string;
  subjectType: "PRODUCT" | "MANUFACTURER" | "REGION";
  level: RiskLevel;
  /** Human-readable reasons — never an opaque score. */
  reasons: string[];
  complaintCount: number;
  inspectionCount: number;
  confirmedFindingCount: number;
  scope: DataScope;
}

export interface GeographicalMetric {
  region: string;
  complaints: number;
  inspections: number;
  scope: DataScope;
}

export interface InspectionPriority {
  id: string;
  subject: string;
  /** Advisory only. The officer decides whether to act. */
  rationale: string[];
  signalStrength: RiskLevel;
  relatedComplaintIds: string[];
  relatedInspectionIds: string[];
}

/** Officer directory record — populated by a future identity service. */
export interface OfficerRecord {
  id: string;
  name: string;
  badgeNumber: string;
  district: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastActivity: string | null;
  assignedInspections: number;
}

/**
 * Reference (master) product data.
 *
 * `verification` distinguishes OCR-detected values from officially verified
 * reference data. OCR output must never be silently promoted to master data.
 */
export interface ProductRecord {
  id: string;
  name: string;
  brand: string;
  category: string;
  manufacturerId: string | null;
  manufacturerName: string | null;
  verification: "DETECTED" | "VERIFIED" | "UNVERIFIED";
  relatedInspectionIds: string[];
}

export interface ManufacturerRecord {
  id: string;
  name: string;
  identifier: string | null;
  district: string | null;
  verification: "VERIFIED" | "UNVERIFIED" | "SOURCE_NOT_CONNECTED";
  productCount: number;
  relatedInspectionIds: string[];
}

export interface RuleRecord {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  applicableCategory: string;
  requirement: string;
  status: "ACTIVE" | "DRAFT" | "RETIRED";
  version: string;
  effectiveDate: string | null;
  /** `null` when no authoritative source is connected. */
  sourceReference: string | null;
}

/**
 * A violation entry at department level.
 *
 * `origin` keeps the legal distinction explicit: an AI finding is a signal,
 * an officer-confirmed finding is evidence, and only a submitted decision is
 * a determination.
 */
export interface ViolationRecord {
  id: string;
  title: string;
  ruleReference: string;
  severity: string;
  origin: "AI_FINDING" | "OFFICER_CONFIRMED" | "FINAL_DECISION";
  inspectionId: string;
  inspectionDraftId: string;
  productName: string;
  detectedValue: string;
  expectedRequirement: string;
  evidenceCount: number;
  recordedAt: string;
  isDemo: boolean;
}

export type AuditAction =
  | "INSPECTION_CREATED"
  | "INSPECTION_UPDATED"
  | "INSPECTION_DECISION"
  | "COMPLAINT_CREATED"
  | "COMPLAINT_STATUS_CHANGED"
  | "COMPLAINT_INFO_REQUESTED"
  | "COMPLAINT_LINKED"
  | "RULE_UPDATED"
  | "REPORT_GENERATED";

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  result: string;
}

/** Department-level view of an inspection, joined with its source complaint. */
export interface AdminInspectionRow {
  id: string;
  reference: string;
  productName: string;
  brand: string;
  officer: string;
  state: InspectionWorkflowState;
  decision: string | null;
  evidenceCount: number;
  violationCount: number;
  sourceComplaintId: string | null;
  updatedAt: string;
  isDemo: boolean;
}

/** Department-level view of a complaint, joined with its linked inspection. */
export interface AdminComplaintRow {
  id: string;
  complaintId: string;
  productName: string;
  issueType: string;
  status: ComplaintStatus;
  assignedOfficer: string | null;
  linkedInspectionId: string | null;
  linkedInspectionDraftId: string | null;
  region: string;
  updatedAt: string;
  isDemo: boolean;
}
