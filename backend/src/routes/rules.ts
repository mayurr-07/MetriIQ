import { Router, Response } from "express";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ComplianceRule } from "../models/ComplianceRule.js";

const router = Router();
router.use(requireAuth);

// ── GET /api/rules ────────────────────────────────────────────────────────────
// List all active compliance rules seeded in the database.

router.get(
  "/",
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const rules = await ComplianceRule.find({ active: true }).sort({ ruleCode: 1 });
    res.json({ rules });
  })
);

export default router;
