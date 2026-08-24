import { Card } from "@/components/design-system/Card";
import { cn } from "@/utils/cn";
import type { Metric } from "@/types/analytics";

/**
 * A single dashboard figure.
 *
 * When `value` is `null` the card renders "Awaiting data" instead of a
 * placeholder number, so an unwired metric is never mistaken for a real one.
 */
export default function MetricCard({ metric }: { metric: Metric }) {
  const tone =
    metric.tone === "pass"
      ? "text-[#10B981]"
      : metric.tone === "review"
        ? "text-[#F59E0B]"
        : metric.tone === "issue"
          ? "text-[#EF4444]"
          : "text-[#F0F2F5]";

  return (
    <Card className="p-4 md:p-5">
      <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-[#94A3B8]">
        {metric.label}
      </p>
      {metric.value === null ? (
        <p className="mt-3 font-mono text-[0.78rem] text-[#64748B]">Awaiting data</p>
      ) : (
        <p className={cn("mt-2 font-display text-[2rem] leading-none tabular-nums", tone)}>
          {metric.value.toLocaleString()}
        </p>
      )}
      {metric.hint && <p className="mt-2 text-[0.72rem] text-[#64748B]">{metric.hint}</p>}
    </Card>
  );
}
