import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { extractLabelData } from "../services/ocrService.js";
import { checkOcrRules } from "../services/ruleEngine.js";
import { checkVisionRules } from "../services/visionRuleEngine.js";
import { generateReport } from "../services/reportService.js";
import { Inspection } from "../models/Inspection.js";
import type { LabelData } from "../types/labelData.js";

const router = Router();

router.use(requireAuth);

// ── POST /api/inspections/extract ─────────────────────────────────────────────
// Runs GPT-4o Vision on an image URL and returns structured LabelData.

router.post(
  "/extract",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl } = req.body as { imageUrl?: string };
    if (!imageUrl?.trim()) {
      res.status(400).json({ error: "'imageUrl' is required." });
      return;
    }

    console.log(`[extract] Starting extraction...`);
    const t = Date.now();
    const labelData = await extractLabelData(imageUrl.trim());
    console.log(`[extract] Done in ${Date.now() - t}ms`);

    res.json({ labelData });
  })
);

// ── POST /api/inspections/check-ocr ──────────────────────────────────────────
// Runs all OCR+LLM compliance rules on a pre-extracted LabelData object.

router.post(
  "/check-ocr",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: Request, res: Response) => {
    const labelData = req.body as LabelData;
    if (!labelData || typeof labelData !== "object") {
      res.status(400).json({ error: "Request body must be a LabelData JSON object." });
      return;
    }

    console.log(`[check-ocr] Running OCR+LLM rule checks...`);
    const t = Date.now();
    const results = await checkOcrRules(labelData);

    const passed  = results.filter((r) => r.status === "pass").length;
    const failed  = results.filter((r) => r.status === "fail").length;
    const warning = results.filter((r) => r.status === "warning").length;
    console.log(`[check-ocr] ${passed}✓ ${failed}✗ ${warning}⚠ in ${Date.now() - t}ms`);

    res.json({ results, summary: { total: results.length, passed, failed, warning } });
  })
);

// ── POST /api/inspections/check-vision ───────────────────────────────────────
// Runs all 6 vision rule groups in parallel on provided image URLs.

router.post(
  "/check-vision",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: Request, res: Response) => {
    const { imageUrls, labelData } = req.body as {
      imageUrls?: string[];
      labelData?: LabelData;
    };

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      res.status(400).json({ error: "'imageUrls' must be a non-empty array of image URLs." });
      return;
    }
    if (!labelData || typeof labelData !== "object") {
      res.status(400).json({ error: "'labelData' is required for vision checks." });
      return;
    }

    console.log(`[check-vision] Running ${imageUrls.length} image(s) through 6 vision checks in parallel...`);
    const t = Date.now();
    const results = await checkVisionRules(imageUrls, labelData);

    const passed  = results.filter((r) => r.status === "pass").length;
    const failed  = results.filter((r) => r.status === "fail").length;
    const warning = results.filter((r) => r.status === "warning").length;
    console.log(`[check-vision] ${passed}✓ ${failed}✗ ${warning}⚠ in ${Date.now() - t}ms`);

    res.json({ results, summary: { total: results.length, passed, failed, warning } });
  })
);

// ── POST /api/inspections/run-full ────────────────────────────────────────────
// Full pipeline: extract → OCR rules → vision rules → compliance report.
// This is the primary demo endpoint for SIH judges.

router.post(
  "/run-full",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: Request, res: Response) => {
    const { imageUrls, labelData: providedLabelData } = req.body as {
      imageUrls?: string[];
      labelData?: LabelData;
    };

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      res.status(400).json({ error: "'imageUrls' must be a non-empty array of image URLs." });
      return;
    }

    const totalStart = Date.now();
    console.log(`[run-full] Starting full compliance pipeline for ${imageUrls.length} image(s)...`);

    // Step 1: Extract label data from the first image (front) if not already provided
    let labelData: LabelData;
    if (providedLabelData && typeof providedLabelData === "object") {
      console.log(`[run-full] Using pre-extracted labelData — skipping OCR step.`);
      labelData = providedLabelData;
    } else {
      console.log(`[run-full] Step 1/3 — Extracting label data from front image...`);
      const t1 = Date.now();
      labelData = await extractLabelData(imageUrls[0]);
      console.log(`[run-full] Extraction done in ${Date.now() - t1}ms`);
    }

    // Step 2: Run OCR rules and vision rules in parallel
    console.log(`[run-full] Step 2/3 — Running OCR+LLM rules and vision checks in parallel...`);
    const t2 = Date.now();
    const [ocrResults, visionResults] = await Promise.all([
      checkOcrRules(labelData),
      checkVisionRules(imageUrls, labelData),
    ]);
    console.log(`[run-full] Rule checks done in ${Date.now() - t2}ms — ` +
      `OCR: ${ocrResults.length} rules, Vision: ${visionResults.length} rules`);

    // Step 3: Generate compliance report
    console.log(`[run-full] Step 3/3 — Generating compliance report...`);
    const t3 = Date.now();
    const report = await generateReport(ocrResults, visionResults, labelData);
    console.log(`[run-full] Report generated in ${Date.now() - t3}ms`);

    const totalMs = Date.now() - totalStart;
    console.log(
      `[run-full] ✓ Complete in ${totalMs}ms — ` +
      `Score: ${report.complianceScore}/100, Risk: ${report.riskLevel}, ` +
      `Status: ${report.overallStatus}, ` +
      `${report.failedRules.length} fail / ${report.warningRules.length} warn / ${report.passedRules.length} pass`
    );

    res.json({
      labelData,
      ocrResults,
      visionResults,
      report,
      meta: { totalMs, imageCount: imageUrls.length },
    });
  })
);

