import { Router, Response } from "express";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { Complaint } from "../models/Complaint.js";
import { uploadBuffer, getPresignedUrl } from "../lib/minio.js";
import multer from "multer";
import sharp from "sharp";

const router = Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const VALID_ISSUE_TYPES = [
  "missing_declaration",
  "incorrect_mrp",
  "expired_product",
  "misleading_label",
  "foreign_object",
  "counterfeit",
  "other",
];

// ── POST /api/complaints ──────────────────────────────────────────────────────
// Consumer submits a complaint, optionally with image evidence.

router.post(
  "/",
  requireRole("consumer", "officer", "admin"),
  upload.array("images", 5),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productDescription, issueType, description, location } = req.body as Record<string, string>;

    if (!productDescription?.trim() || !issueType?.trim() || !description?.trim()) {
      res.status(400).json({ error: "'productDescription', 'issueType', and 'description' are required." });
      return;
    }
    if (!VALID_ISSUE_TYPES.includes(issueType)) {
      res.status(400).json({ error: `'issueType' must be one of: ${VALID_ISSUE_TYPES.join(", ")}` });
      return;
    }

    // Upload any attached images to MinIO
    const imageUrls: string[] = [];
    const files = (req.files ?? []) as Express.Multer.File[];
    for (const file of files) {
      if (!file.mimetype.startsWith("image/")) continue;
      const compressed = await sharp(file.buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      const key = `complaints/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
      await uploadBuffer(key, compressed, "image/jpeg");
      imageUrls.push(await getPresignedUrl(key));
    }

    const complaint = await Complaint.create({
      complaintId: `CMP-${Date.now().toString(36).toUpperCase()}`,
      consumerId: req.user!._id,
      productDescription: productDescription.trim(),
      issueType,
      description: description.trim(),
      location: location?.trim(),
      images: imageUrls,
      status: "open",
    });

    res.status(201).json({ complaint });
  })
);

// ── GET /api/complaints ───────────────────────────────────────────────────────
// List complaints. Consumers see only their own; officers/admins see all.

router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, limit = "50", skip = "0" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};

    if (req.user!.role === "consumer") {
      filter.consumerId = req.user!._id;
    }
    if (status) filter.status = status;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(parseInt(skip, 10))
        .limit(Math.min(parseInt(limit, 10), 100)),
      Complaint.countDocuments(filter),
    ]);

    res.json({ complaints, total });
  })
);

// ── PATCH /api/complaints/:id/assign ─────────────────────────────────────────
// Assign a complaint to an officer (admin/senior only).

router.patch(
  "/:id/assign",
  requireRole("admin", "senior"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { officerId } = req.body as { officerId?: string };
    if (!officerId) {
      res.status(400).json({ error: "'officerId' is required." });
      return;
    }

    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      { assignedOfficerId: officerId, status: "assigned" },
      { new: true }
    );
    if (!complaint) {
      res.status(404).json({ error: "Complaint not found." });
      return;
    }
    res.json({ complaint });
  })
);

// ── PATCH /api/complaints/:id/status ─────────────────────────────────────────
// Update complaint status.

router.patch(
  "/:id/status",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, resolutionNote } = req.body as { status?: string; resolutionNote?: string };
    const allowed = ["open", "assigned", "under_inspection", "resolved", "closed"];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ error: `'status' must be one of: ${allowed.join(", ")}` });
      return;
    }

    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      { status, ...(resolutionNote !== undefined && { resolutionNote }) },
      { new: true }
    );
    if (!complaint) {
      res.status(404).json({ error: "Complaint not found." });
      return;
    }
    res.json({ complaint });
  })
);

export default router;
