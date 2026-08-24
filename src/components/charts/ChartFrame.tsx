import type { ReactNode } from "react";
import { BarChart2 } from "lucide-react";
import { Card } from "@/components/design-system/Card";
import ScopeTag from "@/components/data/ScopeTag";
import type { DataScope } from "@/types/analytics";

/**
 * Shared wrapper for every chart.
 *
 * Guarantees each visualisation carries a title, contextual sub-line, an
 * explicit data-provenance tag and a genuine empty state — so a chart can
 * never imply data it does not have.
 */
export default function ChartFrame({
  title,
  context,
  scope,
  isEmpty,
  emptyMessage = "No data available yet",
  children,
}: {
  title: string;
  context?: string;
  scope: DataScope;
  isEmpty: boolean;
  emptyMessage?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/8 pb-3">
        <div className="min-w-0">
          <h3 className="font-display text-base text-[#F0F2F5]">{title}</h3>
          {context && <p className="mt-1 text-[0.76rem] leading-relaxed text-[#94A3B8]">{context}</p>}
        </div>
        <ScopeTag scope={scope} />
      </div>

      {isEmpty ? (
        <div className="grid place-items-center py-12 text-center">
          <BarChart2 className="h-6 w-6 text-[#475569]" aria-hidden="true" />
          <p className="mt-3 text-sm text-[#F0F2F5]">{emptyMessage}</p>
          <p className="mt-1 max-w-xs text-[0.76rem] leading-relaxed text-[#64748B]">{scope.note}</p>
        </div>
      ) : (
        <div className="mt-5">{children}</div>
      )}
    </Card>
  );
}