// ── POST /api/inspections ─────────────────────────────────────────────────────
// Create a new inspection record.

router.post(
  "/",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productDescription, location, complaintRef } = req.body as {
      productDescription?: string;
      location?: string;
      complaintRef?: string;
    };
    if (!productDescription?.trim()) {
      res.status(400).json({ error: "'productDescription' is required." });
      return;
    }

    const inspection = await Inspection.create({
      inspectionId: `INS-${Date.now().toString(36).toUpperCase()}`,
      officerId: req.user!._id,
      productDescription: productDescription.trim(),
      location: location?.trim(),
      complaintRef: complaintRef || undefined,
      status: "draft",
      images: [],
    });

    res.status(201).json({ inspection });
  })
);

// ── GET /api/inspections ──────────────────────────────────────────────────────
// List inspections, optionally filtered by status or officerId.

router.get(
  "/",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, officerId, limit = "50", skip = "0" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};

    // Officers see only their own; admins/seniors can see all or filter by officer
    if (req.user!.role === "officer") {
      filter.officerId = req.user!._id;
    } else if (officerId) {
      filter.officerId = officerId;
    }
    if (status) filter.status = status;

    const [inspections, total] = await Promise.all([
      Inspection.find(filter)
        .sort({ updatedAt: -1 })
        .skip(parseInt(skip, 10))
        .limit(Math.min(parseInt(limit, 10), 100))
        .select("-extractedData -complianceReport"),
      Inspection.countDocuments(filter),
    ]);

    res.json({ inspections, total });
  })
);

// ── GET /api/inspections/:id ──────────────────────────────────────────────────
// Get a single inspection with full report.

router.get(
  "/:id",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const inspection = await Inspection.findOne({ inspectionId: req.params.id });
    if (!inspection) {
      res.status(404).json({ error: "Inspection not found." });
      return;
    }
    // Officers can only view their own
    if (req.user!.role === "officer" && !inspection.officerId.equals(req.user!._id)) {
      res.status(403).json({ error: "Access denied." });
      return;
    }
    res.json({ inspection });
  })
);

// ── PATCH /api/inspections/:id/images ────────────────────────────────────────
// Add image entries to an existing inspection.

router.patch(
  "/:id/images",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { images } = req.body as {
      images?: Array<{ fileKey: string; url: string; type: string }>;
    };
    if (!Array.isArray(images) || images.length === 0) {
      res.status(400).json({ error: "'images' must be a non-empty array." });
      return;
    }

    const inspection = await Inspection.findOneAndUpdate(
      { inspectionId: req.params.id, officerId: req.user!._id },
      { $push: { images: { $each: images } } },
      { new: true }
    );
    if (!inspection) {
      res.status(404).json({ error: "Inspection not found or access denied." });
      return;
    }
    res.json({ inspection });
  })
);

// ── PATCH /api/inspections/:id/status ────────────────────────────────────────
// Update inspection status and optional review notes.

router.patch(
  "/:id/status",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, reviewNotes } = req.body as {
      status?: string;
      reviewNotes?: string;
    };
    const allowed = ["draft", "submitted", "reviewed", "closed"];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ error: `'status' must be one of: ${allowed.join(", ")}` });
      return;
    }

    const inspection = await Inspection.findOneAndUpdate(
      { inspectionId: req.params.id },
      { status, ...(reviewNotes !== undefined && { reviewNotes }) },
      { new: true }
    );
    if (!inspection) {
      res.status(404).json({ error: "Inspection not found." });
      return;
    }
    res.json({ inspection });
  })
);

// ── POST /api/inspections/:id/run-compliance ──────────────────────────────────
// Run the full compliance pipeline on an existing stored inspection.

router.post(
  "/:id/run-compliance",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const inspection = await Inspection.findOne({ inspectionId: req.params.id });
    if (!inspection) {
      res.status(404).json({ error: "Inspection not found." });
      return;
    }
    if (inspection.images.length === 0) {
      res.status(400).json({ error: "Inspection has no images. Add images first." });
      return;
    }

    const imageUrls = inspection.images.map((img) => img.url);
    const totalStart = Date.now();

    const labelData = await extractLabelData(imageUrls[0]);
    const [ocrResults, visionResults] = await Promise.all([
      checkOcrRules(labelData),
      checkVisionRules(imageUrls, labelData),
    ]);
    const report = await generateReport(ocrResults, visionResults, labelData);

    inspection.extractedData = labelData as unknown as Record<string, unknown>;
    inspection.complianceReport = {
      ...report,
      reportId: randomUUID(),
      generatedAt: new Date(),
    };
    inspection.status = "submitted";
    await inspection.save();

    res.json({
      labelData,
      ocrResults,
      visionResults,
      report: inspection.complianceReport,
      meta: { totalMs: Date.now() - totalStart, imageCount: imageUrls.length },
    });
  })
);

export default router;
