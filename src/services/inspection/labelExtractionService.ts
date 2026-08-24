import { ocrService, type OcrResponse } from "./ocrService";

/** Dedicated extraction adapter so the UI can depend on a stable interface. */
export const labelExtractionService = {
  async extract(evidenceIds: string[], demo: boolean): Promise<OcrResponse> {
    return ocrService.extract(evidenceIds, demo);
  },
};
