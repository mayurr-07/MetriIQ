import { WORKFLOW_STATUS } from "@/lib/inspectionStatus";
import type { InspectionWorkflowState } from "@/types/inspection";
import { cn } from "@/utils/cn";

export default function WorkflowStatusBadge({ state }: { state: InspectionWorkflowState }) {
  const config = WORKFLOW_STATUS[state];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em]", config.badgeClass)}>
      <Icon className={cn("h-3 w-3", state === "PROCESSING" && "animate-spin")} aria-hidden="true" />
      {config.label}
    </span>
  );
}
