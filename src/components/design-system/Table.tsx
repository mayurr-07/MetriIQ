import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface TableProps {
  columns: string[];
  children: ReactNode;
  className?: string;
}

/**
 * Operational table shell.
 *
 * Renders real column headers so a module's data shape is communicated even
 * before any records exist. Horizontal scroll on narrow viewports keeps the
 * table usable instead of forcing a cramped, illegible layout.
 */
export function Table({ columns, children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto border border-slate-200", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-white/[0.02]">
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="px-4 py-3 font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-slate-500"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6">{children}</tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("transition-colors hover:bg-white/[0.025]", className)}>{children}</tr>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3.5 align-middle text-[0.885rem] text-[#E2E8F0]", className)}>
      {children}
    </td>
  );
}

/**
 * A full-width empty row communicating (1) what's empty, (2) why, and
 * (3) what to do next — never a bare "No data found."
 */
export function TableEmptyRow({
  colSpan,
  icon,
  title,
  description,
  action,
}: {
  colSpan: number;
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          {icon && (
            <div className="grid h-12 w-12 place-items-center border border-slate-200 bg-white/[0.03] text-[#F59E0B]">
              {icon}
            </div>
          )}
          <p className="mt-4 font-display text-[1.125rem] text-slate-900">{title}</p>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-slate-500">{description}</p>
          {action && <div className="mt-5">{action}</div>}
        </div>
      </td>
    </tr>
  );
}
