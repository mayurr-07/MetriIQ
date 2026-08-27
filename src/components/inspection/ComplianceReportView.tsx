import type { BackendReport, BackendRuleResult } from "@/types/inspection";

interface Props {
  report: BackendReport;
}

const STATUS_COLOR: Record<BackendRuleResult["status"], string> = {
  pass: "text-[#22C55E]",
  fail: "text-[#EF4444]",
  warning: "text-[#F59E0B]",
  na: "text-[#64748B]",
};

const RISK_BADGE: Record<BackendReport["riskLevel"], string> = {
  low: "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20",
  medium: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
  high: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20",
};

const STATUS_LABEL: Record<BackendReport["overallStatus"], string> = {
  compliant: "Compliant",
  partially_compliant: "Partially Compliant",
  non_compliant: "Non-Compliant",
};

function RuleRow({ rule }: { rule: BackendRuleResult }) {
  return (
    <div className="flex items-start gap-3 border-b border-white/6 py-3 last:border-0">
      <span
        className={`mt-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] ${STATUS_COLOR[rule.status]}`}
      >
        {rule.status === "na" ? "N/A" : rule.status.toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#E2E8F0]">
          <span className="mr-2 font-mono text-[0.65rem] text-[#64748B]">{rule.ruleCode}</span>
          {rule.title}
        </p>
        <p className="mt-0.5 text-xs text-[#94A3B8]">{rule.detail}</p>
      </div>
    </div>
  );
}

export default function ComplianceReportView({ report }: Props) {
  const lmRules = report.ruleResults.filter((r) => r.ruleCode.startsWith("LM"));
  const fsRules = report.ruleResults.filter((r) => r.ruleCode.startsWith("FS"));

  return (
    <div className="space-y-5">
      {/* Header strip */}
      <div className="rounded-lg border border-white/10 bg-white/4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#64748B]">
              AI Compliance Report
            </p>
            <p className="mt-0.5 text-lg font-semibold text-[#E2E8F0]">
              {STATUS_LABEL[report.overallStatus]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#E2E8F0]">{report.complianceScore}</p>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#64748B]">/ 100</p>
            </div>
            <span
              className={`rounded border px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${RISK_BADGE[report.riskLevel]}`}
            >
              {report.riskLevel} risk
            </span>
          </div>
        </div>

        {/* Rule summary counts */}
        <div className="mt-3 flex flex-wrap gap-4">
          <Pill color="fail" count={report.failedRules.length} label="Failed" />
          <Pill color="warning" count={report.warningRules.length} label="Warnings" />
          <Pill color="pass" count={report.passedRules.length} label="Passed" />
        </div>
      </div>

      {/* AI summary */}
      <div className="rounded-lg border border-white/10 bg-white/4 p-4">
        <p className="mb-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#64748B]">
          Inspector Summary
        </p>
        <p className="text-sm leading-relaxed text-[#CBD5E1]">{report.summary}</p>
      </div>

      {/* Violation categories */}
      {report.violationCategories.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-white/4 p-4">
          <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#64748B]">
            Violation Categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {report.violationCategories.map((cat) => (
              <span
                key={cat}
                className="rounded border border-[#EF4444]/20 bg-[#EF4444]/8 px-2 py-0.5 text-xs text-[#FCA5A5]"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rule results: LM */}
      {lmRules.length > 0 && (
        <RuleSection title="Legal Metrology (PC) Rules 2011" rules={lmRules} />
      )}

      {/* Rule results: FSSAI */}
      {fsRules.length > 0 && (
        <RuleSection title="FSSAI Labelling Regulations 2020" rules={fsRules} />
      )}

      <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-[#475569]">
        Report ID {report.reportId} · Generated{" "}
        {new Date(report.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}

function Pill({ color, count, label }: { color: string; count: number; label: string }) {
  const cls =
    color === "fail"
      ? "text-[#EF4444]"
      : color === "warning"
      ? "text-[#F59E0B]"
      : "text-[#22C55E]";
  return (
    <div className="flex items-baseline gap-1">
      <span className={`text-lg font-bold ${cls}`}>{count}</span>
      <span className="text-xs text-[#64748B]">{label}</span>
    </div>
  );
}

function RuleSection({ title, rules }: { title: string; rules: BackendRuleResult[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/4 p-4">
      <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#64748B]">
        {title}
      </p>
      <div>
        {rules.map((r) => (
          <RuleRow key={r.ruleCode} rule={r} />
        ))}
      </div>
    </div>
  );
}
