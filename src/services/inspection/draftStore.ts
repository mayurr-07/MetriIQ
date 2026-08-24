import type { InspectionDraft, InspectionSummary } from "@/types/inspection";
import { STORAGE_KEYS, readJson, writeJson } from "@/services/storage";

/**
 * Local persistence for inspection drafts.
 *
 * DEVELOPMENT ADAPTER ONLY — records live in this browser and are never sent
 * to a government system. Replacing this module with an API client is the
 * single change needed to move inspections onto a real backend.
 */
function readAll(): InspectionDraft[] {
  return readJson<InspectionDraft[]>(STORAGE_KEYS.inspectionDrafts, []);
}

function writeAll(drafts: InspectionDraft[]): void {
  writeJson(STORAGE_KEYS.inspectionDrafts, drafts);
}

export const draftStore = {
  list(): InspectionDraft[] {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  summaries(): InspectionSummary[] {
    return this.list().map((draft) => ({
      id: draft.id,
      reference: draft.reference,
      productName: draft.product.productName || "Untitled product",
      brand: draft.product.brand || "—",
      updatedAt: draft.updatedAt,
      workflowState: draft.workflowState,
      isDemo: draft.isDemo,
      evidenceCount: draft.evidence.length,
      currentStep: draft.currentStep,
    }));
  },

  get(id: string): InspectionDraft | null {
    return readAll().find((draft) => draft.id === id) ?? null;
  },

  /** Throws `StorageError` when the device cannot persist the record. */
  save(draft: InspectionDraft): InspectionDraft {
    const next = { ...draft, updatedAt: new Date().toISOString() };
    const all = readAll().filter((item) => item.id !== draft.id);
    writeAll([next, ...all]);
    return next;
  },

  remove(id: string): void {
    writeAll(readAll().filter((item) => item.id !== id));
  },
};
