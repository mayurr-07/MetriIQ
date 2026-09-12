import { Info } from "lucide-react";
import type { DataScope } from "@/types/analytics";

/**
 * Page-level statement describing where the data on screen comes from.
 *
 * Placed near the top of every Admin and Senior page so the limits of the
 * current development environment are stated before any figure is read.
 */
export default function DataNotice({ scope }: { scope: DataScope }) {
  return (
    <div className="flex items-start gap-3 border border-app-border bg-app-surface/[0.02] px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
      <div>
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-app-text-secondary">
          {scope.label}
        </p>
        <p className="mt-1 text-[0.85rem] leading-relaxed text-app-text-secondary">{scope.note}</p>
      </div>
    </div>
  );
}
