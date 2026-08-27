import { openai } from "../lib/openai.js";
import type { LabelData } from "../types/labelData.js";

// ── Prompts ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a label extraction engine for Indian packaged food products
inspected under Legal Metrology (Packaged Commodities) Rules 2011 and FSSAI regulations.
Extract every mandatory declaration visible in the image.
Return ONLY valid JSON — no markdown fences, no explanation, no extra keys.
If a field is not visible or absent, set it to null.
Scan the entire image: front face, back panel, and any side text visible.`;

const USER_PROMPT = `Extract all label information and return a JSON object with EXACTLY this structure:

{
  "productName": "full product name as printed (brand + variant)",
  "genericName": "generic/common commodity name — e.g. 'Glucose Biscuits', 'Instant Noodles', 'Refined Sunflower Oil'. Must be the category name, not the brand.",
  "netQuantity": { "value": 100, "unit": "g" },
  "mrp": { "value": 30.00, "currency": "INR", "rawText": "exact MRP line as printed on label, verbatim" },
  "manufacturerName": "full legal name of manufacturer or packer",
  "manufacturerAddress": "complete postal address with city, state, PIN code",
  "consumerCarePhone": "phone number or null",
  "consumerCareEmail": "email address or null",
  "consumerCareAddress": "consumer grievance postal address if different from mfr address, or null",
  "manufactureDate": "as printed — e.g. '06/2025' or 'Jun 2025'",
  "bestBeforeDate": "as printed — e.g. 'Best Before Jun 2026' or '06/2026'",
  "expiryDate": "only if a separate expiry/use-by date is printed, else null",
  "batchNumber": "value after 'Batch No.', 'Lot No.', 'B.No.', 'Batch:' etc. — just the code",
  "countryOfOrigin": "e.g. 'India' or 'United States' — null if not printed",
  "fssaiLicenseNo": "14-digit FSSAI number only — digits with no spaces or prefix text",
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "allergensDeclared": ["milk", "wheat", "soy"],
  "containsStatement": "exact 'Contains: ...' text as printed, or null",
  "storageInstructions": "storage conditions text, or null",
  "nutritionalInfo": {
    "per100g": {
      "energy": 450,
      "protein": 8.5,
      "carbohydrate": 65.2,
      "sugars": 12.0,
      "totalFat": 18.5,
      "saturatedFat": 8.0,
      "transFat": 0.0,
      "sodium": 320
    },
    "perServing": {
      "servingSize": "30g",
      "energy": 135,
      "protein": 2.5,
      "carbohydrate": 19.5,
      "sugars": 3.6,
      "totalFat": 5.5,
      "saturatedFat": 2.4,
      "transFat": 0.0,
      "sodium": 96
    }
  },
  "vegetarianStatus": "veg"
}

Rules:
- netQuantity unit must be one of: g, kg, ml, L, nos, pieces
- vegetarianStatus must be: "veg", "nonveg", or "unknown"
- All nutritional values are numbers (not strings). Use null for any field not printed.
- If no nutritional table exists at all, set nutritionalInfo to null.
- ingredients must be in the same order as printed on the label.
- allergensDeclared lists only the actual allergen substance names found (e.g. "milk", "wheat", "peanuts").`;

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

function parseJsonResponse(raw: string): LabelData {
  const text = raw
    .replace(/^```(?:json)?/m, "")
    .replace(/```$/m, "")
    .trim();
  return JSON.parse(text) as LabelData;
}

// ── Main extraction ───────────────────────────────────────────────────────────

export async function extractLabelData(imageUrl: string): Promise<LabelData> {
  const base64 = await fetchAsBase64(imageUrl);

  const callOpenAI = async (): Promise<LabelData> => {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      max_tokens: 2000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
                detail: "high",
              },
            },
            { type: "text", text: USER_PROMPT },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    return parseJsonResponse(content);
  };

  // Up to 3 attempts with exponential backoff
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await callOpenAI();
    } catch (err) {
      lastError = err as Error;
      console.error(`[ocr] Attempt ${attempt}/3 failed:`, lastError.message);
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, attempt * 2000));
      }
    }
  }
  throw lastError!;
}
