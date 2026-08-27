import { openai } from "../lib/openai.js";
import type { LabelData, RuleResult } from "../types/labelData.js";

// ── Rule metadata ─────────────────────────────────────────────────────────────

const RULE_TITLES: Record<string, string> = {
  "LM-11": "Net quantity numeral height (weight/volume packages)",
  "LM-12": "Net quantity numeral height (area/count packages)",
  "LM-13": "General declaration text height",
  "LM-14": "Character width-to-height ratio",
  "LM-15": "Mandatory declarations on principal display panel",
  "LM-16": "Declarations not obscured",
  "LM-17": "Single MRP — no sticker-over-sticker",
  "FS-04": "Allergen highlighting in ingredients list",
  "FS-08": "Nutritional information in tabular format",
  "FS-12": "Veg/Non-Veg symbol presence",
  "FS-13": "Vegetarian symbol — correct shape",
  "FS-14": "Non-vegetarian symbol — correct shape",
  "FS-15": "Veg/Non-Veg symbol minimum size (≥3mm × 3mm)",
  "FS-16": "Veg/Non-Veg symbol placement on PDP",
  "FS-17": "Veg/Non-Veg symbol colour accuracy",
  "FS-18": "Egg-containing products marked non-veg",
  "FS-19": "Label readability and contrast",
};

function rule(
  code: string,
  status: RuleResult["status"],
  detail: string
): RuleResult {
  return { ruleCode: code, title: RULE_TITLES[code] ?? code, status, detail };
}

// ── Shared helpers ────────────────────────────────────────────────────────────

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${url.slice(0, 60)}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString("base64");
}

type ImagePart = {
  type: "image_url";
  image_url: { url: string; detail: "high" };
};

function buildContent(base64Images: string[], prompt: string) {
  const imageParts: ImagePart[] = base64Images.map((b64) => ({
    type: "image_url",
    image_url: { url: `data:image/jpeg;base64,${b64}`, detail: "high" },
  }));
  return [...imageParts, { type: "text" as const, text: prompt }];
}

async function visionCall<T>(
  imageUrls: string[],
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 500
): Promise<T> {
  const b64s = await Promise.all(imageUrls.slice(0, 4).map(fetchAsBase64));
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: buildContent(b64s, userPrompt) },
    ],
  });
  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as T;
}

/** Wraps a check so a network/API error becomes warning results instead of a crash. */
async function safe(
  fn: () => Promise<RuleResult[]>,
  fallbackCodes: string[]
): Promise<RuleResult[]> {
  try {
    return await fn();
  } catch (err) {
    console.error("[vision] Check failed:", (err as Error).message);
    return fallbackCodes.map((code) =>
      rule(code, "warning", "Automated vision check could not be completed — verify manually.")
    );
  }
}

// ── Check 1: Veg / Non-Veg symbol (FS-12 to FS-17) ──────────────────────────

interface SymbolResult {
  symbolPresent: boolean;
  symbolType: "veg" | "nonveg" | "absent" | "unclear";
  vegShapeCorrect: boolean | null;    // null when not applicable
  nonvegShapeCorrect: boolean | null;
  colorCorrect: boolean;
  sizeAdequate: boolean;
  onFrontPanel: boolean;
  issues: string[];
}

