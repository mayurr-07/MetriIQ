import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import DataNotice from "@/components/data/DataNotice";
import { adminService } from "@/services/admin/adminService";
import { SCOPE_LOCAL, SCOPE_UNAVAILABLE } from "@/types/analytics";
import { cn } from "@/utils/cn";

const ORIGIN_STYLE = {
  AI_FINDING: "border-white/15 bg-white/5 text-[#94A3B8]",
  OFFICER_CONFIRMED: "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
  FINAL_DECISION: "border-[#EF4444]/45 bg-[#EF4444]/10 text-[#EF4444]",
} as const;

const ORIGIN_LABEL = {
  AI_FINDING: "AI finding",
  OFFICER_CONFIRMED: "Officer reviewed",
  FINAL_DECISION: "Final decision",
} as const;

export default function AdminViolations() {
  const [origin, setOrigin] = useState<"ALL" | keyof typeof ORIGIN_LABEL>("ALL");
  const rows = adminService.listViolations();

  const filtered = useMemo(
    () => (origin === "ALL" ? rows : rows.filter((r) => r.origin === origin)),
    [origin, rows],
  );

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Violations"]}
        title="Violations"
        description="Findings recorded against inspections, separated by evidential status."
      />

      <DataNotice scope={rows.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE} />

      <div className="my-4 flex items-start gap-3 border border-[#EF4444]/25 bg-[#EF4444]/8 px-4 py-3">
        <p className="text-[0.8rem] leading-relaxed text-[#F0F2F5]/90">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#EF4444]">
            Evidential status ·{" "}
          </span>
          An <strong>AI finding</strong> is a signal only. It becomes a contravention solely when an
          authorised officer records a final decision. AI output is never treated as a legal
          determination.
        </p>
      </div>

      <div className="mb-4">
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value as typeof origin)}
          className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
        >
          <option value="ALL">All findings</option>
          <option value="AI_FINDING">AI findings only</option>
          <option value="OFFICER_CONFIRMED">Officer reviewed</option>
          <option value="FINAL_DECISION">Final decisions</option>
        </select>
      </div>

      <Table columns={["Finding", "Rule", "Severity", "Status", "Product", "Inspection"]}>
        {filtered.length === 0 ? (
          <TableEmptyRow
            colSpan={6}
            icon={<ShieldCheck className="h-5 w-5" />}
            title="No findings recorded"
            description="Findings raised during an inspection will be listed here with their evidential status."
          />
        ) : (
          filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.title}</TableCell>
              <TableCell className="font-mono text-[0.7rem] text-[#94A3B8]">{row.ruleReference}</TableCell>
              <TableCell className="font-mono text-[0.7rem] text-[#94A3B8]">{row.severity}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center border px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.16em]",
                    ORIGIN_STYLE[row.origin],
                  )}
                >
                  {ORIGIN_LABEL[row.origin]}
                </span>
              </TableCell>
              <TableCell className="text-[0.78rem] text-[#94A3B8]">{row.productName}</TableCell>
              <TableCell>
                <Link
                  to={`/officer/inspections/${row.inspectionDraftId}`}
                  className="font-mono text-[0.66rem] text-[#F59E0B]"
                >
                  {row.inspectionId}
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}
