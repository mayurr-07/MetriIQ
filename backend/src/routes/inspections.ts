import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { extractLabelData } from "../services/ocrService.js";
import { checkOcrRules } from "../services/ruleEngine.js";
import type { LabelData } from "../types/labelData.js";

const router = Router();

// All inspection routes require a logged-in user
router.use(requireAuth);

// POST /api/inspections/extract
// Accepts an image URL, runs GPT-4o Vision extraction, returns LabelData.
router.post(
  "/extract",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl } = req.body as { imageUrl?: string };

    if (!imageUrl?.trim()) {
      res.status(400).json({ error: "'imageUrl' is required in the request body." });
      return;
    }

    console.log(`[extract] Starting OCR extraction for: ${imageUrl.slice(0, 80)}...`);
    const start = Date.now();

    const labelData = await extractLabelData(imageUrl.trim());

    console.log(`[extract] Done in ${Date.now() - start}ms`);
    res.json({ labelData });
  })
);

// POST /api/inspections/check-ocr
// Accepts a LabelData body, runs all OCR+LLM compliance rules, returns RuleResult[].
router.post(
  "/check-ocr",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: Request, res: Response) => {
    const labelData = req.body as LabelData;

    if (!labelData || typeof labelData !== "object") {
      res.status(400).json({ error: "Request body must be a LabelData JSON object." });
      return;
    }

    console.log(`[check-ocr] Running compliance rule checks...`);
    const start = Date.now();

    const results = await checkOcrRules(labelData);

    const passed  = results.filter((r) => r.status === "pass").length;
    const failed  = results.filter((r) => r.status === "fail").length;
    const warning = results.filter((r) => r.status === "warning").length;

    console.log(
      `[check-ocr] Done in ${Date.now() - start}ms — ` +
      `${passed} pass, ${failed} fail, ${warning} warning out of ${results.length} rules`
    );

    res.json({ results, summary: { total: results.length, passed, failed, warning } });
  })
);

export default router;
