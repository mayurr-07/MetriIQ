import { getComplaintStatusConfig } from "@/lib/status";
import type { ComplaintStatus } from "@/types/complaint";
import { cn } from "@/utils/cn";

/**
 * Complaint status badge.
 *
 * Always pairs an icon and a text label with the semantic colour so status is
 * never conveyed by colour alone. Inspection workflow state has its own badge
 * in `@/components/inspection/WorkflowStatusBadge`.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: ComplaintStatus;
  className?: string;
}) {
  const config = getComplaintStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em]",
        config.badgeClass,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {config.label}
    </span>
  );
}
