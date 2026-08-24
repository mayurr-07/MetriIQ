import { LABEL_FIELDS, type InspectionDraft, type InspectionSummary, type ProductContext } from "@/types/inspection";
import { EMPTY_PRODUCT } from "@/types/inspection";
import { draftStore } from "./draftStore";

function uid(): string {
  return `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function makeReference(): string {
  const stamp = new Date();
  const y = stamp.getFullYear();
  const seq = String(stamp.getHours() * 100 + stamp.getMinutes()).padStart(4, "0");
  return `DRAFT-${y}-${seq}`;
}

export function createBlankDraft(partial?: Partial<ProductContext>): InspectionDraft {
  const now = new Date().toISOString();
  const reference = partial?.reference || makeReference();
  return {
    id: uid(),
    reference,
    createdAt: now,
    updatedAt: now,
    currentStep: 1,
    workflowState: "DRAFT",
    isDemo: false,
    sourceComplaintId: null,
    sourceComplaintRecordId: null,
    product: { ...EMPTY_PRODUCT, inspectionDate: now.slice(0, 10), reference, ...partial },
    evidence: [],
    quality: null,
    extractionStatus: "IDLE",
    extractedLabel: null,
    fieldReviews: LABEL_FIELDS.map((field) => ({
      key: field.key,
      label: field.label,
      value: "",
      confirmed: false,
    })),
    complianceStatus: "IDLE",
    complianceOutcome: null,
    checks: [],
    violations: [],
    decision: { decision: null, notes: "" },
  };
}

export const inspectionService = {
  list(): InspectionSummary[] {
    return draftStore.summaries();
  },
  get(id: string): InspectionDraft | null {
    return draftStore.get(id);
  },
  save(draft: InspectionDraft): InspectionDraft {
    return draftStore.save(draft);
  },
  remove(id: string): void {
    draftStore.remove(id);
  },
  create(partial?: Partial<ProductContext>): InspectionDraft {
    return draftStore.save(createBlankDraft(partial));
  },
};
