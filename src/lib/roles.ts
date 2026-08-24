import type { Role } from "@/types";

/**
 * OFFICIAL FRONTEND ROLE DEFINITIONS — single source of truth.
 *
 * The platform has exactly FOUR user types. Analytics, grievance handling and
 * AI assistance are FEATURES of the platform, never user identities.
 *
 * AI IS NOT A USER ROLE. The AI/OCR/CV layer is an assistive intelligence
 * layer beneath the application. The authorized officer always remains
 * responsible for the final inspection decision.
 */
export interface RoleDefinition {
  /** Official display name shown throughout the application. */
  label: string;
  /** Concise purpose statement. */
  description: string;
  /** Landing route for this role's workspace. */
  route: string;
  /** Short workspace label used inside application shells. */
  workspace: string;
  /** Development-only demo credential (isolated from production auth). */
  demoEmail: string;
  demoPassword: string;
}

export const ROLE_DEFINITIONS: Record<Role, RoleDefinition> = {
  INSPECTION_OFFICER: {
    label: "Inspection Officer",
    description: "Field Inspection & AI Review",
    route: "/officer/dashboard",
    workspace: "Field Operations",
    demoEmail: "officer@legalmetrology.dev",
    demoPassword: "officer123",
  },
  ADMIN: {
    label: "Department Admin",
    description: "Operations & Compliance Management",
    route: "/admin/dashboard",
    workspace: "Department Operations",
    demoEmail: "admin@legalmetrology.dev",
    demoPassword: "admin123",
  },
  SENIOR_OFFICER: {
    label: "Senior Officer",
    description: "Compliance Intelligence & Analytics",
    route: "/senior/dashboard",
    workspace: "Compliance Intelligence",
    demoEmail: "senior@legalmetrology.dev",
    demoPassword: "senior123",
  },
  CONSUMER: {
    label: "Consumer",
    description: "Report & Track Product Issues",
    route: "/report",
    workspace: "Consumer Portal",
    demoEmail: "consumer@legalmetrology.dev",
    demoPassword: "consumer123",
  },
};

/** Ordered list used by the development access selector. */
export const ROLE_ORDER: Role[] = [
  "INSPECTION_OFFICER",
  "ADMIN",
  "SENIOR_OFFICER",
  "CONSUMER",
];

export function getRoleLabel(role: Role | undefined): string {
  return role ? ROLE_DEFINITIONS[role].label : "Unknown Role";
}

export function getRoleDescription(role: Role | undefined): string {
  return role ? ROLE_DEFINITIONS[role].description : "";
}

export function getRoleWorkspace(role: Role | undefined): string {
  return role ? ROLE_DEFINITIONS[role].workspace : "Workspace";
}
