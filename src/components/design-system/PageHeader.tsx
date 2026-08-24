import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export interface Crumb {
  label: string;
}

export interface PageHeaderProps {
  /** Breadcrumb trail, e.g. ["Inspection Officer", "Inspections"]. Last item is the current page. */
  crumbs?: string[];
  title: string;
  description?: string;
  /** Primary action, e.g. a "New Inspection" button. */
  action?: ReactNode;
  className?: string;
}

/**
 * Standard page header used across every module screen.
 *
 * Establishes one consistent information hierarchy — breadcrumb context,
 * title, supporting description and an optional primary action — so every
 * screen in the application reads as part of the same product.
 */
export function PageHeader({ crumbs, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-7 border-b border-white/8 pb-6", className)}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2.5 flex items-center gap-1.5">
          {crumbs.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-mono text-[0.62rem] uppercase tracking-[0.18em]",
                  i === crumbs.length - 1 ? "text-[#F59E0B]" : "text-[#64748B]",
                )}
              >
                {crumb}
              </span>
              {i < crumbs.length - 1 && (
                <ChevronRight className="h-3 w-3 text-[#334155]" aria-hidden="true" />
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[1.7rem] leading-tight text-[#F0F2F5] sm:text-[2rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-[0.9rem] leading-relaxed text-[#94A3B8]">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
      </div>
    </div>
  );
}
