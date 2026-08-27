import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/db.js";
import { User } from "../models/User.js";
import { ComplianceRule } from "../models/ComplianceRule.js";

// ─── Demo Users ────────────────────────────────────────────────────────────────

const DEMO_USERS = [
  {
    name: "Priya Sharma",
    email: "officer@legalmetrology.dev",
    password: "officer123",
    role: "officer" as const,
    district: "Mumbai Suburban",
  },
  {
    name: "Vikram Desai",
    email: "admin@legalmetrology.dev",
    password: "admin123",
    role: "admin" as const,
    district: "Mumbai",
  },
  {
    name: "Anita Kulkarni",
    email: "senior@legalmetrology.dev",
    password: "senior123",
    role: "senior" as const,
    district: "Maharashtra",
  },
  {
    name: "Rahul Mehta",
    email: "consumer@legalmetrology.dev",
    password: "consumer123",
    role: "consumer" as const,
    district: "Pune",
  },
];

// ─── Compliance Rules ──────────────────────────────────────────────────────────

const COMPLIANCE_RULES = [
  // ── Legal Metrology — Rule 6: Mandatory Declarations ──
  {
    ruleCode: "LM-01",
    category: "LM",
    title: "Generic/common name of commodity",
    description:
      "The generic or common name of the commodity must be present on the label. A brand name alone does not satisfy this requirement.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-02",
    category: "LM",
    title: "Net quantity declaration",
    description:
      "Net quantity must be declared in standard units: weight (g/kg), volume (ml/L), or count (nos/pieces). Value and unit must both be present.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-03",
    category: "LM",
    title: "MRP — mandatory format",
    description:
      'MRP must be declared as "MRP ₹XX" or "Maximum Retail Price ₹XX" AND must include the phrase "Inclusive of all taxes" (case-insensitive).',
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-04",
    category: "LM",
    title: "Manufacturer / packer name",
    description: "Full legal name of the manufacturer or packer must be present.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-05",
    category: "LM",
    title: "Manufacturer / packer address",
    description:
      "Complete address of the manufacturer or packer including PIN code must be declared.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-06",
    category: "LM",
    title: "Consumer grievance contact",
    description:
      "Name, address, telephone number, and/or email of the consumer grievance officer or company must be present.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-07",
    category: "LM",
    title: "Month and year of manufacture",
    description:
      "Month and year of manufacture, packing, or import must be declared (format: MM/YYYY or abbreviated month).",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-08",
    category: "LM",
    title: "Best Before / Expiry date",
    description:
      "Best Before or Expiry date must be present for perishable goods. The date must not be in the past at time of inspection.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-09",
    category: "LM",
    title: "Country of origin (imported goods)",
    description:
      "For imported products, country of origin must be declared. Domestic products may state 'Product of India'.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "LM-10",
    category: "LM",
    title: "Batch / Lot number",
    description: "A batch number, lot number, or code must be present on the label.",
    detectionMethod: "ocr_llm",
  },

  // ── Legal Metrology — Rule 7: Font / Numeral Height ──
  {
    ruleCode: "LM-11",
    category: "LM",
    title: "Net quantity numeral height (weight/volume packages)",
    description:
      "Numeral height for net quantity: <200g/ml → ≥1mm; 200–500g/ml → ≥2mm; >500g/ml → ≥4mm. Assessed visually for legibility.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "LM-12",
    category: "LM",
    title: "Net quantity numeral height (area/count packages)",
    description:
      "By PDP area: <100cm² → ≥1mm; 100–500cm² → ≥2mm; 500–2500cm² → ≥4mm; >2500cm² → ≥6mm. Assessed visually for legibility.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "LM-13",
    category: "LM",
    title: "General declaration text height",
    description:
      "All mandatory declaration text must be at least 1mm high; molded/embossed declarations must be at least 2mm.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "LM-14",
    category: "LM",
    title: "Character width-to-height ratio",
    description:
      "Width of each numeral or letter must not be less than 1/3 of its height (except '1', 'i', 'I', 'l').",
    detectionMethod: "vision",
  },

  // ── Legal Metrology — Rule 8: Placement ──
  {
    ruleCode: "LM-15",
    category: "LM",
    title: "Mandatory declarations on principal display panel",
    description:
      "Product name, net quantity, and MRP must be on the principal display panel (largest face or 40% of cylindrical surface).",
    detectionMethod: "vision",
  },
  {
    ruleCode: "LM-16",
    category: "LM",
    title: "Declarations not obscured",
    description:
      "No mandatory declaration may be hidden under seals, folds, stickers, or decorative elements.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "LM-17",
    category: "LM",
    title: "Single MRP — no sticker-over-sticker",
    description:
      "Only one MRP must be visible. A price sticker pasted over an existing printed price is a violation.",
    detectionMethod: "vision",
  },

  // ── FSSAI — Mandatory Declarations ──
  {
    ruleCode: "FS-01",
    category: "FSSAI",
    title: "FSSAI License / Registration Number",
    description:
      "A valid 14-digit FSSAI license or registration number must be present in the format 'FSSAI Lic. No. XXXXXXXXXXXXXX'.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-02",
    category: "FSSAI",
    title: "Ingredients list present",
    description:
      "A list of ingredients must be present for food products with more than one ingredient.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-03",
    category: "FSSAI",
    title: "Sub-ingredients of compound ingredients declared",
    description:
      "Compound ingredients making up more than 5% of the final product must list their own ingredients in brackets after the compound ingredient name.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-04",
    category: "FSSAI",
    title: "Allergen highlighting in ingredients list",
    description:
      "Any of the 8 major allergens (gluten, crustaceans, eggs, fish, peanuts, soy, milk, tree nuts) present in the product must be visually highlighted (bold, italic, or different colour) within the ingredients list.",
    detectionMethod: "ocr_vision",
  },
  {
    ruleCode: "FS-05",
    category: "FSSAI",
    title: "'Contains' allergen statement",
    description:
      "A separate 'Contains: [allergen]' statement must appear near the ingredients list if any of the 8 major allergens are present.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-06",
    category: "FSSAI",
    title: "Nutritional information — per 100g/100ml",
    description:
      "Nutritional info per 100g/100ml must include: Energy (kcal), Protein (g), Carbohydrate (g), Sugars (g), Total Fat (g), Saturated Fat (g), Trans Fat (g), Sodium (mg).",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-07",
    category: "FSSAI",
    title: "Nutritional information — per serving",
    description:
      "A per-serving column with serving size declared must accompany the per-100g/100ml nutritional information.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-08",
    category: "FSSAI",
    title: "Nutritional information in tabular format",
    description:
      "Nutritional information must appear in a structured table with clearly labelled rows and columns — not in running prose.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "FS-09",
    category: "FSSAI",
    title: "Best Before / Use By date format",
    description:
      "The date must be written in full as 'Best Before DD/MM/YYYY' or 'Use By DD/MM/YYYY', not just an abbreviation.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-10",
    category: "FSSAI",
    title: "Storage instructions",
    description:
      "Storage instructions must be present where the product requires specific storage conditions (e.g., 'Store in a cool dry place', 'Refrigerate after opening').",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-11",
    category: "FSSAI",
    title: "Instructions for use / preparation",
    description:
      "Preparation or usage instructions must be present where the product requires reconstitution or specific preparation steps.",
    detectionMethod: "ocr_llm",
  },

  // ── FSSAI — Veg / Non-Veg Symbol ──
  {
    ruleCode: "FS-12",
    category: "FSSAI",
    title: "Veg/Non-Veg symbol presence",
    description:
      "Every packaged food must carry either the green vegetarian symbol or the brown/dark-red non-vegetarian symbol.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "FS-13",
    category: "FSSAI",
    title: "Vegetarian symbol — correct shape",
    description:
      "Vegetarian symbol must be a solid green circle inside a green square border.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "FS-14",
    category: "FSSAI",
    title: "Non-vegetarian symbol — correct shape",
    description:
      "Non-vegetarian symbol must be a solid brown/dark-red filled triangle inside a brown/dark-red square border.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "FS-15",
    category: "FSSAI",
    title: "Veg/Non-Veg symbol minimum size (≥3mm × 3mm)",
    description:
      "The veg/non-veg symbol must be at least 3mm × 3mm in physical size. Assessed visually relative to package scale.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "FS-16",
    category: "FSSAI",
    title: "Veg/Non-Veg symbol placement on PDP",
    description:
      "The symbol must appear on the principal display panel, adjacent to the product name or net quantity declaration.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "FS-17",
    category: "FSSAI",
    title: "Veg/Non-Veg symbol colour accuracy",
    description:
      "The vegetarian symbol must be distinctly green (not yellow/lime). The non-veg symbol must be distinctly brown or dark red.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "FS-18",
    category: "FSSAI",
    title: "Egg-containing products marked non-veg",
    description:
      "Any product containing egg in its ingredients must carry the non-vegetarian (brown triangle) symbol.",
    detectionMethod: "ocr_vision",
  },

  // ── FSSAI — General Label Quality ──
  {
    ruleCode: "FS-19",
    category: "FSSAI",
    title: "Label readability and contrast",
    description:
      "All mandatory text must be legible with sufficient contrast against the label background. No mandatory text may blend into the background colour.",
    detectionMethod: "vision",
  },
  {
    ruleCode: "FS-20",
    category: "FSSAI",
    title: "No misleading health/quality claims",
    description:
      "Labels must not use unsubstantiated claims such as 'natural', 'pure', 'healthy', 'fresh' without FSSAI-approved substantiation.",
    detectionMethod: "ocr_llm",
  },
  {
    ruleCode: "FS-21",
    category: "FSSAI",
    title: "Multi-language compliance",
    description:
      "If regional/local languages are used, all mandatory declarations must also appear in English or Hindi.",
    detectionMethod: "ocr_llm",
  },
] as const;

// ─── Seed Function ─────────────────────────────────────────────────────────────

async function seed() {
  await connectDB();

  // ── Users ──
  console.log("[seed] Seeding users...");
  for (const u of DEMO_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`  [skip] User ${u.email} already exists`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, passwordHash });
    console.log(`  [ok] Created ${u.role}: ${u.email}`);
  }

  // ── Compliance Rules ──
  console.log("[seed] Seeding compliance rules...");
  for (const rule of COMPLIANCE_RULES) {
    const existing = await ComplianceRule.findOne({ ruleCode: rule.ruleCode });
    if (existing) {
      // Update in case description changed
      await ComplianceRule.updateOne({ ruleCode: rule.ruleCode }, { $set: rule });
      console.log(`  [update] Rule ${rule.ruleCode}`);
    } else {
      await ComplianceRule.create({ ...rule, active: true, version: "1.0" });
      console.log(`  [ok] Rule ${rule.ruleCode}: ${rule.title}`);
    }
  }

  console.log("\n[seed] Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
