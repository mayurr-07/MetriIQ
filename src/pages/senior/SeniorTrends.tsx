import { useMemo, useState } from "react";
import { PageHeader } from "@/components/design-system/PageHeader";
import DataNotice from "@/components/data/DataNotice";
import ChartFrame from "@/components/charts/ChartFrame";
import { BarList, RegionDensity, TrendChart } from "@/components/charts/Charts";
import { analyticsService } from "@/services/analytics/analyticsService";
import { SCOPE_UNAVAILABLE } from "@/types/analytics";

export default function SeniorTrends() {
  const [region, setRegion] = useState("ALL");

  const complaints = analyticsService.complaintTrend();
  const inspections = analyticsService.inspectionTrend();
  const issues = analyticsService.issueDistribution();
  const geography = analyticsService.geography();

  const regions = useMemo(() => ["ALL", ...geography.map((g) => g.region)], [geography]);
  const filteredGeography = useMemo(
    () => (region === "ALL" ? geography : geography.filter((g) => g.region === region)),
    [geography, region],
  );

  const scope = complaints.points.length || inspections.points.length ? complaints.scope : SCOPE_UNAVAILABLE;

  return (
    <div>
      <PageHeader
        crumbs={["Compliance Intelligence", "Trends"]}
        title="Trends"
        description="Activity over time across complaints, inspections and issue categories."
      />

      <DataNotice scope={scope} />

      <div className="my-4 flex flex-col gap-3 sm:flex-row">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#94A3B8]">
            Region
          </span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === "ALL" ? "All regions" : r}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#94A3B8]">
            Period
          </span>
          <select
            disabled
            className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none disabled:opacity-60"
          >
            <option>All recorded months</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame
          title="Complaints over time"
          context="Monthly complaint volume from recorded submissions."
          scope={complaints.scope}
          isEmpty={complaints.points.length === 0}
        >
          <TrendChart points={complaints.points} />
        </ChartFrame>

        <ChartFrame
          title="Inspections over time"
          context="Monthly inspection volume from recorded drafts."
          scope={inspections.scope}
          isEmpty={inspections.points.length === 0}
        >
          <TrendChart points={inspections.points} accent="#38BDF8" />
        </ChartFrame>

        <ChartFrame
          title="Issue category trend"
          context="Which issue categories consumers report most often."
          scope={issues.items.length ? issues.scope : SCOPE_UNAVAILABLE}
          isEmpty={issues.items.length === 0}
        >
          <BarList items={issues.items} />
        </ChartFrame>

        <ChartFrame
          title="Regional distribution"
          context="Complaint and inspection counts by area."
          scope={filteredGeography.length ? filteredGeography[0].scope : SCOPE_UNAVAILABLE}
          isEmpty={filteredGeography.length === 0}
          emptyMessage="No regional data available yet"
        >
          <RegionDensity rows={filteredGeography} />
        </ChartFrame>
      </div>
    </div>
  );
}
