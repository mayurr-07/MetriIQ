import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import DataNotice from "@/components/data/DataNotice";
import { ruleService } from "@/services/admin/registryService";
import { cn } from "@/utils/cn";

export default function AdminRules() {
  const { rules, scope } = ruleService.list();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Rules"]}
        title="Rules"
        description="Applicable rules are centrally managed and versioned so the compliance engine stays configurable."
        action={
          <Button variant="primary" size="sm" disabled title="Requires the rule authoring service">
            New rule
          </Button>
        }
      />

      <DataNotice scope={scope} />

      <div className="my-4 flex items-start gap-3 border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-[0.8rem] leading-relaxed text-[#94A3B8]">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#94A3B8]">
            Source reference ·{" "}
          </span>
          No authoritative gazette or statutory source is connected. Rule text below is the
          development rule set used by the compliance interface and must not be cited as law.
        </p>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => {
          const open = openId === rule.id;
          return (
            <Card key={rule.id} className="p-0">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : rule.id)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 p-4 text-left md:p-5"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Layers className="h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9rem] text-[#F0F2F5]">{rule.title}</span>
                    <span className="mt-0.5 block font-mono text-[0.62rem] text-[#94A3B8]">
                      {rule.code} · {rule.version}
                    </span>
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="hidden border border-[#10B981]/35 bg-[#10B981]/10 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#10B981] sm:inline">
                    {rule.status}
                  </span>
                  <ChevronDown
                    className={cn("h-4 w-4 text-[#64748B] transition-transform", open && "rotate-180")}
                    aria-hidden="true"
                  />
                </span>
              </button>

              {open && (
                <div className="border-t border-white/8 p-4 md:p-5">
                  <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    <div>
                      <dt className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#64748B]">
                        Requirement
                      </dt>
                      <dd className="mt-1 text-[0.84rem] leading-relaxed text-[#E2E8F0]">
                        {rule.requirement}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#64748B]">
                        Applicable category
                      </dt>
                      <dd className="mt-1 text-[0.84rem] text-[#E2E8F0]">{rule.applicableCategory}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#64748B]">
                        Effective date
                      </dt>
                      <dd className="mt-1 font-mono text-[0.78rem] text-[#94A3B8]">
                        {rule.effectiveDate ?? "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#64748B]">
                        Source reference
                      </dt>
                      <dd className="mt-1 font-mono text-[0.78rem] text-[#F59E0B]">
                        {rule.sourceReference ?? "Reference source not connected"}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
