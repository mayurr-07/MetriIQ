import { PageHeader } from "@/components/design-system/PageHeader";
import { Card } from "@/components/design-system/Card";
import DataNotice from "@/components/data/DataNotice";
import ChartFrame from "@/components/charts/ChartFrame";
import { BarList } from "@/components/charts/Charts";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import { analyticsService } from "@/services/analytics/analyticsService";
import { SCOPE_UNAVAILABLE, type CategoryCount } from "@/types/analytics";
import { ShieldCheck } from "lucide-react";

export default function SeniorCompliance() {
  const rules = analyticsService.complianceMetrics();
  const scope = rules[0]?.scope ?? SCOPE_UNAVAILABLE;
  const observed = rules.filter((r) => r.observed > 0);

  const chartItems: CategoryCount[] = observed.map((r) => ({
    key: r.ruleId,
    label: r.title,
    count: r.observed,
  }));

  return (
    <div>
      <PageHeader
        crumbs={["Compliance Intelligence", "Compliance"]}
        title="Compliance"
        description="Declaration-level observations across recorded inspections."
      />

      <DataNotice scope={scope} />

      <div className="mt-4 flex items-start gap-3 border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-[0.8rem] leading-relaxed text-[#94A3B8]">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#94A3B8]">
            Terminology ·{" "}
          </span>
          Items below are <strong className="text-[#E2E8F0]">detected patterns</strong>. A pattern
          only becomes a confirmed contravention once an officer records a final decision.
        </p>
      </div>

      <div className="mt-4">
        <ChartFrame
          title="Declarations observed"
          context="How often each rule has been evaluated during an inspection."
          scope={chartItems.length ? scope : SCOPE_UNAVAILABLE}
          isEmpty={chartItems.length === 0}
          emptyMessage="No compliance observations yet"
        >
          <BarList items={chartItems} accent="#10B981" />
        </ChartFrame>
      </div>

      <Card className="mt-4 p-0">
        <Table columns={["Rule", "Reference", "Observed", "Officer-confirmed"]}>
          {rules.length === 0 ? (
            <TableEmptyRow
              colSpan={4}
              icon={<ShieldCheck className="h-5 w-5" />}
              title="No rules loaded"
              description="The rule registry could not be read."
            />
          ) : (
            rules.map((rule) => (
              <TableRow key={rule.ruleId}>
                <TableCell>{rule.title}</TableCell>
                <TableCell className="font-mono text-[0.7rem] text-[#94A3B8]">{rule.ruleCode}</TableCell>
                <TableCell className="font-mono text-[0.72rem] tabular-nums text-[#E2E8F0]">
                  {rule.observed}
                </TableCell>
                <TableCell
                  className={`font-mono text-[0.72rem] tabular-nums ${
                    rule.confirmed > 0 ? "text-[#EF4444]" : "text-[#64748B]"
                  }`}
                >
                  {rule.confirmed}
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
}
