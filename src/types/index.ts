/**
 * Core identity and access types.
 *
 * Domain models live beside their feature area to keep one source of truth:
 *   - Inspections, evidence, compliance  → `@/types/inspection`
 *   - Complaints, complaint events       → `@/types/complaint`
 *   - Analytics, registries, audit       → `@/types/analytics`
 *
 * Earlier phases also declared `Inspection`, `Complaint`, `Product`,
 * `Manufacturer`, `ViolationRule`, `AuditLogItem`, `DashboardMetrics`,
 * `InspectionStatus` and a second `ComplaintStatus` here. Those competed with
 * the live feature models and were removed in the Phase 5 audit.
 */

export type Role = "ADMIN" | "INSPECTION_OFFICER" | "SENIOR_OFFICER" | "CONSUMER";

export type Permission =
  | "manage_officers"
  | "manage_products"
  | "manage_manufacturers"
  | "manage_inspections"
  | "create_inspection"
  | "view_inspections"
  | "review_findings"
  | "manage_complaints"
  | "submit_complaint"
  | "manage_rules"
  | "view_reports"
  | "view_analytics"
  | "view_audit_logs"
  | "manage_settings";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation: string;
  department: string;
  district?: string;
  avatarUrl?: string;
  badgeNumber?: string;
}
