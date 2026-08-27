import { Router, Request, Response } from "express";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { uploadBuffer, getPresignedUrl } from "../lib/minio.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 5 },
});

// POST /api/uploads/image
// Accepts up to 5 images, compresses them with sharp, stores in MinIO.
router.post(
  "/image",
  requireAuth,
  upload.array("images", 5),
  asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files ?? []) as Express.Multer.File[];

    if (files.length === 0) {
      res.status(400).json({ error: "No images provided. Send files under the 'images' field." });
      return;
    }

    // Validate MIME types upfront before doing any processing
    for (const file of files) {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        res.status(400).json({
          error: `Unsupported file type "${file.mimetype}". Allowed: jpeg, png, webp.`,
        });
        return;
      }
    }

    const results = await Promise.all(
      files.map(async (file) => {
        // Resize to max 1920px wide, re-encode as JPEG quality 85
        // This keeps OpenAI Vision token costs manageable
        const compressed = await sharp(file.buffer)
          .resize({ width: 1920, withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const key = `evidence/${year}/${month}/${randomUUID()}.jpg`;

        await uploadBuffer(key, compressed, "image/jpeg");
        const url = await getPresignedUrl(key);

        return { fileKey: key, url, originalName: file.originalname, sizeBytes: compressed.length };
      })
    );

    res.status(201).json({ files: results });
  })
);

// GET /api/uploads/url?key=evidence/2025/06/abc.jpg
// Generates a fresh 1-hour presigned URL for an existing MinIO object.
router.get(
  "/url",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const key = req.query.key as string | undefined;
    if (!key?.trim()) {
      res.status(400).json({ error: "Query param 'key' is required." });
      return;
    }
    const url = await getPresignedUrl(key.trim());
    res.json({ url });
  })
);

export default router;
