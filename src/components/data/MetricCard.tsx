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
          : "text-app-text";

  return (
    <Card className="p-4 md:p-5">
      <p className="font-mono text-[0.76rem] uppercase tracking-[0.18em] text-app-text-secondary">
        {metric.label}
      </p>
      {metric.value === null ? (
        <p className="mt-3 font-mono text-[0.95rem] text-app-text-secondary">Awaiting data</p>
      ) : (
        <p className={cn("mt-2 font-display text-[2.25rem] leading-none tabular-nums", tone)}>
          {metric.value.toLocaleString()}
        </p>
      )}
      {metric.hint && <p className="mt-2 text-[0.92rem] text-app-text-secondary">{metric.hint}</p>}
    </Card>
  );
}
