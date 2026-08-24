import type { Role, Permission } from "@/types";
import { ROLE_DEFINITIONS } from "@/lib/roles";

/**
 * A workspace is a top-level route group. Access is granted per role with no
 * implicit escalation — notably, ADMIN is NOT given access to the officer or
 * senior workspaces. Earlier phases allowed that as an implementation
 * convenience; the Phase 5 audit removes it.
 */
export type Workspace = "OFFICER" | "ADMIN" | "SENIOR" | "CONSUMER";

export const WORKSPACE_ACCESS: Record<Role, Workspace[]> = {
  INSPECTION_OFFICER: ["OFFICER"],
  ADMIN: ["ADMIN"],
  SENIOR_OFFICER: ["SENIOR"],
  CONSUMER: ["CONSUMER"],
};

export function canAccessWorkspace(role: Role | undefined, workspace: Workspace): boolean {
  if (!role) return false;
  return WORKSPACE_ACCESS[role]?.includes(workspace) ?? false;
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "manage_officers",
    "manage_products",
    "manage_manufacturers",
    "manage_inspections",
    "manage_complaints",
    "manage_rules",
    "view_inspections",
    "view_reports",
    "view_analytics",
    "view_audit_logs",
    "manage_settings",
  ],
  INSPECTION_OFFICER: [
    "create_inspection",
    "view_inspections",
    "review_findings",
    "manage_complaints",
    "view_reports",
  ],
  SENIOR_OFFICER: ["view_inspections", "view_reports", "view_analytics"],
  CONSUMER: ["submit_complaint"],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Landing route for a role's workspace.
 * Delegates to ROLE_DEFINITIONS so route and label never drift apart.
 */
export function getDefaultRouteForRole(role: Role): string {
  return ROLE_DEFINITIONS[role]?.route ?? "/";
}
