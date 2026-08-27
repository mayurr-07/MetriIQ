export type InspectionWorkflowState =
  | "DRAFT"
  | "CAPTURING_EVIDENCE"
  | "PROCESSING"
  | "AWAITING_REVIEW"
  | "REVIEW_REQUIRED"
  | "READY_FOR_DECISION"
  | "PASSED"
  | "FAILED"
  | "INCONCLUSIVE";

export type InspectionDecision = "PASS" | "FAIL" | "REQUIRES_FURTHER_REVIEW" | "INCONCLUSIVE";

export type EvidenceKind = "FRONT" | "BACK" | "ADDITIONAL";

export type ImageQualityState = "READY" | "PROCESSING" | "LOW_QUALITY" | "UNREADABLE" | "RETAKE_REQUIRED" | "UNAVAILABLE";

export type ServiceAvailability = "IDLE" | "PROCESSING" | "AVAILABLE" | "UNAVAILABLE" | "ERROR";

export type ViolationSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ComplianceOutcome = "COMPLIANT" | "REVIEW_REQUIRED" | "VIOLATIONS_DETECTED" | "INCONCLUSIVE";

export interface ProductContext {
  category: string;
  productType: string;
  brand: string;
  productName: string;
  location: string;
  inspectionDate: string;
  reference: string;
  batchNumber: string;
}

export interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
  capturedAt: string;
  /** MinIO-hosted URL, set after successful upload to the backend. */
  backendUrl?: string;
  /** MinIO file key, for future presigned URL refresh. */
  fileKey?: string;
}

export interface BackendRuleResult {
  ruleCode: string;
  title: string;
  status: "pass" | "fail" | "warning" | "na";
  detail: string;
}

export interface BackendReport {
  reportId: string;
  generatedAt: string;
  overallStatus: "compliant" | "non_compliant" | "partially_compliant";
  complianceScore: number;
  ruleResults: BackendRuleResult[];
  failedRules: BackendRuleResult[];
  warningRules: BackendRuleResult[];
  passedRules: BackendRuleResult[];
  summary: string;
  violationCategories: string[];
  riskLevel: "low" | "medium" | "high";
}

export interface ImageQualityResult {
  status: ImageQualityState;
  message: string;
  evidenceId?: string;
}

export interface ExtractedLabel {
  productName: string;
  brand: string;
  netQuantity: string;
  mrp: string;
  manufacturingDate: string;
  batchNumber: string;
  customerCarePhone: string;
  customerCareEmail: string;
  manufacturer: string;
  countryOfOrigin: string;
  otherDeclarations: string;
}

export type LabelFieldKey = keyof ExtractedLabel;

export interface LabelFieldReview {
  key: LabelFieldKey;
  label: string;
  value: string;
  confirmed: boolean;
}

export interface ComplianceRule {
  id: string;
  code: string;
  title: string;
  requirement: string;
}

export interface ComplianceCheck {
  id: string;
  ruleId: string;
  title: string;
  requirement: string;
  detectedValue: string;
  outcome: ComplianceOutcome;
  evidenceId?: string;
}

export interface Violation {
  id: string;
  title: string;
  ruleReference: string;
  severity: ViolationSeverity;
  description: string;
  detectedValue: string;
  expectedRequirement: string;
  evidenceId?: string;
  evidenceLocation?: string;
  officerNotes: string;
}

export interface OfficerDecision {
  decision: InspectionDecision | null;
  notes: string;
  submittedAt?: string;
}

export interface InspectionDraft {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  workflowState: InspectionWorkflowState;
  isDemo: boolean;
  /**
   * Reference of the consumer complaint this inspection was created from.
   * `null` for officer-initiated inspections. Together with
   * `ComplaintCase.linkedInspectionDraftId` this forms the two-way
   * complaint ↔ inspection traceability link.
   */
  sourceComplaintId: string | null;
  /** Internal id of the source complaint, for direct navigation. */
  sourceComplaintRecordId: string | null;
  product: ProductContext;
  evidence: EvidenceItem[];
  quality: ImageQualityResult | null;
  extractionStatus: ServiceAvailability;
  extractedLabel: ExtractedLabel | null;
  fieldReviews: LabelFieldReview[];
  complianceStatus: ServiceAvailability;
  complianceOutcome: ComplianceOutcome | null;
  checks: ComplianceCheck[];
  violations: Violation[];
  decision: OfficerDecision;
  /** Full AI compliance report from the backend, set after run-full completes. */
  backendReport?: BackendReport;
}

export interface InspectionSummary {
  id: string;
  reference: string;
  productName: string;
  brand: string;
  updatedAt: string;
  workflowState: InspectionWorkflowState;
  isDemo: boolean;
  evidenceCount: number;
  currentStep: number;
}

export const EMPTY_PRODUCT: ProductContext = {
  category: "",
  productType: "",
  brand: "",
  productName: "",
  location: "",
  inspectionDate: "",
  reference: "",
  batchNumber: "",
};

export const EMPTY_LABEL: ExtractedLabel = {
  productName: "",
  brand: "",
  netQuantity: "",
  mrp: "",
  manufacturingDate: "",
  batchNumber: "",
  customerCarePhone: "",
  customerCareEmail: "",
  manufacturer: "",
  countryOfOrigin: "",
  otherDeclarations: "",
};

export const LABEL_FIELDS: Array<{ key: LabelFieldKey; label: string }> = [
  { key: "productName", label: "Product Name" },
  { key: "brand", label: "Brand" },
  { key: "netQuantity", label: "Net Quantity" },
  { key: "mrp", label: "MRP" },
  { key: "manufacturingDate", label: "Manufacturing / Packing Date" },
  { key: "batchNumber", label: "Batch / Lot Number" },
  { key: "customerCarePhone", label: "Customer Care Phone" },
  { key: "customerCareEmail", label: "Customer Care Email" },
  { key: "manufacturer", label: "Manufacturer / Packer" },
  { key: "countryOfOrigin", label: "Country of Origin" },
  { key: "otherDeclarations", label: "Other Mandatory Declarations" },
];

export const INSPECTION_STEPS = [
  { id: 1, title: "Product", caption: "Context" },
  { id: 2, title: "Capture", caption: "Evidence" },
  { id: 3, title: "Extract", caption: "Label" },
  { id: 4, title: "Check", caption: "Compliance" },
  { id: 5, title: "Review", caption: "Findings" },
  { id: 6, title: "Submit", caption: "Decision" },
] as const;
