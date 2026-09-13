import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface TableProps {
  columns: string[];
  children: ReactNode;
  className?: string;
}

export function Table({ columns, children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto border border-app-edge", className)}>
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-app-edge bg-app-ghost">
            {columns.map((col) => (
              <th
                key={col}
                scope="col"
                className="px-4 py-3 font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-app-ink-dim"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-app-edge">{children}</tbody>
      </table>
    </div>
  );
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("transition-colors hover:bg-app-hover", className)}>{children}</tr>
  );
}

export function TableCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3.5 align-middle text-[0.885rem] text-app-ink", className)}>
      {children}
    </td>
  );
}

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
            <div className="grid h-12 w-12 place-items-center border border-app-edge-mid bg-app-ghost text-app-accent">
              {icon}
            </div>
          )}
          <p className="mt-4 font-display text-[1.125rem] text-app-ink">{title}</p>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-app-ink-dim">{description}</p>
          {action && <div className="mt-5">{action}</div>}
        </div>
      </td>
    </tr>
  );
}
