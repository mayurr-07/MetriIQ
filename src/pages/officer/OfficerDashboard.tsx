import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, FileText, ScanSearch, ShieldAlert, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Button } from "@/components/design-system/Button";
import { Card, CardDescription, CardTitle } from "@/components/design-system/Card";
import WorkflowStatusBadge from "@/components/inspection/WorkflowStatusBadge";
import { inspectionService } from "@/services/inspection/inspectionService";
import { useAuth } from "@/context/AuthContext";

const SHORTCUTS = [
  {
    to: "/officer/inspections",
    title: "Inspections",
    description: "Open saved drafts and completed local records.",
    icon: ClipboardList,
  },
  {
    to: "/officer/reviews",
    title: "AI Findings Review",
    description: "Review queue remains a later-phase module.",
    icon: UserCheck,
  },
  {
    to: "/officer/complaints",
    title: "Assigned Complaints",
    description: "Complaint investigation is not part of this phase.",
    icon: ShieldAlert,
  },
  {
    to: "/officer/reports",
    title: "Reports",
    description: "Official report generation is not connected yet.",
    icon: FileText,
  },
];

export default function OfficerDashboard() {
  const { user } = useAuth();
  const drafts = inspectionService.list();
  const resume = drafts.find((item) => item.workflowState !== "PASSED" && item.workflowState !== "FAILED");

  return (
    <div>
      <PageHeader
        crumbs={["Inspection Officer"]}
        title="Field Dashboard"
        description="Start a new inspection or resume a draft saved on this device."
        action={
          <Link to="/officer/inspections/new">
            <Button variant="primary">
              <ScanSearch className="h-4 w-4" />
              Start New Inspection
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="warm-glow">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#F59E0B]">Start an inspection</p>
          <CardTitle className="mt-2 text-[1.35rem]">Capture a packaged product</CardTitle>
          <CardDescription>
            {user?.name ?? "Officer"}, this workspace is built for field inspection. AI will assist later;
            the final decision stays with you.
          </CardDescription>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/officer/inspections/new">
              <Button variant="primary">Start New Inspection</Button>
            </Link>
            {resume ? (
              <Link to={`/officer/inspections/${resume.id}`}>
                <Button variant="secondary">Continue Inspection</Button>
              </Link>
            ) : (
              <Button variant="outline" disabled>
                No draft to continue
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">Inspection guidance</p>
          <ul className="mt-4 space-y-3 text-[0.84rem] leading-relaxed text-[#CBD5E1]">
            <li>Photograph the full principal display panel first.</li>
            <li>Keep text readable and avoid glare or cropped declarations.</li>
            <li>Review every extracted field before recording a decision.</li>
            <li>AI is assistive. Do not treat unavailable analysis as a finding.</li>
          </ul>
        </Card>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl text-[#F0F2F5]">Recent inspections</h2>
          <Link to="/officer/inspections" className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#94A3B8] hover:text-[#F59E0B]">
            View all
          </Link>
        </div>
        {drafts.length === 0 ? (
          <Card>
            <p className="font-display text-lg text-[#F0F2F5]">No inspections on this device yet</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#94A3B8]">
              Drafts are stored locally in this browser. They are not submitted to a government backend.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {drafts.slice(0, 4).map((item) => (
              <Link key={item.id} to={`/officer/inspections/${item.id}`} className="block">
                <Card interactive className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-4">
                  <div>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#64748B]">{item.reference}</p>
                    <p className="mt-1 text-[#F0F2F5]">{item.productName}</p>
                    <p className="text-[0.78rem] text-[#94A3B8]">{item.brand}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.isDemo && (
                      <span className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#F59E0B]">Demo</span>
                    )}
                    <WorkflowStatusBadge state={item.workflowState} />
                    <ArrowRight className="h-4 w-4 text-[#334155]" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl text-[#F0F2F5]">Pending reviews</h2>
        <Card>
          <p className="text-sm leading-relaxed text-[#94A3B8]">
            The assigned review queue is not connected in this phase. Use a saved inspection draft to continue officer review.
          </p>
        </Card>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="group block">
              <Card interactive className="h-full">
                <Icon className="h-4 w-4 text-[#F59E0B]" />
                <CardTitle className="mt-3 text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
