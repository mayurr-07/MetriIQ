import { Database, FlaskConical, PlugZap } from "lucide-react";
import { cn } from "@/utils/cn";
import type { DataScope } from "@/types/analytics";

/**
 * Renders the provenance of a figure or dataset.
 *
 * Every metric, table and chart in the Admin and Senior workspaces must be
 * accompanied by one of these so a reader can always tell whether a number is
 * a real local record count, a labelled demo dataset, or simply unavailable.
 */
export default function ScopeTag({ scope, className }: { scope: DataScope; className?: string }) {
  const Icon =
    scope.provenance === "LOCAL" ? Database : scope.provenance === "DEMO" ? FlaskConical : PlugZap;

  return (
    <span
      title={scope.note}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em]",
        scope.provenance === "LOCAL" && "border-app-border bg-app-surface/[0.03] text-app-text-secondary",
        scope.provenance === "DEMO" && "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
        scope.provenance === "UNAVAILABLE" && "border-app-border bg-app-surface/[0.02] text-app-text-secondary",
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {scope.label}
    </span>
  );
}
