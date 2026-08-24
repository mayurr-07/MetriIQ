import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileEdit,
  Loader2,
  ScanSearch,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { InspectionDecision, InspectionWorkflowState } from "@/types/inspection";

export interface WorkflowStatusConfig {
  label: string;
  description: string;
  badgeClass: string;
  icon: LucideIcon;
}

export const WORKFLOW_STATUS: Record<InspectionWorkflowState, WorkflowStatusConfig> = {
  DRAFT: {
    label: "Draft",
    description: "Inspection context is being prepared.",
    badgeClass: "border-white/15 bg-white/5 text-[#94A3B8]",
    icon: FileEdit,
  },
  CAPTURING_EVIDENCE: {
    label: "Capturing Evidence",
    description: "Package images are being collected.",
    badgeClass: "border-blue-500/35 bg-blue-500/10 text-blue-400",
    icon: ScanSearch,
  },
  PROCESSING: {
    label: "Processing",
    description: "Waiting for OCR and compliance services.",
    badgeClass: "border-[#F59E0B]/35 bg-[#F59E0B]/10 text-[#F59E0B]",
    icon: Loader2,
  },
  AWAITING_REVIEW: {
    label: "Awaiting Review",
    description: "Extracted information is ready for officer review.",
    badgeClass: "border-[#F59E0B]/35 bg-[#F59E0B]/10 text-[#F59E0B]",
    icon: Clock3,
  },
  REVIEW_REQUIRED: {
    label: "Review Required",
    description: "Findings need officer confirmation.",
    badgeClass: "border-[#F59E0B]/35 bg-[#F59E0B]/10 text-[#F59E0B]",
    icon: AlertTriangle,
  },
  READY_FOR_DECISION: {
    label: "Ready for Decision",
    description: "Officer can record a final decision.",
    badgeClass: "border-blue-400/35 bg-blue-400/10 text-blue-300",
    icon: ShieldAlert,
  },
  PASSED: {
    label: "Passed",
    description: "Officer recorded a compliant decision.",
    badgeClass: "border-[#10B981]/35 bg-[#10B981]/10 text-[#10B981]",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    description: "Officer recorded a non-compliant decision.",
    badgeClass: "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]",
    icon: XCircle,
  },
  INCONCLUSIVE: {
    label: "Inconclusive",
    description: "Evidence was insufficient for a final finding.",
    badgeClass: "border-white/15 bg-white/5 text-[#94A3B8]",
    icon: CircleHelp,
  },
};

export const DECISION_LABEL: Record<InspectionDecision, string> = {
  PASS: "Confirm compliant",
  FAIL: "Mark violation",
  REQUIRES_FURTHER_REVIEW: "Request further review",
  INCONCLUSIVE: "Mark inconclusive",
};

export function formatWorkflowState(state: InspectionWorkflowState): string {
  return WORKFLOW_STATUS[state].label;
}