async function checkSymbol(imageUrls: string[]): Promise<RuleResult[]> {
  const data = await visionCall<SymbolResult>(
    imageUrls,
    "You are a food label compliance inspector specialising in FSSAI veg/non-veg symbol verification. Return only JSON.",
    `Examine the product label image(s) for the mandatory veg/non-veg symbol.

FSSAI symbol standards:
- VEGETARIAN: A solid GREEN FILLED CIRCLE inside a GREEN SQUARE BORDER (both distinctly green, not yellow or lime).
- NON-VEGETARIAN: A solid BROWN or DARK RED FILLED TRIANGLE inside a BROWN or DARK RED SQUARE BORDER.
- Minimum size must be at least 3×3 mm (symbol should not be tinier than a grain of rice on the package).
- Must appear on the principal display panel (front face), adjacent to the product name.

Return this JSON exactly:
{
  "symbolPresent": true,
  "symbolType": "veg|nonveg|absent|unclear",
  "vegShapeCorrect": true,
  "nonvegShapeCorrect": null,
  "colorCorrect": true,
  "sizeAdequate": true,
  "onFrontPanel": true,
  "issues": ["list any specific problems"]
}`
  );

  const results: RuleResult[] = [];

  // FS-12: Symbol presence
  results.push(
    data.symbolPresent
      ? rule("FS-12", "pass", `${data.symbolType === "veg" ? "Vegetarian" : "Non-vegetarian"} symbol detected on label.`)
      : rule("FS-12", "fail", "No veg/non-veg symbol found on the label.")
  );

  if (!data.symbolPresent || data.symbolType === "absent") {
    // If symbol absent, remaining checks are all fail
    ["FS-13", "FS-14", "FS-15", "FS-16", "FS-17"].forEach((code) =>
      results.push(rule(code, "fail", "Cannot verify — symbol not found on label."))
    );
    return results;
  }

  // FS-13: Vegetarian shape
  if (data.symbolType === "veg") {
    results.push(
      data.vegShapeCorrect
        ? rule("FS-13", "pass", "Vegetarian symbol shape is correct: green circle inside green square.")
        : rule("FS-13", "fail", `Vegetarian symbol shape incorrect. Issues: ${data.issues.join("; ")}`)
    );
  } else {
    results.push(rule("FS-13", "na", "Product is non-vegetarian — vegetarian shape rule not applicable."));
  }

  // FS-14: Non-vegetarian shape
  if (data.symbolType === "nonveg") {
    results.push(
      data.nonvegShapeCorrect
        ? rule("FS-14", "pass", "Non-vegetarian symbol shape is correct: brown/dark-red triangle inside square.")
        : rule("FS-14", "fail", `Non-vegetarian symbol shape incorrect. Issues: ${data.issues.join("; ")}`)
    );
  } else {
    results.push(rule("FS-14", "na", "Product is vegetarian — non-vegetarian shape rule not applicable."));
  }

  // FS-15: Size adequacy
  results.push(
    data.sizeAdequate
      ? rule("FS-15", "pass", "Symbol appears to meet the minimum 3mm × 3mm size requirement.")
      : rule("FS-15", "fail", "Symbol appears smaller than the required minimum 3mm × 3mm — may need physical measurement.")
  );

  // FS-16: Placement on front panel
  results.push(
    data.onFrontPanel
      ? rule("FS-16", "pass", "Symbol is placed on the principal display panel.")
      : rule("FS-16", "fail", "Symbol not visible on the principal display panel (front face).")
  );

  // FS-17: Colour accuracy
  results.push(
    data.colorCorrect
      ? rule("FS-17", "pass", "Symbol colour is correct (distinctly green for veg / brown-red for non-veg).")
      : rule("FS-17", "fail", `Symbol colour may be incorrect. Issues: ${data.issues.join("; ")}`)
  );

  return results;
}

// ── Check 2: Font size / numeral height (LM-11 to LM-14) ────────────────────

interface FontSizeResult {
  qtyNumeralClearlyReadable: boolean;
  qtyNumeralSizeRating: "adequate" | "borderline" | "too_small";
  mandatoryTextClearlyReadable: boolean;
  tooSmallElements: string[];
  issues: string[];
}

async function checkFontSize(
  imageUrls: string[],
  labelData: LabelData
): Promise<RuleResult[]> {
  const qtyText = labelData.netQuantity
    ? `${labelData.netQuantity.value} ${labelData.netQuantity.unit}`
    : "unknown";

  const data = await visionCall<FontSizeResult>(
    imageUrls,
    "You are a Legal Metrology compliance inspector checking font/numeral size requirements. Return only JSON.",
    `Examine the product label for text legibility as required by Legal Metrology Rules.

The net quantity declared is: ${qtyText}

Legal Metrology Rule 7 requires numerals to be clearly legible — the minimum height varies by package size
(1mm–6mm). As a practical visual test: text is "adequate" if a normal-sighted adult can read it comfortably
from 30cm without straining.

Answer:
1. Can the net quantity numeral "${qtyText}" be read clearly without squinting or magnification?
2. Overall rating of the quantity numeral size: "adequate", "borderline", or "too_small"
3. Can all mandatory text (MRP price, manufacturer name/address, manufacture date, best-before date)
   be clearly read without magnification?
4. List any specific text elements that appear too small to read comfortably.

Return this JSON exactly:
{
  "qtyNumeralClearlyReadable": true,
  "qtyNumeralSizeRating": "adequate|borderline|too_small",
  "mandatoryTextClearlyReadable": true,
  "tooSmallElements": ["list elements that are too small, if any"],
  "issues": ["any other font size concerns"]
}`
  );

  const results: RuleResult[] = [];

  // LM-11 / LM-12 (combined as visual assessment)
  if (data.qtyNumeralSizeRating === "adequate" && data.qtyNumeralClearlyReadable) {
    results.push(rule("LM-11", "pass", `Net quantity numeral "${qtyText}" is clearly readable — size appears adequate.`));
    results.push(rule("LM-12", "pass", "Net quantity numeral height appears compliant for the package size."));
  } else if (data.qtyNumeralSizeRating === "borderline") {
    results.push(rule("LM-11", "warning", `Net quantity numeral "${qtyText}" size is borderline — physical measurement recommended.`));
    results.push(rule("LM-12", "warning", "Net quantity numeral height may not meet minimum requirements — physical measurement needed."));
  } else {
    results.push(rule("LM-11", "fail", `Net quantity numeral "${qtyText}" appears too small to read clearly.`));
    results.push(rule("LM-12", "fail", `Net quantity numeral height appears below minimum requirement. Small elements: ${data.tooSmallElements.join(", ")}`));
  }

  // LM-13: General declaration text height
  if (data.mandatoryTextClearlyReadable) {
    results.push(rule("LM-13", "pass", "All mandatory declaration text appears legible at required size."));
  } else {
    const small = data.tooSmallElements.length > 0 ? data.tooSmallElements.join(", ") : "some mandatory text";
    results.push(rule("LM-13", "fail", `${small} appears below minimum readable size.`));
  }

  // LM-14: Width-to-height ratio (visual assessment — hard to measure precisely)
  results.push(
    rule(
      "LM-14",
      "warning",
      "Character width-to-height ratio cannot be reliably assessed from image alone — recommend physical measurement if LM-13 fails."
    )
  );

  return results;
}

