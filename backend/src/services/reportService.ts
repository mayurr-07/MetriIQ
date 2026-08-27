import { randomUUID } from "crypto";
import { openai } from "../lib/openai.js";
import type { LabelData, RuleResult, ComplianceReport } from "../types/labelData.js";

// ── Summary generation ────────────────────────────────────────────────────────

async function generateSummary(
  failed: RuleResult[],
  warnings: RuleResult[],
  score: number,
  riskLevel: string
): Promise<string> {
  if (failed.length === 0 && warnings.length === 0) {
    return "The product label is fully compliant with all applicable Legal Metrology and FSSAI requirements. No violations were detected. No enforcement action is required at this time.";
  }

  const failLines = failed.map((r) => `FAIL — ${r.title}: ${r.detail}`).join("\n");
  const warnLines = warnings.map((r) => `WARN — ${r.title}: ${r.detail}`).join("\n");

  const prompt = `You are writing a compliance inspection report summary for a Legal Metrology field officer in India.

Compliance score: ${score.toFixed(0)}/100 (${riskLevel} risk)

Violations found:
${failLines || "(none)"}

Warnings:
${warnLines || "(none)"}

Write a 2–3 sentence professional summary that:
1. States the overall compliance status (compliant / partially compliant / non-compliant)
2. Names the most critical violations
3. States the recommended enforcement action (e.g., show-cause notice, immediate removal from sale, advisory warning)

Be factual and concise. Do not use bullet points. Do not start with "The".`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 200,
    messages: [
      { role: "system", content: "You write brief, professional compliance report summaries. Plain text only — no bullets, no markdown." },
      { role: "user", content: prompt },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "Summary generation failed — please review rule results manually.";
}

// ── Violation category extraction ─────────────────────────────────────────────

function extractViolationCategories(failed: RuleResult[], warnings: RuleResult[]): string[] {
  const categories = new Set<string>();

  const add = (r: RuleResult) => {
    const code = r.ruleCode;
    if (code.startsWith("LM-0") || (code === "LM-10")) {
      categories.add("Missing mandatory declarations (LM Rules)");
    }
    if (["LM-11", "LM-12", "LM-13", "LM-14"].includes(code)) {
      categories.add("Font/numeral size violations");
    }
    if (["LM-15", "LM-16", "LM-17"].includes(code)) {
      categories.add("Label placement violations");
    }
    if (code === "FS-01") categories.add("Missing FSSAI license number");
    if (["FS-02", "FS-03"].includes(code)) categories.add("Ingredient listing violations");
    if (["FS-04", "FS-05"].includes(code)) categories.add("Allergen declaration violations");
    if (["FS-06", "FS-07", "FS-08"].includes(code)) categories.add("Nutritional information violations");
    if (["FS-12", "FS-13", "FS-14", "FS-15", "FS-16", "FS-17", "FS-18"].includes(code)) {
      categories.add("Veg/Non-veg symbol violations");
    }
    if (code === "FS-19") categories.add("Label readability / contrast issues");
    if (code === "FS-20") categories.add("Misleading health claims");
    if (code === "FS-21") categories.add("Multi-language compliance issues");
  };

  failed.forEach(add);
  warnings.forEach(add);
  return [...categories];
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateReport(
  ocrResults: RuleResult[],
  visionResults: RuleResult[],
  _labelData: LabelData
): Promise<ComplianceReport> {
  // Merge: use a Map keyed by ruleCode to deduplicate (fail beats warning beats pass beats na)
  const STATUS_PRIORITY: Record<RuleResult["status"], number> = {
    fail: 3, warning: 2, pass: 1, na: 0,
  };

  const merged = new Map<string, RuleResult>();
  for (const r of [...ocrResults, ...visionResults]) {
    const existing = merged.get(r.ruleCode);
    if (!existing || STATUS_PRIORITY[r.status] > STATUS_PRIORITY[existing.status]) {
      merged.set(r.ruleCode, r);
    }
  }

  const ruleResults = [...merged.values()].sort((a, b) => {
    const [aCat, aNum] = a.ruleCode.split("-");
    const [bCat, bNum] = b.ruleCode.split("-");
    if (aCat !== bCat) return aCat < bCat ? -1 : 1;
    return parseInt(aNum, 10) - parseInt(bNum, 10);
  });

  const failedRules  = ruleResults.filter((r) => r.status === "fail");
  const warningRules = ruleResults.filter((r) => r.status === "warning");
  const passedRules  = ruleResults.filter((r) => r.status === "pass");
  const applicable   = ruleResults.filter((r) => r.status !== "na").length;

  // Score: passed out of applicable rules (warnings count as half-pass)
  const weightedPassed = passedRules.length + warningRules.length * 0.5;
  const complianceScore = applicable > 0 ? Math.round((weightedPassed / applicable) * 100) : 100;

  const riskLevel: ComplianceReport["riskLevel"] =
    complianceScore >= 90 ? "low" : complianceScore >= 70 ? "medium" : "high";

  const overallStatus: ComplianceReport["overallStatus"] =
    failedRules.length === 0
      ? "compliant"
      : complianceScore >= 70
      ? "partially_compliant"
      : "non_compliant";

  const violationCategories = extractViolationCategories(failedRules, warningRules);

  // Summary generation (text only — fast call)
  const summary = await generateSummary(failedRules, warningRules, complianceScore, riskLevel);

  return {
    reportId: randomUUID(),
    generatedAt: new Date(),
    overallStatus,
    complianceScore,
    ruleResults,
    failedRules,
    warningRules,
    passedRules,
    summary,
    violationCategories,
    riskLevel,
  };
}
