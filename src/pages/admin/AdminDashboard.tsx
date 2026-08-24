import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Building,
  FileSpreadsheet,
  Globe,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/design-system/Card";
import MetricCard from "@/components/data/MetricCard";
import DataNotice from "@/components/data/DataNotice";
import { analyticsService } from "@/services/analytics/analyticsService";
import { adminService } from "@/services/admin/adminService";

const QUICK_ACTIONS = [
  { to: "/admin/officers", label: "Manage Officers", icon: Users },
  { to: "/admin/inspections", label: "Review Inspections", icon: Activity },
  { to: "/admin/complaints", label: "Review Complaints", icon: ShieldAlert },
  { to: "/admin/products", label: "Manage Products", icon: Globe },
  { to: "/admin/manufacturers", label: "Manage Manufacturers", icon: Building },
  { to: "/admin/rules", label: "Manage Rules", icon: Layers },
  { to: "/admin/reports", label: "View Reports", icon: FileSpreadsheet },
  { to: "/admin/audit-logs", label: "View Audit Logs", icon: ShieldCheck },
];

export default function AdminDashboard() {
  const { metrics, scope } = analyticsService.dashboardMetrics();
  const events = adminService.listAuditEvents().slice(0, 6);
  const counts = adminService.counts();

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations"]}
        title="Admin Dashboard"
        description="Department-wide oversight of inspections, complaints and reference data."
      />

      <DataNotice scope={scope} />

      <section className="mt-6">
        <h2 className="mb-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
          Operational overview
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardTitle className="text-base">Pending work</CardTitle>
          <CardDescription>Items that still require a departmental or officer action.</CardDescription>
          <ul className="mt-4 space-y-2.5">
            <li className="flex items-center justify-between gap-3 border-b border-white/6 pb-2.5 text-[0.84rem]">
              <span className="text-[#CBD5E1]">Inspections awaiting a decision</span>
              <Link to="/admin/inspections" className="font-mono text-[0.72rem] tabular-nums text-[#F59E0B]">
                {counts.pendingDecisions}
              </Link>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-white/6 pb-2.5 text-[0.84rem]">
              <span className="text-[#CBD5E1]">Open consumer complaints</span>
              <Link to="/admin/complaints" className="font-mono text-[0.72rem] tabular-nums text-[#F59E0B]">
                {counts.openComplaints}
              </Link>
            </li>
            <li className="flex items-center justify-between gap-3 text-[0.84rem]">
              <span className="text-[#CBD5E1]">Complaints linked to an inspection</span>
              <span className="font-mono text-[0.72rem] tabular-nums text-[#10B981]">{counts.linkedCases}</span>
            </li>
          </ul>
        </Card>

        <Card>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>Reconstructed from recorded inspection and complaint events.</CardDescription>
          {events.length === 0 ? (
            <p className="mt-4 text-[0.82rem] leading-relaxed text-[#64748B]">
              No activity has been recorded on this device yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {events.map((event) => (
                <li key={event.id} className="border-b border-white/6 pb-2.5 last:border-0 last:pb-0">
                  <p className="font-mono text-[0.58rem] text-[#64748B]">
                    {new Date(event.timestamp).toLocaleString()} · {event.actor}
                  </p>
                  <p className="mt-0.5 text-[0.82rem] text-[#E2E8F0]">{event.result}</p>
                  <p className="font-mono text-[0.62rem] text-[#94A3B8]">{event.entityId}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} className="group block">
                <Card interactive className="flex h-full items-center justify-between gap-3 p-4 md:p-4">
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
                    <span className="truncate text-[0.84rem] text-[#E2E8F0]">{action.label}</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#334155] transition group-hover:translate-x-0.5 group-hover:text-[#F59E0B]" />
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