// ── Check 3: PDP Placement (LM-15 to LM-17) ─────────────────────────────────

interface PlacementResult {
  productNameOnFrontPanel: boolean;
  mrpOnFrontPanel: boolean;
  netQtyOnFrontPanel: boolean;
  anyDeclarationObscured: boolean;
  obscuredElements: string[];
  multiplePriceStickers: boolean;
  issues: string[];
}

async function checkPlacement(imageUrls: string[]): Promise<RuleResult[]> {
  const data = await visionCall<PlacementResult>(
    imageUrls,
    "You are a Legal Metrology compliance inspector checking declaration placement requirements. Return only JSON.",
    `Examine the product label for correct placement of mandatory declarations.

Under Legal Metrology Rules, the PRINCIPAL DISPLAY PANEL (the main front face of the package) MUST show:
- Product name / commodity name
- Net quantity
- Maximum Retail Price (MRP)

Also check:
- Are any mandatory declarations hidden under stickers, tape, folds, or decorative elements?
- Is there more than one price sticker layered on top of another (sticker-over-sticker)?

Return this JSON exactly:
{
  "productNameOnFrontPanel": true,
  "mrpOnFrontPanel": true,
  "netQtyOnFrontPanel": true,
  "anyDeclarationObscured": false,
  "obscuredElements": ["list any obscured declaration types"],
  "multiplePriceStickers": false,
  "issues": ["any other placement concerns"]
}`
  );

  const results: RuleResult[] = [];

  // LM-15: All three required items on PDP
  const allOnFront =
    data.productNameOnFrontPanel && data.mrpOnFrontPanel && data.netQtyOnFrontPanel;
  if (allOnFront) {
    results.push(rule("LM-15", "pass", "Product name, net quantity, and MRP all present on principal display panel."));
  } else {
    const missing: string[] = [];
    if (!data.productNameOnFrontPanel) missing.push("product name");
    if (!data.mrpOnFrontPanel) missing.push("MRP");
    if (!data.netQtyOnFrontPanel) missing.push("net quantity");
    results.push(rule("LM-15", "fail", `Missing from principal display panel: ${missing.join(", ")}.`));
  }

  // LM-16: No declarations obscured
  results.push(
    data.anyDeclarationObscured
      ? rule("LM-16", "fail", `Mandatory declaration(s) appear obscured: ${data.obscuredElements.join(", ")}.`)
      : rule("LM-16", "pass", "No mandatory declarations appear to be obscured or hidden.")
  );

  // LM-17: No sticker-over-sticker
  results.push(
    data.multiplePriceStickers
      ? rule("LM-17", "fail", "Multiple price stickers detected — a sticker pasted over an existing MRP is a violation.")
      : rule("LM-17", "pass", "Single MRP price — no sticker-over-sticker detected.")
  );

  return results;
}

// ── Check 4: Nutritional table format (FS-08) ────────────────────────────────

interface NutritionalTableResult {
  tablePresent: boolean;
  isTabular: boolean;
  hasPer100gColumn: boolean;
  hasPerServingColumn: boolean;
  missingNutrientRows: string[];
  issues: string[];
}

