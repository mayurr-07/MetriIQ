import { Link } from "react-router-dom";
import { ArrowRight, BarChart2, ShieldAlert, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/design-system/Card";
import MetricCard from "@/components/data/MetricCard";
import DataNotice from "@/components/data/DataNotice";
import ChartFrame from "@/components/charts/ChartFrame";
import { RegionDensity, RiskBadge, TrendChart } from "@/components/charts/Charts";
import { analyticsService } from "@/services/analytics/analyticsService";
import { riskService } from "@/services/analytics/riskService";
import { SCOPE_UNAVAILABLE } from "@/types/analytics";

export default function SeniorDashboard() {
  const { metrics, scope } = analyticsService.dashboardMetrics();
  const complaints = analyticsService.complaintTrend();
  const geography = analyticsService.geography();
  const signals = riskService.signals().slice(0, 4);
  const priorities = riskService.priorities().slice(0, 4);

  return (
    <div>
      <PageHeader
        crumbs={["Compliance Intelligence"]}
        title="Compliance Intelligence"
        description="Strategic view of enforcement signals, risk indicators and regional patterns."
      />

      <DataNotice scope={scope} />

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.slice(0, 3).map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartFrame
          title="Complaint volume"
          context="Consumer complaints recorded per month."
          scope={complaints.scope}
          isEmpty={complaints.points.length === 0}
        >
          <TrendChart points={complaints.points} />
        </ChartFrame>

        <ChartFrame
          title="Regional activity"
          context="Complaint and inspection density by reported area."
          scope={geography.length ? geography[0].scope : SCOPE_UNAVAILABLE}
          isEmpty={geography.length === 0}
          emptyMessage="No regional data available yet"
        >
          <RegionDensity rows={geography} />
        </ChartFrame>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="text-base">Risk signals</CardTitle>
          <CardDescription>
            Explainable indicators derived from recorded complaints and confirmed findings.
          </CardDescription>
          {signals.length === 0 ? (
            <p className="mt-4 text-[0.82rem] leading-relaxed text-[#64748B]">
              No risk signals yet. Signals appear once complaints or findings are recorded.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {signals.map((signal) => (
                <li key={signal.id} className="border-b border-white/6 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="truncate text-[0.86rem] text-[#F0F2F5]">{signal.subject}</span>
                    <RiskBadge level={signal.level} />
                  </div>
                  <p className="mt-1 text-[0.76rem] text-[#94A3B8]">{signal.reasons[0]}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5">
            <Link to="/senior/risk" className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]">
              Open risk analysis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        <Card>
          <CardTitle className="text-base">Review priorities</CardTitle>
          <CardDescription>
            Advisory prompts for an authorised officer. The platform never schedules inspections.
          </CardDescription>
          {priorities.length === 0 ? (
            <p className="mt-4 text-[0.82rem] leading-relaxed text-[#64748B]">
              No outstanding cases require prioritisation.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {priorities.map((item) => (
                <li key={item.id} className="border-b border-white/6 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="truncate text-[0.84rem] text-[#F0F2F5]">{item.subject}</span>
                    <RiskBadge level={item.signalStrength} />
                  </div>
                  <p className="mt-1 text-[0.76rem] text-[#94A3B8]">{item.rationale[0]}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { to: "/senior/analytics", label: "Analytics", icon: BarChart2 },
          { to: "/senior/compliance", label: "Compliance", icon: TrendingUp },
          { to: "/senior/trends", label: "Trends", icon: ShieldAlert },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="group block">
              <Card interactive className="flex items-center justify-between gap-3 p-4 md:p-4">
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
                  <span className="text-[0.84rem] text-[#E2E8F0]">{item.label}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#334155] transition group-hover:translate-x-0.5 group-hover:text-[#F59E0B]" />
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
