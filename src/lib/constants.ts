export const PRODUCT = {
  brand: "SHUDH AHAAR",
  name: "Classic Salted Potato Chips",
  inspectionId: "SW-2847-2026",
  date: "12 / 02 / 2026",
  officer: "Insp. R. Meena",
  officerId: "LM-IN-4471",
  district: "Jaipur — Zone II",
  licence: "MFG. LIC. 10019043001123",
} as const;

export type DeclarationStatus = "pass" | "review" | "issue";

export type Declaration = {
  id: string;
  label: string;
  value: string;
  rule: string;
  status: DeclarationStatus;
  note: string;
  /** Normalised position on the package front face (0..1 from top-left) */
  box: { x: number; y: number; w: number; h: number };
  side: "left" | "right";
};

export const DECLARATIONS: Declaration[] = [
  {
    id: "mrp",
    label: "MRP",
    value: "₹120",
    rule: "Rule 6(1)(a) — retail sale price, incl. of all taxes",
    status: "issue",
    note: "Print height below mandated minimum / digit overlap",
    box: { x: 0.6, y: 0.08, w: 0.33, h: 0.15 },
    side: "right",
  },
  {
    id: "netqty",
    label: "NET QUANTITY",
    value: "500 g",
    rule: "Rule 6(1)(b) — net quantity in standard units",
    status: "pass",
    note: "Declared in standard unit, legible",
    box: { x: 0.06, y: 0.66, w: 0.42, h: 0.13 },
    side: "left",
  },
  {
    id: "mfd",
    label: "MFD",
    value: "07 / 26",
    rule: "Rule 6(1)(c) — month & year of manufacture",
    status: "pass",
    note: "Format OK — MM/YY",
    box: { x: 0.06, y: 0.42, w: 0.34, h: 0.12 },
    side: "left",
  },
  {
    id: "care",
    label: "CUSTOMER CARE",
    value: "1800-266-XXXX",
    rule: "Rule 6(1)(d) — consumer care contact",
    status: "review",
    note: "Number present, incomplete address",
    box: { x: 0.52, y: 0.8, w: 0.42, h: 0.13 },
    side: "right",
  },
];

export const RESULT_SUMMARY = [
  { label: "Declarations Passed", value: 2, tone: "pass" as const },
  { label: "Review Required", value: 1, tone: "review" as const },
  { label: "Potential Violation", value: 1, tone: "issue" as const },
];

export const ISSUE = {
  title: "POTENTIAL ISSUE",
  confidence: 94,
  declaration: "MRP",
  region: "Top-right declaration panel",
  status: "Potential Non-Compliance",
  backing: "Backed by Visual Evidence",
} as const;

export const DASHBOARD = {
  inspections: 1284,
  compliant: 932,
  issues: 247,
  review: 105,
  districts: [
    { name: "Jaipur", value: 88 },
    { name: "Jodhpur", value: 74 },
    { name: "Udaipur", value: 69 },
    { name: "Kota", value: 61 },
    { name: "Bikaner", value: 54 },
    { name: "Ajmer", value: 47 },
  ],
  categories: [
    { name: "MRP declaration", count: 96 },
    { name: "Net quantity", count: 71 },
    { name: "Customer care", count: 44 },
    { name: "MFD / expiry", count: 29 },
    { name: "Manufacturer address", count: 18 },
  ],
  trend: [38, 44, 41, 52, 49, 61, 58, 67, 64, 72, 69, 81],
} as const;

export const ACTS = [
  { id: "inspect", index: "01", title: "Inspect", caption: "The package on the table" },
  { id: "understand", index: "02", title: "Understand", caption: "AI reads the label" },
  { id: "verify", index: "03", title: "Verify", caption: "Evidence & report" },
  { id: "protect", index: "04", title: "Protect", caption: "Department & consumer" },
] as const;

/** Package geometry (world units) */
export const PACKAGE_SIZE: [number, number, number] = [4.4, 3.0, 1.6];
/** table surface sits exactly under the resting package (pkg y 0.15 − half height 1.5) */
export const TABLE_Y = -1.4;
