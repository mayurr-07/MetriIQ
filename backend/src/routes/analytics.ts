import { Router, Response } from "express";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { Inspection } from "../models/Inspection.js";
import { Complaint } from "../models/Complaint.js";

const router = Router();
router.use(requireAuth);

// ── GET /api/analytics/summary ────────────────────────────────────────────────
// Aggregate dashboard stats from MongoDB.

router.get(
  "/summary",
  requireRole("officer", "admin", "senior"),
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const [
      totalInspections,
      totalComplaints,
      openComplaints,
      riskGroups,
      topViolationDocs,
    ] = await Promise.all([
      Inspection.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "open" }),
      Inspection.aggregate([
        { $match: { "complianceReport.riskLevel": { $exists: true } } },
        { $group: { _id: "$complianceReport.riskLevel", count: { $sum: 1 } } },
      ]),
      Inspection.aggregate([
        { $match: { "complianceReport.violationCategories": { $exists: true, $ne: [] } } },
        { $unwind: "$complianceReport.violationCategories" },
        { $group: { _id: "$complianceReport.violationCategories", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const riskBreakdown = { low: 0, medium: 0, high: 0 };
    for (const g of riskGroups) {
      if (g._id in riskBreakdown) riskBreakdown[g._id as keyof typeof riskBreakdown] = g.count;
    }

    const scoreDocs = await Inspection.find(
      { "complianceReport.complianceScore": { $exists: true } },
      { "complianceReport.complianceScore": 1 }
    ).lean();
    const scores = scoreDocs.map((d) => (d.complianceReport as { complianceScore?: number })?.complianceScore ?? 0);
    const complianceRate = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

    res.json({
      totalInspections,
      totalComplaints,
      openComplaints,
      complianceRate,
      riskBreakdown,
      topViolations: topViolationDocs.map((d) => ({ category: d._id, count: d.count })),
    });
  })
);

export default router;
