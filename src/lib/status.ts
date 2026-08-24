import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { ComplaintStatus } from "@/types/complaint";

/**
 * Complaint status presentation — the single source of truth.
 *
 * Inspection status is intentionally NOT handled here. Inspections use
 * `InspectionWorkflowState` with its own presentation map in
 * `@/lib/inspectionStatus`. A second, competing inspection vocabulary existed
 * until the Phase 5 audit and was removed.
 */
export type StatusTone = "pass" | "review" | "issue" | "info" | "neutral" | "warning" | "danger";

export interface StatusConfig {
  label: string;
  tone: StatusTone;
  badgeClass: string;
  dotClass: string;
  icon: LucideIcon;
}

export function getComplaintStatusConfig(status: ComplaintStatus): StatusConfig {
  switch (status) {
    case "SUBMITTED":
      return {
        label: "Submitted",
        tone: "neutral",
        badgeClass: "border-white/15 bg-white/5 text-[#94A3B8]",
        dotClass: "bg-[#94A3B8]",
        icon: Clock,
      };
    case "UNDER_REVIEW":
      return {
        label: "Under Review",
        tone: "review",
        badgeClass: "border-[#F59E0B]/35 bg-[#F59E0B]/10 text-[#F59E0B]",
        dotClass: "bg-[#F59E0B]",
        icon: Clock,
      };
    case "MORE_INFORMATION_REQUIRED":
      return {
        label: "More Info Required",
        tone: "warning",
        badgeClass: "border-[#F59E0B]/40 bg-[#F59E0B]/8 text-[#F59E0B]",
        dotClass: "bg-[#F59E0B]",
        icon: AlertTriangle,
      };
    case "EVIDENCE_VERIFIED":
      return {
        label: "Evidence Verified",
        tone: "pass",
        badgeClass: "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]",
        dotClass: "bg-[#10B981]",
        icon: ShieldCheck,
      };
    case "INSPECTION_RECOMMENDED":
      return {
        label: "Inspection Recommended",
        tone: "review",
        badgeClass: "border-[#F59E0B]/45 bg-[#F59E0B]/10 text-[#F59E0B]",
        dotClass: "bg-[#F59E0B]",
        icon: ShieldAlert,
      };
    case "INSPECTION_IN_PROGRESS":
      return {
        label: "Inspection In Progress",
        tone: "info",
        badgeClass: "border-blue-500/35 bg-blue-500/10 text-blue-400",
        dotClass: "bg-blue-400",
        icon: Loader2,
      };
    case "RESOLVED":
      return {
        label: "Resolved",
        tone: "pass",
        badgeClass: "border-[#10B981]/35 bg-[#10B981]/10 text-[#10B981]",
        dotClass: "bg-[#10B981]",
        icon: CheckCircle2,
      };
    case "ESCALATED":
      return {
        label: "Escalated",
        tone: "issue",
        badgeClass: "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]",
        dotClass: "bg-[#EF4444]",
        icon: AlertTriangle,
      };
    case "REJECTED":
      return {
        label: "Rejected",
        tone: "danger",
        badgeClass: "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]",
        dotClass: "bg-[#EF4444]",
        icon: XCircle,
      };
    default:
      return {
        label: String(status),
        tone: "neutral",
        badgeClass: "border-white/15 bg-white/5 text-[#94A3B8]",
        dotClass: "bg-[#94A3B8]",
        icon: HelpCircle,
      };
  }
}
