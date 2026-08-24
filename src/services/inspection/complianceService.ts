import type {
  ComplianceCheck,
  ComplianceOutcome,
  ComplianceRule,
  ServiceAvailability,
  Violation,
} from "@/types/inspection";

export interface ComplianceResponse {
  status: ServiceAvailability;
  message: string;
  outcome: ComplianceOutcome | null;
  checks: ComplianceCheck[];
  violations: Violation[];
}

export const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: "rule-mrp",
    code: "Rule 6(1)(a)",
    title: "MRP declaration",
    requirement: "Retail sale price inclusive of all taxes must be clearly declared.",
  },
  {
    id: "rule-qty",
    code: "Rule 6(1)(b)",
    title: "Net quantity",
    requirement: "Net quantity must be declared in a standard unit of weight or measure.",
  },
  {
    id: "rule-date",
    code: "Rule 6(1)(c)",
    title: "Manufacturing / packing date",
    requirement: "Month and year of manufacture or packing must be present and legible.",
  },
  {
    id: "rule-batch",
    code: "Rule 6(1)",
    title: "Batch / lot information",
    requirement: "A batch, lot or code number should identify the consignment.",
  },
  {
    id: "rule-care",
    code: "Rule 6(1)(d)",
    title: "Customer care information",
    requirement: "Name and contact details for consumer complaints must be provided.",
  },
  {
    id: "rule-visibility",
    code: "Rule 6 / Rule 7",
    title: "Label visibility",
    requirement: "Mandatory declarations must be conspicuous and readable.",
  },
];

export const complianceService = {
  rules(): ComplianceRule[] {
    return COMPLIANCE_RULES;
  },
  async evaluate(_labelPresent: boolean, demo: boolean): Promise<ComplianceResponse> {
    await wait(demo ? 1100 : 600);
    if (!demo) {
      return {
        status: "UNAVAILABLE",
        message: "Compliance checks will run when the rule engine is connected.",
        outcome: null,
        checks: [],
        violations: [],
      };
    }
    return {
      status: "AVAILABLE",
      message: "Demo analysis only. This is not an official inspection.",
      outcome: "REVIEW_REQUIRED",
      checks: DEMO_CHECKS,
      violations: DEMO_VIOLATIONS,
    };
  },
};

const DEMO_CHECKS: ComplianceCheck[] = [
  {
    id: "chk-mrp",
    ruleId: "rule-mrp",
    title: "MRP declaration",
    requirement: COMPLIANCE_RULES[0].requirement,
    detectedValue: "₹120 printed",
    outcome: "REVIEW_REQUIRED",
    evidenceId: "front",
  },
  {
    id: "chk-qty",
    ruleId: "rule-qty",
    title: "Net quantity",
    requirement: COMPLIANCE_RULES[1].requirement,
    detectedValue: "500 g",
    outcome: "COMPLIANT",
    evidenceId: "front",
  },
  {
    id: "chk-date",
    ruleId: "rule-date",
    title: "Manufacturing / packing date",
    requirement: COMPLIANCE_RULES[2].requirement,
    detectedValue: "07 / 26",
    outcome: "COMPLIANT",
    evidenceId: "front",
  },
  {
    id: "chk-care",
    ruleId: "rule-care",
    title: "Customer care information",
    requirement: COMPLIANCE_RULES[4].requirement,
    detectedValue: "1800-266-XXXX",
    outcome: "REVIEW_REQUIRED",
    evidenceId: "front",
  },
];

const DEMO_VIOLATIONS: Violation[] = [
  {
    id: "vio-mrp",
    title: "MRP print requires officer review",
    ruleReference: "Rule 6(1)(a)",
    severity: "MEDIUM",
    description: "Demo finding only. The printed MRP region is flagged for officer confirmation of height and clarity.",
    detectedValue: "₹120",
    expectedRequirement: "MRP must be clearly declared and readable on the principal display panel.",
    evidenceLocation: "Front label · top-right price panel",
    officerNotes: "",
  },
];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
