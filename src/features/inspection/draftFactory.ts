import { LABEL_FIELDS, type ExtractedLabel, type InspectionDraft, type LabelFieldReview } from "@/types/inspection";

export function reviewsFromLabel(label: ExtractedLabel): LabelFieldReview[] {
  return LABEL_FIELDS.map((field) => ({
    key: field.key,
    label: field.label,
    value: label[field.key],
    confirmed: Boolean(label[field.key]),
  }));
}

export function deriveWorkflowState(draft: InspectionDraft): InspectionDraft["workflowState"] {
  if (draft.decision.submittedAt) {
    if (draft.decision.decision === "PASS") return "PASSED";
    if (draft.decision.decision === "FAIL") return "FAILED";
    return "INCONCLUSIVE";
  }
  if (draft.decision.decision) return "READY_FOR_DECISION";
  if (draft.complianceStatus === "AVAILABLE" || draft.extractionStatus === "AVAILABLE") return "REVIEW_REQUIRED";
  if (draft.extractionStatus === "PROCESSING" || draft.complianceStatus === "PROCESSING") return "PROCESSING";
  if (draft.evidence.length > 0) return "CAPTURING_EVIDENCE";
  return "DRAFT";
}
