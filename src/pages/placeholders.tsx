import { Link } from "react-router-dom";
import { ArrowRight, Camera, CheckCircle2, ClipboardList, Search } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Table, TableEmptyRow } from "@/components/design-system/Table";
import { getRoleWorkspace } from "@/lib/roles";
import { getNavRoutes, type ModuleRoute } from "@/routes/moduleRoutes";
import type { Role } from "@/types";

const KIND_CAPABILITIES: Record<string, string[]> = {
  form: [
    "Step-by-step guided capture",
    "Real-time validation feedback",
    "Save progress and resume later",
  ],
  detail: [
    "Full timeline of actions taken",
    "Attached evidence and documentation",
    "Officer notes and audit trail",
  ],
  settings: [
    "Configurable thresholds and parameters",
    "Role-based access controls",
    "Change history and version tracking",
  ],
};

/**
 * Renders the correct placeholder template for a government-workspace route.
 *
 * IMPORTANT: this component never fabricates data. Dashboards link to real
 * sibling routes; list pages show real column structure with an honest
 * empty state; form/detail/settings pages describe planned capability
 * without pretending it already exists.
 */
export function ModulePlaceholderPage({ role, route }: { role: Role; route: ModuleRoute }) {
  const workspace = getRoleWorkspace(role);
  const basePath = `/${role === "INSPECTION_OFFICER" ? "officer" : role === "ADMIN" ? "admin" : "senior"}`;

  if (route.kind === "dashboard") {
    const siblings = getNavRoutes(role).filter((r) => r.path !== route.path);
    return (
      <div>
        <PageHeader crumbs={[workspace]} title={route.title} description={route.subtitle} />
        <p className="mb-4 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#64748B]">
          Quick access
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {siblings.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={`${basePath}/${item.path}`} className="group block">
                <Card interactive className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center border border-white/10 bg-white/[0.03] text-[#F59E0B]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#334155] transition group-hover:translate-x-0.5 group-hover:text-[#F59E0B]" />
                  </div>
                  <CardTitle className="mt-3 text-base">{item.navLabel}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.subtitle}</CardDescription>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  if (route.kind === "list") {
    const createHref = route.createPath ? `${basePath}/${route.createPath}` : undefined;
    return (
      <div>
        <PageHeader
          crumbs={[workspace]}
          title={route.title}
          description={route.subtitle}
          action={
            createHref ? (
              <Link to={createHref}>
                <Button variant="primary" size="sm">
                  {route.createLabel ?? "New"}
                </Button>
              </Link>
            ) : undefined
          }
        />
        <Table columns={route.columns ?? []}>
          <TableEmptyRow
            colSpan={(route.columns ?? []).length || 1}
            icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
            title="No records yet"
            description="Records will appear here once this module is connected in a later development phase."
            action={
              createHref ? (
                <Link to={createHref}>
                  <Button variant="secondary" size="sm">
                    {route.createLabel ?? "Get started"}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Table>
      </div>
    );
  }

  // form / detail / settings
  const bullets = KIND_CAPABILITIES[route.kind] ?? [];
  const Icon = route.icon;
  return (
    <div>
      <PageHeader crumbs={[workspace]} title={route.title} description={route.subtitle} />
      <Card className="mx-auto max-w-xl text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center border border-white/10 bg-white/[0.03] text-[#F59E0B]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#F59E0B]">
          Planned for a later phase
        </p>
        <p className="mx-auto mt-3 max-w-sm text-[0.86rem] leading-relaxed text-[#94A3B8]">
          This screen's structure is in place. Its functionality will be built once the
          underlying workflow is implemented.
        </p>
        <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5 text-[0.82rem] text-[#CBD5E1]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" aria-hidden="true" />
              {bullet}
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <Link to={`${basePath}/dashboard`}>
            <Button variant="outline" size="sm">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export function ConsumerReportHome() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-2 text-center">
      <div>
        <span className="eyebrow">Consumer</span>
        <h1 className="mt-3 font-display text-[2rem] leading-tight text-[#F0F2F5] sm:text-[2.4rem]">
          Something wrong with a packaged product?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[0.96rem] leading-relaxed text-[#94A3B8]">
          Tell us what you found — overcharged price, missing quantity, or an unlabelled
          package. A photo is all it takes to start.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="text-left">
          <span className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.03] text-[#F59E0B]">
            <Camera className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <CardTitle className="mt-4">Report a problem</CardTitle>
          <CardDescription>
            Upload a photo and a few details. It takes less than two minutes.
          </CardDescription>
          <div className="mt-6">
            <Link to="/report/new">
              <Button variant="primary" size="md" className="w-full">
                Start a report
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="text-left">
          <span className="grid h-10 w-10 place-items-center border border-white/10 bg-white/[0.03] text-[#F59E0B]">
            <Search className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <CardTitle className="mt-4">Track a complaint</CardTitle>
          <CardDescription>
            Already reported something? Check its progress with your reference ID.
          </CardDescription>
          <div className="mt-6">
            <Link to="/report/track">
              <Button variant="secondary" size="md" className="w-full">
                Track status
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}



