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

export function PageHeader({ crumbs, title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 border-b border-app-edge pb-5 sm:mb-8 sm:pb-7", className)}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5 overflow-x-auto">
          {crumbs.map((crumb, i) => (
            <span key={crumb} className="flex shrink-0 items-center gap-1.5">
              <span
                className={cn(
                  "font-mono text-[0.72rem] uppercase tracking-[0.14em] sm:text-[0.8rem] sm:tracking-[0.16em]",
                  i === crumbs.length - 1 ? "text-app-accent" : "text-app-ink-dim",
                )}
              >
                {crumb}
              </span>
              {i < crumbs.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-app-ink-faint" aria-hidden="true" />
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 max-w-4xl">
          <h1 className="font-display text-[1.75rem] leading-tight text-app-ink sm:text-[2.35rem] lg:text-[3.25rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-[0.98rem] leading-relaxed text-app-ink-dim sm:text-[1.08rem]">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:shrink-0 [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto">{action}</div>}
      </div>
    </div>
  );
}