async function checkNutritionalTable(imageUrls: string[]): Promise<RuleResult[]> {
  const data = await visionCall<NutritionalTableResult>(
    imageUrls,
    "You are a FSSAI compliance inspector checking nutritional information format. Return only JSON.",
    `Examine the product label for the mandatory nutritional information table.

FSSAI requires nutritional information to be presented in a STRUCTURED TABLE (rows and columns), not as
free-form prose or a running list. The table must have:
- A column for values "Per 100g" or "Per 100ml"
- A column for "Per Serving" values (with serving size stated)
- Rows for: Energy, Protein, Carbohydrate, Sugars, Total Fat, Saturated Fat, Trans Fat, Sodium

Return this JSON exactly:
{
  "tablePresent": true,
  "isTabular": true,
  "hasPer100gColumn": true,
  "hasPerServingColumn": true,
  "missingNutrientRows": ["list any missing rows from the required 8"],
  "issues": ["any format problems"]
}`
  );

  if (!data.tablePresent) {
    return [rule("FS-08", "fail", "No nutritional information table found on any visible label face.")];
  }

  if (!data.isTabular) {
    return [rule("FS-08", "fail", "Nutritional information is not presented in a structured table format — free-form text is not compliant.")];
  }

  if (data.missingNutrientRows.length > 0) {
    return [rule("FS-08", "warning", `Nutritional table is tabular but missing rows for: ${data.missingNutrientRows.join(", ")}.`)];
  }

  return [rule("FS-08", "pass", "Nutritional information is in correct tabular format with per-100g and per-serving columns.")];
}

// ── Check 5: Allergen highlighting (FS-04) ───────────────────────────────────

interface AllergenHighlightResult {
  ingredientsListVisible: boolean;
  allergensFoundInList: string[];
  areHighlighted: boolean;
  highlightMethod: "bold" | "italic" | "caps" | "underline" | "colour" | "none" | "not_visible";
  issues: string[];
}

async function checkAllergenHighlighting(
  imageUrls: string[],
  labelData: LabelData
): Promise<RuleResult[]> {
  const knownAllergens = (labelData.allergensDeclared ?? []).join(", ") || "unknown";

  const data = await visionCall<AllergenHighlightResult>(
    imageUrls,
    "You are a FSSAI compliance inspector checking allergen labelling requirements. Return only JSON.",
    `Examine the ingredients list on the product label for allergen highlighting.

FSSAI requires that any of these 8 major allergens present in the product must be VISUALLY HIGHLIGHTED
within the ingredients list using bold, italic, CAPITAL LETTERS, underline, or a different colour:
milk/dairy, eggs, wheat/gluten, fish, crustaceans/shellfish, peanuts/groundnuts, tree nuts, soybeans.

OCR extraction found these allergens declared: ${knownAllergens}

Look at the ingredients list in the image and determine:
1. Is the ingredients list visible in these images?
2. Are any of the allergens (${knownAllergens}) visually styled differently from the surrounding ingredient text?
3. What visual method is used: bold, italic, CAPS, underline, colour, or none?

Return this JSON exactly:
{
  "ingredientsListVisible": true,
  "allergensFoundInList": ["milk", "wheat"],
  "areHighlighted": true,
  "highlightMethod": "bold|italic|caps|underline|colour|none|not_visible",
  "issues": ["any problems with highlighting"]
}`
  );

  // If no allergens were declared (from OCR), mark as NA
  if (!labelData.allergensDeclared || labelData.allergensDeclared.length === 0) {
    return [rule("FS-04", "na", "No allergens declared in product — allergen highlighting rule not applicable.")];
  }

  if (!data.ingredientsListVisible) {
    return [rule("FS-04", "warning", "Ingredients list not visible in provided images — allergen highlighting cannot be verified.")];
  }

  if (data.allergensFoundInList.length === 0) {
    return [rule("FS-04", "warning", `OCR found allergens (${knownAllergens}) but they could not be located in the visible ingredients list.`)];
  }

  if (data.areHighlighted && data.highlightMethod !== "none") {
    return [rule("FS-04", "pass", `Allergen(s) (${data.allergensFoundInList.join(", ")}) are highlighted using: ${data.highlightMethod}.`)];
  }

  return [rule("FS-04", "fail", `Allergen(s) (${data.allergensFoundInList.join(", ")}) present in ingredients but not visually highlighted (bold/italic/caps/colour required).`)];
}

// ── Check 6: Label readability / contrast (FS-19) ───────────────────────────

interface ReadabilityResult {
  overallReadability: "good" | "acceptable" | "poor";
  contrastAdequate: boolean;
  problematicAreas: string[];
  issues: string[];
}

