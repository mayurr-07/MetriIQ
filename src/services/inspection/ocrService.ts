import type { ExtractedLabel, ServiceAvailability } from "@/types/inspection";
import { EMPTY_LABEL } from "@/types/inspection";

export interface OcrResponse {
  status: ServiceAvailability;
  message: string;
  label: ExtractedLabel | null;
  stages: string[];
}

const STAGES = [
  "Reading package text",
  "Identifying mandatory declarations",
  "Preparing compliance checks",
];

/**
 * OCR adapter.
 *
 * Production will call the real OCR/computer-vision pipeline.
 * Phase 2A returns UNAVAILABLE unless an explicit demo preview is requested.
 */
export const ocrService = {
  stages(): string[] {
    return STAGES;
  },
  async extract(_evidenceIds: string[], demo: boolean): Promise<OcrResponse> {
    await wait(demo ? 1400 : 700);
    if (!demo) {
      return {
        status: "UNAVAILABLE",
        message: "OCR and label extraction will run when the inspection service is connected.",
        label: null,
        stages: STAGES,
      };
    }
    return {
      status: "AVAILABLE",
      message: "Demo analysis only. This is not an official inspection.",
      label: DEMO_LABEL,
      stages: STAGES,
    };
  },
};

const DEMO_LABEL: ExtractedLabel = {
  ...EMPTY_LABEL,
  productName: "Classic Salted Potato Chips",
  brand: "SHUDH AHAAR",
  netQuantity: "500 g",
  mrp: "₹120",
  manufacturingDate: "07 / 26",
  batchNumber: "CP-2607-A19",
  customerCarePhone: "1800-266-XXXX",
  customerCareEmail: "care@shudhahaar.example",
  manufacturer: "Shudh Ahaar Foods Pvt. Ltd., Jaipur",
  countryOfOrigin: "India",
  otherDeclarations: "Best before 04 months from manufacture",
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
