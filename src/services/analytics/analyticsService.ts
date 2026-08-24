import { draftStore } from "@/services/inspection/draftStore";
import { complaintService } from "@/services/inspection/complaintService";
import { adminService } from "@/services/admin/adminService";
import { COMPLIANCE_RULES } from "@/services/inspection/complianceService";
import { ISSUE_TYPE_LABELS } from "@/types/complaint";
import {
  SCOPE_LOCAL,
  SCOPE_UNAVAILABLE,
  type CategoryCount,
  type ComplianceMetric,
  type DashboardMetrics,
  type GeographicalMetric,
  type TrendSeries,
} from "@/types/analytics";

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString(undefined, { month: "short" });
}

/**
 * Analytics read model.
 *
 * Every figure is a truthful count of records held locally. Where no records
 * exist the service returns an empty series with an UNAVAILABLE scope so the
 * UI can render an honest empty state instead of a fabricated chart.
 */
export const analyticsService = {
  dashboardMetrics(): DashboardMetrics {
    const c = adminService.counts();
    const hasData = c.inspections > 0 || c.complaints > 0;
    return {
      scope: hasData ? SCOPE_LOCAL : SCOPE_UNAVAILABLE,
      metrics: [
        { key: "inspections", label: "Inspection records", value: hasData ? c.inspections : null },
        { key: "complaints", label: "Consumer complaints", value: hasData ? c.complaints : null },
        {
          key: "open",
          label: "Open complaints",
          value: hasData ? c.openComplaints : null,
          tone: "review",
        },
        {
          key: "pending",
          label: "Inspections awaiting decision",
          value: hasData ? c.pendingDecisions : null,
          tone: "review",
        },
        {
          key: "linked",
          label: "Complaint-linked inspections",
          value: hasData ? c.linkedCases : null,
          hint: "Traceability chain established",
        },
        {
          key: "findings",
          label: "Recorded findings",
          value: hasData ? c.violations : null,
          tone: "issue",
        },
      ],
    };
  },

  /** Complaint volume per calendar month, from real submission timestamps. */
  complaintTrend(): TrendSeries {
    const complaints = complaintService.list();
    if (complaints.length === 0) {
      return { id: "complaints", label: "Complaints submitted", points: [], scope: SCOPE_UNAVAILABLE };
    }
    const buckets = new Map<string, number>();
    for (const c of complaints) {
      const key = monthKey(c.createdAt);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const points = [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ label: monthLabel(key), value }));
    return { id: "complaints", label: "Complaints submitted", points, scope: SCOPE_LOCAL };
  },

  /** Inspection volume per calendar month, from real draft timestamps. */
  inspectionTrend(): TrendSeries {
    const drafts = draftStore.list();
    if (drafts.length === 0) {
      return { id: "inspections", label: "Inspections created", points: [], scope: SCOPE_UNAVAILABLE };
    }
    const buckets = new Map<string, number>();
    for (const d of drafts) {
      const key = monthKey(d.createdAt);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    const points = [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ label: monthLabel(key), value }));
    return { id: "inspections", label: "Inspections created", points, scope: SCOPE_LOCAL };
  },

  /** Distribution of complaints across consumer-selected issue categories. */
  issueDistribution(): { items: CategoryCount[]; scope: typeof SCOPE_LOCAL } {
    const buckets = new Map<string, number>();
    for (const c of complaintService.list()) {
      const label = ISSUE_TYPE_LABELS[c.issueType];
      buckets.set(label, (buckets.get(label) ?? 0) + 1);
    }
    const items = [...buckets.entries()]
      .map(([label, count]) => ({ key: label, label, count }))
      .sort((a, b) => b.count - a.count);
    return { items, scope: items.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE };
  },

  /** Distribution of inspections across workflow states. */
  inspectionStateDistribution(): { items: CategoryCount[]; scope: typeof SCOPE_LOCAL } {
    const buckets = new Map<string, number>();
    for (const d of draftStore.list()) {
      buckets.set(d.workflowState, (buckets.get(d.workflowState) ?? 0) + 1);
    }
    const items = [...buckets.entries()]
      .map(([key, count]) => ({ key, label: key.replace(/_/g, " "), count }))
      .sort((a, b) => b.count - a.count);
    return { items, scope: items.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE };
  },

  /**
   * Per-rule observation counts.
   *
   * `confirmed` only counts findings on inspections the officer has actually
   * submitted, so AI output is never reported as a confirmed contravention.
   */
  complianceMetrics(): ComplianceMetric[] {
    const drafts = draftStore.list();
    const scope = drafts.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE;

    return COMPLIANCE_RULES.map((rule) => {
      let observed = 0;
      let confirmed = 0;
      for (const draft of drafts) {
        const checks = draft.checks.filter((c) => c.ruleId === rule.id);
        observed += checks.length;
        if (draft.decision.submittedAt && draft.decision.decision === "FAIL") {
          confirmed += draft.violations.filter((v) => v.ruleReference === rule.code).length;
        }
      }
      return {
        ruleId: rule.id,
        ruleCode: rule.code,
        title: rule.title,
        observed,
        confirmed,
        scope,
      };
    });
  },

  /** Complaint and inspection density per reported region. */
  geography(): GeographicalMetric[] {
    const buckets = new Map<string, GeographicalMetric>();

    for (const c of complaintService.list()) {
      const region = c.cityArea || "Unspecified";
      const entry = buckets.get(region) ?? {
        region,
        complaints: 0,
        inspections: 0,
        scope: SCOPE_LOCAL,
      };
      entry.complaints += 1;
      buckets.set(region, entry);
    }

    for (const d of draftStore.list()) {
      const region = d.product.location || "Unspecified";
      const entry = buckets.get(region) ?? {
        region,
        complaints: 0,
        inspections: 0,
        scope: SCOPE_LOCAL,
      };
      entry.inspections += 1;
      buckets.set(region, entry);
    }

    return [...buckets.values()].sort(
      (a, b) => b.complaints + b.inspections - (a.complaints + a.inspections),
    );
  },
};
