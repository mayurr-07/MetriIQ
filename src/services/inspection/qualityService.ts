import type { ImageQualityResult } from "@/types/inspection";

export const qualityService = {
  async analyse(_evidenceCount: number, demo: boolean): Promise<ImageQualityResult> {
    await new Promise((resolve) => {
      window.setTimeout(resolve, demo ? 800 : 500);
    });
    if (!demo) {
      return {
        status: "UNAVAILABLE",
        message: "Image quality analysis will run when the inspection service is connected.",
      };
    }
    return {
      status: "READY",
      message: "Demo preview only. Quality analysis is simulated and is not an official result.",
    };
  },
};
