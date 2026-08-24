import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Search, FileEdit } from "lucide-react";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";

export default function ConsumerSuccess() {
  const [searchParams] = useSearchParams();
  const complaintId = searchParams.get("id") || "CMP-2026-000000";

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center py-6">
      <span className="mx-auto grid h-16 w-16 place-items-center border border-[#10B981]/35 bg-[#10B981]/10 text-[#10B981] rounded-full">
        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
      </span>

      <div>
        <span className="eyebrow">Submission Confirmed</span>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#F0F2F5]">
          Complaint Lodged Successfully
        </h1>
        <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
          Your report has been received and logged into the Rajasthan Legal Metrology Citizen Registry.
        </p>
      </div>

      <Card className="text-left bg-[#0E1521] border-[#10B981]/20">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#10B981]">
          Development / Demo Complaint Reference ID
        </p>
        <h2 className="mt-2 font-mono text-2xl text-[#F0F2F5] font-semibold tracking-tight">
          {complaintId}
        </h2>
        <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
          This ID was generated locally in the development environment. Use this reference ID to track
          investigation updates at any time.
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to={`/report/track?id=${complaintId}`}>
          <Button variant="primary" className="w-full">
            <Search className="h-4 w-4" />
            Track Status
          </Button>
        </Link>
        <Link to="/report/new">
          <Button variant="secondary" className="w-full">
            <FileEdit className="h-4 w-4" />
            File another report
          </Button>
        </Link>
      </div>

      <div className="pt-4">
        <Link to="/report" className="font-mono text-xs uppercase tracking-wider text-[#64748B] hover:text-[#F59E0B] inline-flex items-center gap-1.5 transition">
          Back to Consumer Portal Home
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
