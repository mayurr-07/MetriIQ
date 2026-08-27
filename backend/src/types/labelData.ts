export interface NutritionalValues {
  energy: number | null;
  protein: number | null;
  carbohydrate: number | null;
  sugars: number | null;
  totalFat: number | null;
  saturatedFat: number | null;
  transFat: number | null;
  sodium: number | null;
}

export interface LabelData {
  productName: string | null;
  genericName: string | null;
  netQuantity: { value: number; unit: string } | null;
  mrp: { value: number; currency: string; rawText: string } | null;
  manufacturerName: string | null;
  manufacturerAddress: string | null;
  consumerCarePhone: string | null;
  consumerCareEmail: string | null;
  consumerCareAddress: string | null;
  manufactureDate: string | null;
  bestBeforeDate: string | null;
  expiryDate: string | null;
  batchNumber: string | null;
  countryOfOrigin: string | null;
  fssaiLicenseNo: string | null;
  ingredients: string[] | null;
  allergensDeclared: string[] | null;
  containsStatement: string | null;
  storageInstructions: string | null;
  nutritionalInfo: {
    per100g: NutritionalValues;
    perServing: NutritionalValues & { servingSize: string | null };
  } | null;
  vegetarianStatus: "veg" | "nonveg" | "unknown";
}

export interface RuleResult {
  ruleCode: string;
  title: string;
  status: "pass" | "fail" | "warning" | "na";
  detail: string;
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  overallStatus: "compliant" | "non_compliant" | "partially_compliant";
  complianceScore: number;
  ruleResults: RuleResult[];
  failedRules: RuleResult[];
  warningRules: RuleResult[];
  passedRules: RuleResult[];
  summary: string;
  violationCategories: string[];
  riskLevel: "low" | "medium" | "high";
}
