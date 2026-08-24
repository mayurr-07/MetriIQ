import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart2,
  Building,
  Building2,
  FileSpreadsheet,
  FileText,
  Globe,
  Home,
  Layers,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import type { Role } from "@/types";

export type RouteKind = "dashboard" | "list" | "form" | "detail" | "settings";

export interface ModuleRoute {
  /** Path relative to the module root (e.g. "dashboard"). */
  path: string;
  /** Page heading shown by the placeholder shell. */
  title: string;
  /** Supporting description. */
  subtitle: string;
  /** Short label used in sidebar / mobile navigation. */
  navLabel: string;
  /** Icon representing this module in navigation and headers. */
  icon: LucideIcon;
  /** Controls which placeholder template is rendered. */
  kind: RouteKind;
  /** Column headers for "list" pages — structure only, never fabricated rows. */
  columns?: string[];
  /** Whether this route appears in the sidebar/nav (dynamic detail routes do not). */
  showInNav?: boolean;
  /** Path (relative) of a "form" route this list can link to, e.g. inspections → inspections/new */
  createPath?: string;
  /** Label for the create action, when createPath is set. */
  createLabel?: string;
}

/**
 * Route registry per role module.
 *
 * This is the single source of truth for navigation AND placeholder page
 * content — sidebars, mobile menus, page headers and empty-state tables all
 * read from here so labels, icons and structure can never drift apart.
 */
