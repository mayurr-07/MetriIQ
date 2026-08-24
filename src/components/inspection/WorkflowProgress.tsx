import { Check } from "lucide-react";
import { INSPECTION_STEPS } from "@/types/inspection";
import { cn } from "@/utils/cn";

export default function WorkflowProgress({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Inspection progress">
      {INSPECTION_STEPS.map((step) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <li key={step.id} className="min-w-0">
            <div
              className={cn(
                "flex items-center gap-2 border px-2 py-2 sm:px-3",
                done && "border-[#10B981]/30 bg-[#10B981]/8",
                active && "border-[#F59E0B]/40 bg-[#F59E0B]/10",
                !done && !active && "border-white/8 bg-white/[0.02]",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 shrink-0 place-items-center font-mono text-[0.62rem]",
                  done && "bg-[#10B981]/20 text-[#10B981]",
                  active && "bg-[#F59E0B]/20 text-[#F59E0B]",
                  !done && !active && "bg-white/5 text-[#64748B]",
                )}
                aria-hidden="true"
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step.id}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate font-mono text-[0.58rem] uppercase tracking-[0.14em]",
                    active ? "text-[#F59E0B]" : done ? "text-[#10B981]" : "text-[#64748B]",
                  )}
                >
                  {step.title}
                </span>
                <span className="hidden truncate text-[0.68rem] text-[#94A3B8] sm:block">{step.caption}</span>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
