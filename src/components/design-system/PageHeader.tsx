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
    <div className={cn("mb-8 border-b border-app-edge pb-7", className)}>
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1.5">
          {crumbs.map((crumb, i) => (
            <span key={crumb} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "font-mono text-[0.8rem] uppercase tracking-[0.16em]",
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

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-4xl">
          <h1 className="font-display text-[2.7rem] leading-tight text-app-ink sm:text-[3.25rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-3xl text-[1.08rem] leading-relaxed text-app-ink-dim">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
      </div>
    </div>
  );
}
