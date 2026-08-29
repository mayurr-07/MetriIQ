import { openai } from "../lib/openai.js";
import type { LabelData, NutritionalValues, RuleResult } from "../types/labelData.js";

// ── Rule metadata ─────────────────────────────────────────────────────────────

const RULE_TITLES: Record<string, string> = {
  "LM-01": "Generic/common name of commodity",
  "LM-02": "Net quantity declaration",
  "LM-03": "MRP — mandatory format",
  "LM-04": "Manufacturer / packer name",
  "LM-05": "Manufacturer / packer address",
  "LM-06": "Consumer grievance contact",
  "LM-07": "Month and year of manufacture",
  "LM-08": "Best Before / Expiry date",
  "LM-09": "Country of origin (imported goods)",
  "LM-10": "Batch / Lot number",
  "FS-01": "FSSAI License / Registration Number",
  "FS-02": "Ingredients list present",
  "FS-03": "Sub-ingredients of compound ingredients",
  "FS-05": "'Contains' allergen statement",
  "FS-06": "Nutritional information — per 100g/100ml",
  "FS-07": "Nutritional information — per serving",
  "FS-09": "Best Before / Use By date format",
  "FS-20": "No misleading health/quality claims",
  "FS-21": "Multi-language compliance",
};

function rule(
  code: string,
  status: RuleResult["status"],
  detail: string
): RuleResult {
  return { ruleCode: code, title: RULE_TITLES[code] ?? code, status, detail };
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function isDateExpired(dateStr: string): boolean {
  const now = new Date();
  const yearMatch = dateStr.match(/\b(20\d{2})\b/);
  if (!yearMatch) return false;

  const year = parseInt(yearMatch[1], 10);
  if (year < now.getFullYear()) return true;
  if (year > now.getFullYear()) return false;

  // Same year — check month
  const mmMatch = dateStr.match(/\b(\d{1,2})[\/\-](20\d{2})\b/);
  if (mmMatch) {
    const month = parseInt(mmMatch[1], 10);
    return month < now.getMonth() + 1;
  }
  return false;
}

function hasReadableDateFormat(dateStr: string): boolean {
  // Must contain a year
  if (!/20\d{2}/.test(dateStr)) return false;
  // Must have month indicator (number or name)
  const hasNumericMonth = /\b(\d{1,2})[\/\-]/.test(dateStr);
  const hasMonthName =
    /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(dateStr);
  return hasNumericMonth || hasMonthName;
}

// ── Nutritional helpers ───────────────────────────────────────────────────────

const REQUIRED_NUTRIENTS = [
  "energy",
  "protein",
  "carbohydrate",
  "sugars",
  "totalFat",
  "saturatedFat",
  "transFat",
  "sodium",
] as const;

function missingNutrients(vals: NutritionalValues): string[] {
  return REQUIRED_NUTRIENTS.filter((k) => vals[k] === null || vals[k] === undefined);
}

// ── Deterministic checks ──────────────────────────────────────────────────────

function runDeterministicChecks(d: LabelData): RuleResult[] {
  const results: RuleResult[] = [];

  // LM-02: Net quantity
  const validUnits = ["g", "kg", "ml", "l", "nos", "pieces", "number"];
  if (!d.netQuantity) {
    results.push(rule("LM-02", "fail", "Net quantity not found on label."));
  } else if (!validUnits.includes(d.netQuantity.unit.toLowerCase())) {
    results.push(
      rule(
        "LM-02",
        "fail",
        `Unit "${d.netQuantity.unit}" is not a recognised standard unit (g, kg, ml, L, nos, pieces).`
      )
    );
  } else {
    results.push(
      rule(
        "LM-02",
        "pass",
        `Net quantity declared: ${d.netQuantity.value} ${d.netQuantity.unit}.`
      )
    );
  }

  // LM-03: MRP format — must say "MRP" or "Maximum Retail Price" AND "inclusive of all taxes"
  if (!d.mrp) {
    results.push(rule("LM-03", "fail", "MRP not found on label."));
  } else {
    const raw = d.mrp.rawText;
    const hasMrpKeyword = /MRP|Maximum\s+Retail\s+Price/i.test(raw);
    const hasTaxPhrase = /inclus.*?(?:all\s+)?tax|incl\.?\s+(?:of\s+)?(?:all\s+)?tax/i.test(raw);
    if (!hasMrpKeyword) {
      results.push(
        rule(
          "LM-03",
          "fail",
          `MRP text "${raw}" does not contain required keyword "MRP" or "Maximum Retail Price".`
        )
      );
    } else if (!hasTaxPhrase) {
      results.push(
        rule(
          "LM-03",
          "fail",
          `MRP text "${raw}" is missing mandatory phrase "Inclusive of all taxes".`
        )
      );
    } else {
      results.push(rule("LM-03", "pass", `MRP declared correctly: "${raw}".`));
    }
  }

  // LM-04: Manufacturer name
  if (!d.manufacturerName?.trim()) {
    results.push(rule("LM-04", "fail", "Manufacturer / packer name not found."));
  } else {
    results.push(
      rule("LM-04", "pass", `Manufacturer declared: "${d.manufacturerName}".`)
    );
  }

  // LM-05: Manufacturer address (heuristic: must be at least 15 chars to be a real address)
  if (!d.manufacturerAddress?.trim()) {
    results.push(rule("LM-05", "fail", "Manufacturer / packer address not found."));
  } else if (d.manufacturerAddress.trim().length < 15) {
    results.push(
      rule(
        "LM-05",
        "warning",
        `Address "${d.manufacturerAddress}" appears incomplete (no city / PIN code visible).`
      )
    );
  } else {
    results.push(rule("LM-05", "pass", "Manufacturer address present and appears complete."));
  }

  // LM-06: Consumer grievance contact (at least one of phone / email)
  if (!d.consumerCarePhone && !d.consumerCareEmail && !d.consumerCareAddress) {
    results.push(
      rule("LM-06", "fail", "No consumer grievance contact (phone, email, or address) found.")
    );
  } else {
    const contacts = [
      d.consumerCarePhone && `Phone: ${d.consumerCarePhone}`,
      d.consumerCareEmail && `Email: ${d.consumerCareEmail}`,
    ]
      .filter(Boolean)
      .join(", ");
    results.push(rule("LM-06", "pass", `Consumer contact found — ${contacts || "address declared"}.`));
  }

  // LM-07: Manufacture date
  if (!d.manufactureDate?.trim()) {
    results.push(
      rule("LM-07", "fail", "Month and year of manufacture not found on label.")
    );
  } else {
    results.push(
      rule("LM-07", "pass", `Manufacture date declared: "${d.manufactureDate}".`)
    );
  }

  // LM-08: Best Before / Expiry date
  const expiryStr = d.bestBeforeDate ?? d.expiryDate;
  if (!expiryStr?.trim()) {
    results.push(
      rule("LM-08", "fail", "Best Before or Expiry date not found on label.")
    );
  } else if (isDateExpired(expiryStr)) {
    results.push(
      rule(
        "LM-08",
        "fail",
        `Product appears to be expired — date "${expiryStr}" is in the past.`
      )
    );
  } else {
    results.push(
      rule("LM-08", "pass", `Expiry / Best Before date declared: "${expiryStr}".`)
    );
  }

  // LM-10: Batch number
  if (!d.batchNumber?.trim()) {
    results.push(rule("LM-10", "fail", "Batch / Lot number not found on label."));
  } else {
    results.push(
      rule("LM-10", "pass", `Batch number declared: "${d.batchNumber}".`)
    );
  }

  // FS-01: FSSAI license — exactly 14 digits
  if (!d.fssaiLicenseNo?.trim()) {
    results.push(
      rule("FS-01", "fail", "FSSAI License / Registration Number not found.")
    );
  } else if (!/^\d{14}$/.test(d.fssaiLicenseNo.trim())) {
    results.push(
      rule(
        "FS-01",
        "fail",
        `FSSAI number "${d.fssaiLicenseNo}" is not a valid 14-digit number.`
      )
    );
  } else {
    results.push(
      rule("FS-01", "pass", `FSSAI Lic. No. ${d.fssaiLicenseNo} — format valid.`)
    );
  }

  // FS-02: Ingredients list present
  if (!d.ingredients || d.ingredients.length === 0) {
    results.push(rule("FS-02", "fail", "Ingredients list not found on label."));
  } else {
    results.push(
      rule(
        "FS-02",
        "pass",
        `Ingredients list present — ${d.ingredients.length} ingredient(s) extracted.`
      )
    );
  }

  // FS-05: "Contains" allergen statement (only required if allergens are present)
  if (!d.allergensDeclared || d.allergensDeclared.length === 0) {
    results.push(
      rule("FS-05", "na", "No allergens declared — 'Contains' statement not required.")
    );
  } else if (!d.containsStatement?.trim()) {
    results.push(
      rule(
        "FS-05",
        "fail",
        `Allergens found (${d.allergensDeclared.join(", ")}) but no separate "Contains: ..." statement present.`
      )
    );
  } else {
    results.push(
      rule("FS-05", "pass", `Allergen "Contains" statement found: "${d.containsStatement}".`)
    );
  }

  // FS-06: Nutritional info per 100g — all 8 mandatory fields
  if (!d.nutritionalInfo) {
    results.push(
      rule("FS-06", "fail", "No nutritional information table found on label.")
    );
  } else if (!d.nutritionalInfo.per100g) {
    results.push(
      rule("FS-06", "fail", "Nutritional table found but per-100g values are missing.")
    );
  } else {
    const missing = missingNutrients(d.nutritionalInfo.per100g);
    if (missing.length > 0) {
      results.push(
        rule(
          "FS-06",
          "fail",
          `Nutritional table is incomplete — missing per-100g values for: ${missing.join(", ")}.`
        )
      );
    } else {
      results.push(
        rule("FS-06", "pass", "All 8 mandatory nutritional values present per 100g/100ml.")
      );
    }
  }

  // FS-07: Nutritional info per serving
  if (!d.nutritionalInfo) {
    results.push(
      rule("FS-07", "fail", "No nutritional table found — per-serving column cannot be verified.")
    );
  } else if (!d.nutritionalInfo.perServing || !d.nutritionalInfo.perServing.servingSize) {
    results.push(
      rule("FS-07", "fail", "Nutritional table present but per-serving column / serving size missing.")
    );
  } else {
    results.push(
      rule(
        "FS-07",
        "pass",
        `Per-serving column present — serving size: ${d.nutritionalInfo.perServing.servingSize}.`
      )
    );
  }

  // FS-09: Best Before date format (must be human-readable, not just "BB")
  const bbDate = d.bestBeforeDate;
  if (!bbDate) {
    results.push(
      rule("FS-09", "na", "Best Before date not found — cannot check format.")
    );
  } else if (!hasReadableDateFormat(bbDate)) {
    results.push(
      rule(
        "FS-09",
        "fail",
        `Best Before date "${bbDate}" does not include a recognisable month and year.`
      )
    );
  } else {
    results.push(rule("FS-09", "pass", `Best Before date format is readable: "${bbDate}".`));
  }

  return results;
}

// ── LLM batch check ───────────────────────────────────────────────────────────

async function runLlmBatchChecks(d: LabelData): Promise<RuleResult[]> {
  const prompt = `You are a compliance auditor for Indian packaged food products.
Evaluate the following 5 rules using only the extracted label data provided.
Return ONLY a JSON array — no markdown, no explanation.

Extracted Label Data:
${JSON.stringify(d, null, 2)}

Rules to evaluate:

1. LM-01 — Is "genericName" (value: ${JSON.stringify(d.genericName)}) a true generic commodity name?
   PASS: e.g. "Glucose Biscuits", "Instant Noodles", "Refined Sunflower Oil", "Potato Chips"
   FAIL: Only a brand name with no commodity type (e.g. just "Maggi" or "KitKat")
   WARNING: genericName is null or ambiguous

2. LM-09 — Country of origin declared for imported products?
   PASS: countryOfOrigin is non-null (any value including "India")
   WARNING: countryOfOrigin is null but manufacturer address looks Indian — likely domestic product, declaration optional
   FAIL: countryOfOrigin is null AND manufacturer address appears foreign or absent

3. FS-03 — Are compound ingredients sub-declared in brackets?
   Look at the ingredients array for compound items (e.g. "Milk Chocolate", "Edible Vegetable Fat", "Wheat Flour Mix")
   PASS: Compound ingredients show sub-composition in brackets
   FAIL: Compound ingredients detected but no sub-declaration in brackets
   NA: No compound ingredients present, or ingredients list is null

4. FS-20 — Any unsubstantiated health / quality claims?
   Check productName and genericName for words like: natural, pure, healthy, fresh, premium, 100% real, wholesome, nutritious, goodness of, etc.
   PASS: No such unsubstantiated claims
   FAIL: Such claims present without qualification (e.g. "All Natural Chips", "100% Pure Honey")
   WARNING: Borderline / ambiguous phrasing

5. FS-21 — Multi-language compliance
   NA: Only one language used on the label
   PASS: Multiple languages used AND mandatory declarations (name, qty, MRP, mfr, dates) appear in English or Hindi
   FAIL: Multiple languages used BUT mandatory info only in a regional language without English or Hindi

Return exactly this structure:
[
  { "ruleCode": "LM-01", "status": "pass|fail|warning|na", "detail": "one clear sentence" },
  { "ruleCode": "LM-09", "status": "pass|fail|warning|na", "detail": "one clear sentence" },
  { "ruleCode": "FS-03", "status": "pass|fail|warning|na", "detail": "one clear sentence" },
  { "ruleCode": "FS-20", "status": "pass|fail|warning|na", "detail": "one clear sentence" },
  { "ruleCode": "FS-21", "status": "pass|fail|warning|na", "detail": "one clear sentence" }
]`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    max_tokens: 800,
    messages: [
      {
        role: "system",
        content:
          "You are a compliance auditor. Return ONLY valid JSON with a top-level key 'results' containing the array.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(content) as { results?: RuleResult[] } | RuleResult[];

  // Handle both `{ results: [...] }` and bare array wrapped in json_object
  const rawResults = Array.isArray(parsed)
    ? parsed
    : (parsed as { results?: RuleResult[] }).results ?? [];

  return rawResults.map((r) => ({
    ruleCode: r.ruleCode,
    title: RULE_TITLES[r.ruleCode] ?? r.ruleCode,
    status: r.status,
    detail: r.detail,
  }));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function checkOcrRules(labelData: LabelData): Promise<RuleResult[]> {
  const [deterministicResults, llmResults] = await Promise.all([
    Promise.resolve(runDeterministicChecks(labelData)),
    runLlmBatchChecks(labelData),
  ]);

  // Merge: deterministic results come first; LLM results fill in the remaining codes
  const allResults = [...deterministicResults, ...llmResults];

  // Sort by rule code for consistent output
  return allResults.sort((a, b) => {
    const [aCat, aNum] = a.ruleCode.split("-");
    const [bCat, bNum] = b.ruleCode.split("-");
    if (aCat !== bCat) return aCat < bCat ? -1 : 1;
    return parseInt(aNum, 10) - parseInt(bNum, 10);
  });
}
