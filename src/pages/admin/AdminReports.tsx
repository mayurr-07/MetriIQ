import { FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import DataNotice from "@/components/data/DataNotice";
import { SCOPE_UNAVAILABLE } from "@/types/analytics";

const CATEGORIES = [
  { title: "Inspection summary", description: "Inspection volume, outcomes and officer decisions for a period." },
  { title: "Violation summary", description: "Findings grouped by rule, severity and evidential status." },
  { title: "Complaint summary", description: "Consumer complaint volume, categories and resolution outcomes." },
  { title: "Compliance summary", description: "Declaration-level compliance observations across products." },
  { title: "Officer activity", description: "Inspections and case actions recorded per officer." },
  { title: "Product & manufacturer", description: "Records grouped by commodity and packer." },
];

export default function AdminReports() {
  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Reports"]}
        title="Reports"
        description="Prepare departmental returns. Generation and export connect in a later phase."
      />

      <DataNotice scope={SCOPE_UNAVAILABLE} />

      <div className="mt-4 flex items-start gap-3 border border-[#F59E0B]/30 bg-[#F59E0B]/8 px-4 py-3">
        <p className="text-[0.8rem] leading-relaxed text-[#F0F2F5]/90">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#F59E0B]">
            Not official ·{" "}
          </span>
          No report generation service is connected. Nothing produced here would constitute an
          official government return.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Card key={category.title} className="flex h-full flex-col">
            <FileSpreadsheet className="h-4 w-4 text-[#F59E0B]" aria-hidden="true" />
            <CardTitle className="mt-3 text-base">{category.title}</CardTitle>
            <CardDescription className="flex-1">{category.description}</CardDescription>
            <div className="mt-5">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full"
                title="Requires the report generation service"
              >
                Generate
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