async function checkReadability(imageUrls: string[]): Promise<RuleResult[]> {
  const data = await visionCall<ReadabilityResult>(
    imageUrls,
    "You are a FSSAI compliance inspector checking label readability and contrast. Return only JSON.",
    `Assess the overall readability of this product label.

FSSAI requires that all mandatory text is legible with sufficient contrast against the background.
Poor contrast (e.g., white text on light background, dark text on dark background) is a violation.

Evaluate:
1. Overall readability: "good" (easy to read), "acceptable" (readable but some contrast issues), or "poor" (text blends with background)
2. Is the text-to-background contrast adequate across the label?
3. List any specific areas where text is hard to read due to colour, printing quality, smudging, or fading.

Return this JSON exactly:
{
  "overallReadability": "good|acceptable|poor",
  "contrastAdequate": true,
  "problematicAreas": ["e.g. manufacturer address text is grey on white"],
  "issues": []
}`
  );

  if (data.overallReadability === "good" && data.contrastAdequate) {
    return [rule("FS-19", "pass", "Label text has adequate contrast and is clearly readable throughout.")];
  }

  if (data.overallReadability === "acceptable") {
    const areas = data.problematicAreas.length > 0 ? ` Problem areas: ${data.problematicAreas.join("; ")}.` : "";
    return [rule("FS-19", "warning", `Label readability is acceptable but has minor contrast issues.${areas}`)];
  }

  const areas = data.problematicAreas.length > 0 ? data.problematicAreas.join("; ") : "multiple areas";
  return [rule("FS-19", "fail", `Label has poor contrast — text is difficult to read in: ${areas}.`)];
}

// ── FS-18: Egg → non-veg (deterministic, no extra API call) ─────────────────

function checkEggNonVeg(labelData: LabelData): RuleResult {
  const ingredientText = (labelData.ingredients ?? []).join(" ").toLowerCase();
  const allergenText = (labelData.allergensDeclared ?? []).join(" ").toLowerCase();
  const hasEgg = ingredientText.includes("egg") || allergenText.includes("egg");

  if (!hasEgg) {
    return rule("FS-18", "na", "No egg detected in ingredients — egg/non-veg cross-check not applicable.");
  }

  switch (labelData.vegetarianStatus) {
    case "nonveg":
      return rule("FS-18", "pass", "Product contains egg and is correctly marked as non-vegetarian.");
    case "veg":
      return rule("FS-18", "fail", "Product contains egg but carries the vegetarian (green) symbol — must be marked non-vegetarian.");
    default:
      return rule("FS-18", "warning", "Product contains egg — verify that the non-vegetarian (brown triangle) symbol is displayed.");
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function checkVisionRules(
  imageUrls: string[],
  labelData: LabelData
): Promise<RuleResult[]> {
  if (imageUrls.length === 0) {
    const allCodes = Object.keys(RULE_TITLES);
    return allCodes.map((code) =>
      rule(code, "warning", "No images provided — vision checks could not be performed.")
    );
  }

  // Run all 6 vision checks in parallel — total latency = slowest single check
  const [
    symbolResults,
    fontSizeResults,
    placementResults,
    nutritionalTableResults,
    allergenResults,
    readabilityResults,
  ] = await Promise.all([
    safe(() => checkSymbol(imageUrls), ["FS-12", "FS-13", "FS-14", "FS-15", "FS-16", "FS-17"]),
    safe(() => checkFontSize(imageUrls, labelData), ["LM-11", "LM-12", "LM-13", "LM-14"]),
    safe(() => checkPlacement(imageUrls), ["LM-15", "LM-16", "LM-17"]),
    safe(() => checkNutritionalTable(imageUrls), ["FS-08"]),
    safe(() => checkAllergenHighlighting(imageUrls, labelData), ["FS-04"]),
    safe(() => checkReadability(imageUrls), ["FS-19"]),
  ]);

  // FS-18 is deterministic — no API call needed
  const eggCheck = checkEggNonVeg(labelData);

  const allResults = [
    ...symbolResults,
    eggCheck,
    ...fontSizeResults,
    ...placementResults,
    ...allergenResults,
    ...nutritionalTableResults,
    ...readabilityResults,
  ];

  // Sort by rule code
  return allResults.sort((a, b) => {
    const [aCat, aNum] = a.ruleCode.split("-");
    const [bCat, bNum] = b.ruleCode.split("-");
    if (aCat !== bCat) return aCat < bCat ? -1 : 1;
    return parseInt(aNum, 10) - parseInt(bNum, 10);
  });
}
