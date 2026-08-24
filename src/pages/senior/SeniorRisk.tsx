import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/design-system/Card";
import DataNotice from "@/components/data/DataNotice";
import { RiskBadge } from "@/components/charts/Charts";
import { riskService } from "@/services/analytics/riskService";
import { SCOPE_LOCAL, SCOPE_UNAVAILABLE } from "@/types/analytics";

export default function SeniorRisk() {
  const [subject, setSubject] = useState<"ALL" | "PRODUCT" | "REGION">("ALL");
  const signals = riskService.signals();
  const priorities = riskService.priorities();

  const filtered = useMemo(
    () => (subject === "ALL" ? signals : signals.filter((s) => s.subjectType === subject)),
    [signals, subject],
  );

  return (
    <div>
      <PageHeader
        crumbs={["Compliance Intelligence", "Risk"]}
        title="Risk"
        description="Explainable risk indicators assembled from complaints, inspections and confirmed findings."
      />

      <DataNotice scope={signals.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE} />

      <div className="mt-4 flex items-start gap-3 border border-[#F59E0B]/30 bg-[#F59E0B]/8 px-4 py-3">
        <p className="text-[0.8rem] leading-relaxed text-[#F0F2F5]/90">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#F59E0B]">
            Advisory only ·{" "}
          </span>
          Risk bands are an analytical aid for authorised officials. They are derived from visible
          counts, carry no hidden score, and never trigger enforcement automatically.
        </p>
      </div>

      <div className="my-4">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value as typeof subject)}
          className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
        >
          <option value="ALL">All subjects</option>
          <option value="PRODUCT">Products</option>
          <option value="REGION">Regions</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="py-14 text-center">
          <ShieldAlert className="mx-auto h-6 w-6 text-[#475569]" aria-hidden="true" />
          <p className="mt-3 text-sm text-[#F0F2F5]">No risk signals available yet</p>
          <p className="mx-auto mt-1 max-w-sm text-[0.78rem] leading-relaxed text-[#64748B]">
            Signals are generated from recorded complaints and officer-confirmed findings.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((signal) => (
            <Card key={signal.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#64748B]">
                    {signal.subjectType}
                  </p>
                  <CardTitle className="mt-1 truncate text-base">{signal.subject}</CardTitle>
                </div>
                <RiskBadge level={signal.level} />
              </div>

              <ul className="mt-4 space-y-1.5">
                {signal.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-2 text-[0.8rem] text-[#CBD5E1]">
                    <span className="mt-1.5 h-1 w-1 shrink-0 bg-[#F59E0B]" aria-hidden="true" />
                    {reason}
                  </li>
                ))}
              </ul>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/8 pt-3">
                <div>
                  <dt className="font-mono text-[0.54rem] uppercase tracking-[0.16em] text-[#64748B]">
                    Complaints
                  </dt>
                  <dd className="mt-1 font-mono text-[0.9rem] tabular-nums text-[#F0F2F5]">
                    {signal.complaintCount}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.54rem] uppercase tracking-[0.16em] text-[#64748B]">
                    Inspections
                  </dt>
                  <dd className="mt-1 font-mono text-[0.9rem] tabular-nums text-[#F0F2F5]">
                    {signal.inspectionCount}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.54rem] uppercase tracking-[0.16em] text-[#64748B]">
                    Confirmed
                  </dt>
                  <dd className="mt-1 font-mono text-[0.9rem] tabular-nums text-[#EF4444]">
                    {signal.confirmedFindingCount}
                  </dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
          Priority inspection signals
        </h2>
        {priorities.length === 0 ? (
          <Card>
            <p className="text-[0.82rem] leading-relaxed text-[#64748B]">
              No cases currently warrant prioritisation.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {priorities.map((item) => (
              <Card key={item.id} className="p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-[0.95rem]">{item.subject}</CardTitle>
                    <CardDescription>Review priority — officer decision required</CardDescription>
                  </div>
                  <RiskBadge level={item.signalStrength} />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {item.rationale.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-[0.8rem] text-[#CBD5E1]">
                      <span className="mt-1.5 h-1 w-1 shrink-0 bg-[#F59E0B]" aria-hidden="true" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
