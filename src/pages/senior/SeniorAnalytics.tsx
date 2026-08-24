import { PageHeader } from "@/components/design-system/PageHeader";
import MetricCard from "@/components/data/MetricCard";
import DataNotice from "@/components/data/DataNotice";
import ChartFrame from "@/components/charts/ChartFrame";
import { BarList, DistributionBar, TrendChart } from "@/components/charts/Charts";
import { analyticsService } from "@/services/analytics/analyticsService";
import { SCOPE_UNAVAILABLE } from "@/types/analytics";

export default function SeniorAnalytics() {
  const { metrics, scope } = analyticsService.dashboardMetrics();
  const complaints = analyticsService.complaintTrend();
  const inspections = analyticsService.inspectionTrend();
  const issues = analyticsService.issueDistribution();
  const states = analyticsService.inspectionStateDistribution();

  return (
    <div>
      <PageHeader
        crumbs={["Compliance Intelligence", "Analytics"]}
        title="Analytics"
        description="Volume, distribution and category analysis across recorded activity."
      />

      <DataNotice scope={scope} />

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartFrame
          title="Inspections created"
          context="Inspection records opened per month."
          scope={inspections.scope}
          isEmpty={inspections.points.length === 0}
        >
          <TrendChart points={inspections.points} accent="#38BDF8" />
        </ChartFrame>

        <ChartFrame
          title="Complaints submitted"
          context="Consumer complaints received per month."
          scope={complaints.scope}
          isEmpty={complaints.points.length === 0}
        >
          <TrendChart points={complaints.points} />
        </ChartFrame>

        <ChartFrame
          title="Issue categories"
          context="Distribution of consumer-selected issue types."
          scope={issues.items.length ? issues.scope : SCOPE_UNAVAILABLE}
          isEmpty={issues.items.length === 0}
        >
          <DistributionBar items={issues.items} />
        </ChartFrame>

        <ChartFrame
          title="Inspection workflow states"
          context="Where recorded inspections currently sit in the workflow."
          scope={states.items.length ? states.scope : SCOPE_UNAVAILABLE}
          isEmpty={states.items.length === 0}
        >
          <BarList items={states.items} accent="#A78BFA" />
        </ChartFrame>
      </section>
    </div>
  );
}