export const MODULE_ROUTES: Record<Role, ModuleRoute[]> = {
  INSPECTION_OFFICER: [
    {
      path: "dashboard",
      title: "Field Dashboard",
      subtitle: "Your inspection queue, assigned complaints and jurisdiction at a glance.",
      navLabel: "Dashboard",
      icon: Home,
      kind: "dashboard",
      showInNav: true,
    },
    {
      path: "inspections",
      title: "Inspections",
      subtitle: "Review, manage and monitor field inspection cases.",
      navLabel: "Inspections",
      icon: BarChart2,
      kind: "list",
      columns: ["Inspection ID", "Product", "District", "Status", "Date"],
      createPath: "inspections/new",
      createLabel: "New Inspection",
      showInNav: true,
    },
    {
      path: "inspections/new",
      title: "New Inspection",
      subtitle: "Capture a product's principal display panel to begin an AI-assisted inspection.",
      navLabel: "New Inspection",
      icon: Search,
      kind: "form",
      showInNav: true,
    },
    {
      path: "inspections/:id",
      title: "Inspection Case",
      subtitle: "Findings, visual evidence and rule-validation detail for a single inspection.",
      navLabel: "Inspection Case",
      icon: FileText,
      kind: "detail",
      showInNav: false,
    },
    {
      path: "complaints",
      title: "Assigned Complaints",
      subtitle: "Consumer-reported issues assigned to you for field investigation.",
      navLabel: "Assigned Complaints",
      icon: ShieldAlert,
      kind: "list",
      columns: ["Complaint ID", "Product", "Issue Category", "Status", "Reported"],
      showInNav: true,
    },
    {
      path: "complaints/:id",
      title: "Complaint Case",
      subtitle: "Complainant evidence and officer action log for a single complaint.",
      navLabel: "Complaint Case",
      icon: FileText,
      kind: "detail",
      showInNav: false,
    },
    {
      path: "reviews",
      title: "AI Findings Review",
      subtitle: "Verify flagged potential violations before a notice is issued.",
      navLabel: "AI Findings Review",
      icon: UserCheck,
      kind: "list",
      columns: ["Inspection ID", "Flagged Declaration", "Confidence", "Status"],
      showInNav: true,
    },
    {
      path: "reports",
      title: "Reports",
      subtitle: "Generated inspection reports and official enforcement summaries.",
      navLabel: "Reports",
      icon: FileText,
      kind: "list",
      columns: ["Report ID", "Inspection", "Generated", "Format"],
      showInNav: true,
    },
    {
      path: "profile",
      title: "Profile",
      subtitle: "Credentials, jurisdiction and account preferences.",
      navLabel: "Profile",
      icon: Building2,
      kind: "settings",
      showInNav: true,
    },
  ],

  ADMIN: [
    {
      path: "dashboard",
      title: "Admin Dashboard",
      subtitle: "Department-wide oversight across officers, products and enforcement records.",
      navLabel: "Dashboard",
      icon: Home,
      kind: "dashboard",
      showInNav: true,
    },
    {
      path: "officers",
      title: "Officers",
      subtitle: "Manage jurisdictional postings, credentials and permissions.",
      navLabel: "Officers",
      icon: Users,
      kind: "list",
      columns: ["Officer", "Badge No.", "District", "Status"],
      showInNav: true,
    },
    {
      path: "products",
      title: "Products",
      subtitle: "Pre-packaged commodity catalog and historical compliance rates.",
      navLabel: "Products",
      icon: Globe,
      kind: "list",
      columns: ["Product", "Brand", "Category", "Manufacturer", "Compliance"],
      showInNav: true,
    },
    {
      path: "manufacturers",
      title: "Manufacturers",
      subtitle: "Licence tracking under the Legal Metrology (Packaged Commodities) Rules.",
      navLabel: "Manufacturers",
      icon: Building,
      kind: "list",
      columns: ["Manufacturer", "Licence No.", "District", "Risk Rating"],
      showInNav: true,
    },
    {
      path: "inspections",
      title: "Inspections",
      subtitle: "Cross-district compliance records and violation tallies.",
      navLabel: "Inspections",
      icon: Activity,
      kind: "list",
      columns: ["Inspection ID", "Product", "District", "Status", "Date"],
      showInNav: true,
    },
    {
      path: "complaints",
      title: "Complaints",
      subtitle: "Dispatch and monitor consumer complaints across zones.",
      navLabel: "Complaints",
      icon: ShieldAlert,
      kind: "list",
      columns: ["Complaint ID", "Product", "Issue Category", "Status", "Reported"],
      showInNav: true,
    },
    {
      path: "violations",
      title: "Violation Categories",
      subtitle: "Common non-compliance categories such as MRP, net quantity and consumer care.",
      navLabel: "Violations",
      icon: ShieldCheck,
      kind: "list",
      columns: ["Category", "Rule Reference", "Severity"],
      showInNav: true,
    },
    {
      path: "rules",
      title: "Legal Metrology Rules",
      subtitle: "Rule definitions, tolerances and mandatory declaration parameters (PCR 2011).",
      navLabel: "Rules",
      icon: Layers,
      kind: "list",
      columns: ["Rule No.", "Title", "Category", "Severity"],
      showInNav: true,
    },
    {
      path: "reports",
      title: "Reports",
      subtitle: "Official department returns prepared for ministry submission.",
      navLabel: "Reports",
      icon: FileSpreadsheet,
      kind: "list",
      columns: ["Report ID", "Scope", "Generated", "Format"],
      showInNav: true,
    },
    {
      path: "audit-logs",
      title: "Audit Logs",
      subtitle: "Tamper-evident log of officer actions and data modifications.",
      navLabel: "Audit Logs",
      icon: Activity,
      kind: "list",
      columns: ["Timestamp", "Actor", "Action", "Target"],
      showInNav: true,
    },
    {
      path: "settings",
      title: "Settings",
      subtitle: "AI confidence thresholds, OCR parameters and system integrations.",
      navLabel: "Settings",
      icon: Settings,
      kind: "settings",
      showInNav: true,
    },
  ],

  SENIOR_OFFICER: [
    {
      path: "dashboard",
      title: "Compliance Intelligence Dashboard",
      subtitle: "Strategic oversight of enforcement outcomes across the state.",
      navLabel: "Dashboard",
      icon: Home,
      kind: "dashboard",
      showInNav: true,
    },
    {
      path: "analytics",
      title: "Analytics",
      subtitle: "Inspection volume and violation category distribution over time.",
      navLabel: "Analytics",
      icon: BarChart2,
      kind: "list",
      columns: ["Period", "Inspections", "Compliant", "Violations"],
      showInNav: true,
    },
    {
      path: "compliance",
      title: "Compliance",
      subtitle: "Zone-by-zone adherence tracking across districts.",
      navLabel: "Compliance",
      icon: TrendingUp,
      kind: "list",
      columns: ["District", "Compliance Rate", "Trend"],
      showInNav: true,
    },
    {
      path: "risk",
      title: "Risk",
      subtitle: "Violation risk indicators derived from historical manufacturer records.",
      navLabel: "Risk",
      icon: ShieldAlert,
      kind: "list",
      columns: ["Manufacturer", "Risk Rating", "Open Cases"],
      showInNav: true,
    },
    {
      path: "trends",
      title: "Trends",
      subtitle: "Longitudinal analysis of consumer protection impact.",
      navLabel: "Trends",
      icon: BarChart2,
      kind: "list",
      columns: ["Category", "This Quarter", "Last Quarter", "Change"],
      showInNav: true,
    },
  ],

  CONSUMER: [
    {
      path: "new",
      title: "Report a Problem",
      subtitle: "Tell us what's wrong — photos help our officers investigate faster.",
      navLabel: "Report a Problem",
      icon: ShieldAlert,
      kind: "form",
      showInNav: true,
    },
    {
      path: "success",
      title: "Complaint Submitted",
      subtitle: "Your report has been received.",
      navLabel: "Submitted",
      icon: ShieldCheck,
      kind: "detail",
      showInNav: false,
    },
    {
      path: "track",
      title: "Track Complaint",
      subtitle: "Check the progress of a complaint you've already filed.",
      navLabel: "Track Complaint",
      icon: Search,
      kind: "form",
      showInNav: true,
    },
  ],
};

/** Sidebar/nav-visible routes for a role, in declared order. */
export function getNavRoutes(role: Role): ModuleRoute[] {
  return MODULE_ROUTES[role].filter((route) => route.showInNav !== false);
}
