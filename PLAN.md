# MetriIQ — Implementation Plan
**SIH 2026 | Problem Statement 26034**  
**Stack: React + Node.js/Express + MongoDB + MinIO + OpenAI API**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                        │
│   Consumer | Inspector | Admin | Senior Officer dashboards       │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST / JSON
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                    │
│  Auth | Complaints | Inspections | Users | Rules | Analytics     │
└──────┬─────────────────────┬───────────────────────┬────────────┘
       │                     │                       │
┌──────▼──────┐   ┌──────────▼──────────┐  ┌────────▼───────────┐
│  MongoDB    │   │      MinIO           │  │   OpenAI API        │
│  (all data) │   │  (images/evidence)   │  │  Vision + Chat(GPT) │
└─────────────┘   └─────────────────────┘  └────────────────────┘
```

---

## Ruleset: Complete Compliance Checklist

Each rule is tagged with its detection method:
- `[OCR+LLM]` — extract text via OCR, validate with LLM
- `[VISION]` — requires OpenAI Vision to analyse the image directly
- `[OCR+VISION]` — needs both passes

---

### Part A — Legal Metrology (Packaged Commodities) Rules, 2011

#### Rule 6: Mandatory Declarations on Every Package

| # | Rule | What to Check | Method |
|---|------|--------------|--------|
| LM-01 | **Generic/common name of commodity** | Present and not just a brand name | `[OCR+LLM]` |
| LM-02 | **Net quantity** | Present, uses standard unit (g/kg/ml/L/no.), correct format | `[OCR+LLM]` |
| LM-03 | **MRP — exact format** | Must read "MRP ₹XX" OR "Maximum Retail Price ₹XX Inclusive of all taxes" — both parts mandatory | `[OCR+LLM]` |
| LM-04 | **Manufacturer / packer name** | Full legal name present | `[OCR+LLM]` |
| LM-05 | **Manufacturer / packer address** | Full address with PIN code present | `[OCR+LLM]` |
| LM-06 | **Consumer grievance contact** | Phone number AND email AND address of grievance officer or company | `[OCR+LLM]` |
| LM-07 | **Month and year of manufacture** | Present in MM/YYYY or abbreviated month format | `[OCR+LLM]` |
| LM-08 | **Best Before / Expiry date** | Present for perishables; not already expired at time of inspection | `[OCR+LLM]` |
| LM-09 | **Country of origin** | Mandatory if imported; "Product of India" acceptable for domestic | `[OCR+LLM]` |
| LM-10 | **Batch / Lot number** | Present (e.g., "Batch No.", "Lot No.", "B No.") | `[OCR+LLM]` |

#### Rule 7: Numeral/Font Height Requirements

These **cannot** be verified by reading text alone — they need actual pixel-height measurement relative to package size.

| # | Rule | Specification | Method |
|---|------|--------------|--------|
| LM-11 | **Net quantity numeral height — by weight/volume** | <200g/ml → ≥1mm; 200–500g/ml → ≥2mm; >500g/ml → ≥4mm | `[VISION]` |
| LM-12 | **Net quantity numeral height — by area/number** | PDP <100cm² → ≥1mm; 100–500cm² → ≥2mm; 500–2500cm² → ≥4mm; >2500cm² → ≥6mm | `[VISION]` |
| LM-13 | **General declaration text height** | All mandatory declaration text ≥1mm; molded/embossed ≥2mm | `[VISION]` |
| LM-14 | **Width-to-height ratio** | Width of each numeral/letter ≥ 1/3 of its height (except '1', 'i', 'I', 'l') | `[VISION]` |

#### Rule 8: Placement Requirements

| # | Rule | Specification | Method |
|---|------|--------------|--------|
| LM-15 | **Declarations on principal display panel (PDP)** | Product name, net quantity, MRP must be on PDP (largest face / 40% of cylindrical surface) | `[VISION]` |
| LM-16 | **Declarations not obscured** | No mandatory text hidden under seals, folds, stickers, or decorative elements | `[VISION]` |
| LM-17 | **MRP not overprinted over existing price** | Only one MRP visible; no sticker over sticker scenario | `[VISION]` |

---

### Part B — FSSAI Food Safety and Standards (Labelling and Display) Regulations, 2020

#### Mandatory Declarations (Food Products Only)

| # | Rule | What to Check | Method |
|---|------|--------------|--------|
| FS-01 | **FSSAI License / Registration Number** | 14-digit number present, format "FSSAI Lic. No. XXXXXXXXXXXXXX" | `[OCR+LLM]` |
| FS-02 | **Ingredients list** | Present; listed in descending order of weight/volume | `[OCR+LLM]` |
| FS-03 | **Sub-ingredients declared** | Compound ingredients >5% of final product must list their own ingredients in brackets | `[OCR+LLM]` |
| FS-04 | **Allergen declaration — in ingredients** | Any of the 8 allergens (gluten, crustaceans, eggs, fish, peanuts, soy, milk, tree nuts) highlighted in **bold** or *italic* or different colour | `[OCR+VISION]` |
| FS-05 | **Allergen declaration — "Contains" statement** | Separate "Contains: [allergen]" statement near ingredients list | `[OCR+LLM]` |
| FS-06 | **Nutritional information — all mandatory fields** | Energy(kcal), Protein(g), Carbohydrate(g), Sugars(g), Total Fat(g), Saturated Fat(g), Trans Fat(g), Sodium(mg) — per 100g/100ml | `[OCR+LLM]` |
| FS-07 | **Nutritional info per serving** | Per-serving column present alongside per-100g column | `[OCR+LLM]` |
| FS-08 | **Nutritional table is tabular** | Info must appear in a structured table, not running prose | `[VISION]` |
| FS-09 | **Best Before / Use By date format** | "Best Before DD/MM/YYYY" or "Use By DD/MM/YYYY" — not just "BB" | `[OCR+LLM]` |
| FS-10 | **Storage instructions** | Present where applicable (e.g., "Store in a cool dry place") | `[OCR+LLM]` |
| FS-11 | **Instructions for use / preparation** | Present where product requires reconstitution or specific preparation | `[OCR+LLM]` |

#### Veg / Non-Veg Symbol (Image-Only Rules)

| # | Rule | Specification | Method |
|---|------|--------------|--------|
| FS-12 | **Symbol presence** | Green (veg) or Brown (non-veg) symbol must be present | `[VISION]` |
| FS-13 | **Symbol shape — vegetarian** | Solid green circle inside a green square border | `[VISION]` |
| FS-14 | **Symbol shape — non-vegetarian** | Solid brown/dark-red triangle inside a brown/dark-red square border | `[VISION]` |
| FS-15 | **Symbol minimum size** | Symbol must be ≥3mm × 3mm (detected via reference object or package scale) | `[VISION]` |
| FS-16 | **Symbol placement** | Must appear on PDP, adjacent to product name or net quantity | `[VISION]` |
| FS-17 | **Symbol colour accuracy** | Green must be distinctly green (not yellow/lime); brown must be distinctly brown/dark-red | `[VISION]` |
| FS-18 | **Egg-containing products marked non-veg** | Products containing egg must carry the non-veg symbol | `[OCR+VISION]` |

#### General Label Quality

| # | Rule | What to Check | Method |
|---|------|--------------|--------|
| FS-19 | **Label readability / contrast** | Text is legible against background; no white-on-light or black-on-dark without sufficient contrast | `[VISION]` |
| FS-20 | **No misleading claims** | Packaging does not use words like "natural", "pure", "healthy" without FSSAI-approved substantiation | `[OCR+LLM]` |
| FS-21 | **Multi-language compliance** | If local language used, all mandatory declarations also present in English or Hindi | `[OCR+LLM]` |

---

### Detection Method — How Vision Rules Are Checked

For rules tagged `[VISION]`, the system cannot rely on extracted text. Instead it sends the raw image (or a cropped region) to **OpenAI GPT-4o Vision** with a targeted prompt per rule group:

#### Vision Prompt Strategy

**Prompt Group 1 — Symbol Detection (FS-12 to FS-18)**
```
You are a food label compliance inspector. Examine this product image.
1. Is there a veg/non-veg symbol? Describe its shape and color.
2. Is it a green circle inside a green square (vegetarian) or 
   a brown/dark-red triangle inside a brown/dark-red square (non-vegetarian)?
3. Does the symbol appear to be at least 3mm × 3mm in size relative 
   to the packaging?
4. Is it placed on the main/front face of the package near the product name?
Respond in JSON: { "symbol_present": bool, "type": "veg|nonveg|unclear|absent",
"shape_correct": bool, "color_correct": bool, "size_adequate": bool,
"placement_correct": bool, "issues": [string] }
```

**Prompt Group 2 — Font Size / Numeral Height (LM-11 to LM-14)**
```
You are a legal metrology compliance inspector.
The product net quantity shown on the label is [EXTRACTED_QTY].
Examine the font size of the net quantity numeral on this product image.
Given that the package appears to be [SMALL/MEDIUM/LARGE] (estimated from context):
- Are the net quantity numerals visibly large enough to be clearly read from 
  30cm distance without magnification?
- Does mandatory text appear at a consistent, legible size relative to the package?
- Is any mandatory declaration (MRP, name, date) in font so small it is difficult 
  to read?
Respond in JSON: { "qty_numeral_legible": bool, "qty_numeral_size": "adequate|too_small|unclear",
"mandatory_text_legible": bool, "issues": [string] }
```

**Prompt Group 3 — Placement & PDP Check (LM-15 to LM-17)**
```
Examine this product label image.
1. Is the product name visible on the front/main display panel?
2. Is the MRP (Maximum Retail Price) visible — is it on the main panel or buried on the back?
3. Is the net quantity visible on the front panel?
4. Are any mandatory declarations hidden under stickers, folds, or printed over by decorative elements?
5. Is there more than one price sticker layered on top of another?
Respond in JSON: { "name_on_pdp": bool, "mrp_on_pdp": bool, "qty_on_pdp": bool,
"declarations_obscured": bool, "multiple_price_stickers": bool, "issues": [string] }
```

**Prompt Group 4 — Nutritional Table Format (FS-08)**
```
Does this food label contain a nutritional information table?
1. Is it presented as a structured table with rows and columns (not free-form text)?
2. Does it have a column for "Per 100g/100ml" values?
3. Does it have a column for "Per Serving" values?
4. Are the following rows present: Energy, Protein, Carbohydrate, Sugars, 
   Total Fat, Saturated Fat, Trans Fat, Sodium?
Respond in JSON: { "table_present": bool, "is_tabular": bool, "has_per_100g": bool,
"has_per_serving": bool, "missing_rows": [string], "issues": [string] }
```

**Prompt Group 5 — Allergen Highlighting (FS-04)**
```
Look at the ingredients list on this label.
Are any allergens (milk, egg, wheat/gluten, soy, peanuts, tree nuts, fish, 
crustaceans) visually highlighted — shown in bold, italics, capital letters, 
underline, or a different colour compared to surrounding ingredient text?
Respond in JSON: { "allergens_found": [string], "allergens_highlighted": bool,
"highlight_method": "bold|italic|caps|underline|colour|none", "issues": [string] }
```

**Prompt Group 6 — Label Quality / Contrast (FS-19)**
```
Assess the overall readability of this product label.
1. Is the text colour sufficiently contrasting against the background colour?
2. Is any mandatory text (MRP, net qty, manufacturer, dates) printed in a 
   colour that blends with the background?
3. Is the label printed clearly without smudging, fading, or damage 
   that obscures mandatory information?
Respond in JSON: { "contrast_adequate": bool, "problem_areas": [string],
"overall_readability": "good|acceptable|poor", "issues": [string] }
```

---

## Phase-Wise Implementation Plan

---

### Phase 0 — Infrastructure Setup
**Goal:** Everyone can run the full stack locally with one command.  
**Duration:** 1–2 days

- [ ] **P0-01** Create `/backend` directory at project root; `npm init` with Express, Mongoose, Multer, MinIO SDK, OpenAI SDK, JWT, dotenv, cors, zod
- [ ] **P0-02** Create `docker-compose.yml` at project root — services: `mongo` (27017), `minio` (9000 + 9001 console)
- [ ] **P0-03** Create `backend/.env.example` with all required keys: `MONGO_URI`, `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `OPENAI_API_KEY`, `JWT_SECRET`, `PORT`
- [ ] **P0-04** Write `backend/src/server.ts` — Express app with CORS, JSON body parser, health check `GET /api/health`
- [ ] **P0-05** Write MinIO client module (`backend/src/lib/minio.ts`) — connects on startup, creates bucket if not exists
- [ ] **P0-06** Write Mongoose connection module (`backend/src/lib/db.ts`) — connects with retry logic
- [ ] **P0-07** Add `start:dev` script using `tsx --watch` (or `ts-node-dev`)
- [ ] **P0-08** Verify: `docker-compose up -d` → `npm run start:dev` → `GET /api/health` returns `{ ok: true }`
- [ ] **P0-09** Add `VITE_API_BASE_URL=http://localhost:4000` to frontend `.env.local`

---

### Phase 1 — MongoDB Schemas & Auth
**Goal:** All domain models defined; login returns a real JWT.  
**Duration:** 2 days

- [ ] **P1-01** Define `User` schema: `{ name, email, passwordHash, role: enum[officer|admin|senior|consumer], district, createdAt }`
- [ ] **P1-02** Define `Product` schema: `{ name, category, manufacturer, fssaiNo, barcode, createdAt }`
- [ ] **P1-03** Define `Inspection` schema: `{ inspectionId, productRef, officerId, status: enum[draft|submitted|reviewed|closed], images:[{url,type:front|back|side|extra}], extractedData:{}, complianceReport:{}, createdAt, updatedAt }`
- [ ] **P1-04** Define `Complaint` schema: `{ complaintId, consumerId, productDescription, images:[url], status, assignedOfficerId, inspectionRef, createdAt }`
- [ ] **P1-05** Define `ComplianceRule` schema: `{ ruleId, category:enum[LM|FSSAI], code, title, description, detectionMethod:enum[ocr_llm|vision|ocr_vision], active, version }`
- [ ] **P1-06** Write seed script `backend/src/scripts/seed.ts` — inserts demo users (officer, admin, senior, consumer) + all 21 compliance rules from this plan
- [ ] **P1-07** `POST /api/auth/login` — validates email + password, returns `{ token, user }` (JWT 7d expiry)
- [ ] **P1-08** `GET /api/auth/me` — returns current user from JWT
- [ ] **P1-09** Write `requireAuth` middleware — verifies JWT, attaches `req.user`
- [ ] **P1-10** Write `requireRole(...roles)` middleware — checks `req.user.role`
- [ ] **P1-11** Run seed, test login with all 4 demo users via Postman / curl

---

### Phase 2 — Image Upload to MinIO
**Goal:** Inspector can upload images; backend stores them in MinIO and returns a URL.  
**Duration:** 1 day

- [ ] **P2-01** `POST /api/uploads/image` — `multipart/form-data`, accepts up to 5 images (10MB each), validates MIME type (jpeg/png/webp only)
- [ ] **P2-02** Resize/compress images before storing using `sharp` — max 1920px wide, quality 85 — to keep OpenAI Vision costs manageable
- [ ] **P2-03** Store in MinIO at path `{year}/{month}/{inspectionId}/{uuid}.jpg`, return `{ fileKey, url }` for each
- [ ] **P2-04** `GET /api/uploads/:fileKey` — generates MinIO presigned URL (1h expiry), redirects client to it
- [ ] **P2-05** Test: upload a product image via Postman, verify file appears in MinIO console at `localhost:9001`

---

### Phase 3 — OCR + Text Extraction Pipeline
**Goal:** Send a product image → get back structured label data as JSON.  
**Duration:** 3 days

- [ ] **P3-01** Create `backend/src/services/ocrService.ts` — primary extraction function `extractLabelData(imageUrl: string): Promise<LabelData>`
- [ ] **P3-02** Write GPT-4o Vision call in `extractLabelData` — send image URL + the extraction prompt below
- [ ] **P3-03** Define extraction prompt (system message):
  ```
  You are a label extraction engine for Indian packaged food products.
  Extract ALL of the following from the product label image. 
  Return ONLY valid JSON matching the schema. If a field is not found, use null.
  
  Schema: {
    productName: string,
    genericName: string,
    netQuantity: { value: number, unit: string } | null,
    mrp: { value: number, currency: "INR", rawText: string } | null,
    manufacturerName: string | null,
    manufacturerAddress: string | null,
    consumerCarePhone: string | null,
    consumerCareEmail: string | null,
    consumerCareAddress: string | null,
    manufactureDate: string | null,       // ISO or MM/YYYY
    bestBeforeDate: string | null,
    expiryDate: string | null,
    batchNumber: string | null,
    countryOfOrigin: string | null,
    fssaiLicenseNo: string | null,
    ingredients: string[] | null,         // in order as printed
    allergensDeclared: string[] | null,
    containsStatement: string | null,
    storageInstructions: string | null,
    nutritionalInfo: {
      per100g: { energy:number|null, protein:number|null, carbohydrate:number|null,
                 sugars:number|null, totalFat:number|null, saturatedFat:number|null,
                 transFat:number|null, sodium:number|null },
      perServing: { servingSize:string|null, energy:number|null, protein:number|null,
                   carbohydrate:number|null, sugars:number|null, totalFat:number|null,
                   saturatedFat:number|null, transFat:number|null, sodium:number|null }
    } | null,
    vegetarianStatus: "veg" | "nonveg" | "unknown"
  }
  ```
- [ ] **P3-04** Define `LabelData` TypeScript type matching the schema above
- [ ] **P3-05** Add retry logic (max 2 retries with 2s backoff) and timeout (30s) on the OpenAI call
- [ ] **P3-06** Add response parsing: `JSON.parse` inside try/catch; if parse fails, retry with a "fix your JSON" follow-up message
- [ ] **P3-07** `POST /api/inspections/extract` — accepts `{ imageUrl }`, calls `extractLabelData`, returns `LabelData`
- [ ] **P3-08** Test with 5 different product images; verify extraction accuracy; tune prompt where fields are missed

---

### Phase 4 — Rule Engine: OCR+LLM Rules
**Goal:** Run the `[OCR+LLM]` compliance rules against extracted label data.  
**Duration:** 3 days

- [ ] **P4-01** Create `backend/src/services/ruleEngine.ts` — function `checkOcrRules(labelData: LabelData): RuleResult[]`
- [ ] **P4-02** Define `RuleResult` type: `{ ruleCode: string, title: string, status: "pass"|"fail"|"warning"|"na", detail: string }`
- [ ] **P4-03** Implement deterministic checks (no LLM needed — pure JS logic):
  - LM-01: `productName` or `genericName` not null and not blank
  - LM-02: `netQuantity` not null, `unit` in allowed list (`g|kg|ml|L|nos|pieces`)
  - LM-03: `mrp.rawText` matches regex `/MRP\s*₹?\s*[\d.]+|Maximum Retail Price/i` AND contains "inclusive of all taxes" (case-insensitive)
  - LM-04: `manufacturerName` not null
  - LM-05: `manufacturerAddress` not null and length > 20 chars (heuristic for full address)
  - LM-06: at least one of `consumerCarePhone`, `consumerCareEmail` not null
  - LM-07: `manufactureDate` not null
  - LM-08: `bestBeforeDate` or `expiryDate` not null; if present, date is in the future
  - LM-09: for imported goods (detected via `countryOfOrigin` ≠ "India"), field must be present
  - LM-10: `batchNumber` not null
  - FS-01: `fssaiLicenseNo` matches 14-digit pattern `/^\d{14}$/`
  - FS-02: `ingredients` array not null and length > 0
  - FS-05: `containsStatement` not null if `allergensDeclared` is non-empty
  - FS-06/07: `nutritionalInfo.per100g` has all 8 required fields non-null
  - FS-09: `bestBeforeDate` format is human-readable (not just "BB" abbreviation)
- [ ] **P4-04** Implement LLM-assisted checks — send extracted data to GPT-4o for semantic validation:
  ```
  Rules for LLM:
  - FS-03: Are compound ingredients (e.g., "Milk Chocolate (cocoa 30%, sugar, milk solids)") 
           properly sub-declared in brackets?
  - FS-20: Does the product name or any visible claim use words like 
           "natural", "pure", "healthy", "fresh", "premium" without substantiation?
  - FS-21: If multiple languages are used, are all mandatory declarations 
           present in at least English or Hindi?
  - LM-01: Is the declared name a generic commodity name or just a brand name?
  ```
- [ ] **P4-05** Combine deterministic + LLM results into a single `RuleResult[]` array, sorted by rule code
- [ ] **P4-06** `POST /api/inspections/check-ocr` — accepts `LabelData`, returns `RuleResult[]`

---

### Phase 5 — Rule Engine: Vision-Only Rules
**Goal:** Run the `[VISION]` compliance rules against the raw product images.  
**Duration:** 3 days

- [ ] **P5-01** Create `backend/src/services/visionRuleEngine.ts` — function `checkVisionRules(imageUrls: string[], labelData: LabelData): Promise<RuleResult[]>`
- [ ] **P5-02** Implement **Symbol Detection** (FS-12 to FS-18) — use Prompt Group 1 from ruleset above; map response to `RuleResult[]`
- [ ] **P5-03** Implement **Font Size Check** (LM-11 to LM-14) — use Prompt Group 2; inject `labelData.netQuantity` into prompt; map response
- [ ] **P5-04** Implement **PDP Placement Check** (LM-15 to LM-17) — use Prompt Group 3; map response
- [ ] **P5-05** Implement **Nutritional Table Format** (FS-08) — use Prompt Group 4; map response
- [ ] **P5-06** Implement **Allergen Highlighting** (FS-04) — use Prompt Group 5; map response
- [ ] **P5-07** Implement **Label Readability** (FS-19) — use Prompt Group 6; map response
- [ ] **P5-08** Run all vision prompts in `Promise.all` (parallel) to keep latency low — 6 calls in parallel is fine for GPT-4o
- [ ] **P5-09** `POST /api/inspections/check-vision` — accepts `{ imageUrls, labelData }`, returns `RuleResult[]`

---

### Phase 6 — Compliance Report Generation
**Goal:** Combine OCR + Vision results into a final structured compliance report.  
**Duration:** 2 days

- [ ] **P6-01** Define `ComplianceReport` type:
  ```ts
  {
    reportId: string,
    generatedAt: Date,
    overallStatus: "compliant" | "non_compliant" | "partially_compliant",
    complianceScore: number,         // 0–100
    ruleResults: RuleResult[],
    failedRules: RuleResult[],
    warningRules: RuleResult[],
    passedRules: RuleResult[],
    summary: string,                  // LLM-generated 2-3 sentence summary
    violationCategories: string[],    // e.g., ["Missing MRP format", "No veg symbol"]
    riskLevel: "low" | "medium" | "high"
  }
  ```
- [ ] **P6-02** Create `backend/src/services/reportService.ts` — `generateReport(ocrResults, visionResults, labelData): ComplianceReport`
- [ ] **P6-03** Calculate `complianceScore`: `(passCount / totalApplicableRules) * 100`
- [ ] **P6-04** Set `riskLevel`: score ≥ 90 → low, 70–89 → medium, <70 → high
- [ ] **P6-05** Call GPT-4o to generate a plain-English `summary` from the failed rules list
- [ ] **P6-06** `POST /api/inspections/:id/run-compliance` — orchestrates the full pipeline:
  1. Load inspection from DB
  2. Call `extractLabelData` on front image
  3. Call `checkOcrRules` on extracted data
  4. Call `checkVisionRules` on all images + extracted data
  5. Call `generateReport`
  6. Save report to `inspection.complianceReport` in MongoDB
  7. Return full `ComplianceReport`
- [ ] **P6-07** Estimated latency: target <45 seconds end-to-end for a complete inspection

---

### Phase 7 — Full Inspection CRUD API
**Goal:** All inspection lifecycle endpoints working.  
**Duration:** 2 days

- [ ] **P7-01** `POST /api/inspections` — create draft inspection (officer only)
- [ ] **P7-02** `PATCH /api/inspections/:id/images` — add images to draft (links MinIO URLs)
- [ ] **P7-03** `GET /api/inspections/:id` — get inspection with report
- [ ] **P7-04** `GET /api/inspections` — list with filters (status, officerId, date range, district)
- [ ] **P7-05** `PATCH /api/inspections/:id/status` — officer submits, admin reviews, senior closes
- [ ] **P7-06** `POST /api/complaints` — consumer submits complaint (with images)
- [ ] **P7-07** `GET /api/complaints` — admin lists, filters by status
- [ ] **P7-08** `PATCH /api/complaints/:id/assign` — admin assigns to officer
- [ ] **P7-09** `GET /api/analytics/summary` — counts: total inspections, compliance rate, open complaints, violations by category
- [ ] **P7-10** `GET /api/rules` — list all compliance rules (for admin rule management page)

---

### Phase 8 — Frontend Integration
**Goal:** Replace every `localStorage` call and stub service with real API calls.  
**Duration:** 4 days

- [ ] **P8-01** Create `src/lib/apiClient.ts` — Axios (or fetch) wrapper that reads `VITE_API_BASE_URL`, attaches JWT from localStorage, handles 401 → redirect to login
- [ ] **P8-02** Replace `authService` stub → call `POST /api/auth/login`, store token in localStorage, `GET /api/auth/me` on app load
- [ ] **P8-03** Replace image capture flow → upload to `POST /api/uploads/image`, store returned `fileKey` in inspection draft state
- [ ] **P8-04** Replace stub `ocrService` → call `POST /api/inspections/extract` with uploaded image URL
- [ ] **P8-05** Add "Run Compliance Check" button in Inspector workflow → calls `POST /api/inspections/:id/run-compliance`
- [ ] **P8-06** Build `ComplianceReportView` component — renders rule results as pass/fail cards grouped by category (LM / FSSAI), shows score, risk badge, summary text
- [ ] **P8-07** Replace complaint submission → call `POST /api/complaints` with images
- [ ] **P8-08** Replace analytics data → call `GET /api/analytics/summary`
- [ ] **P8-09** Replace inspection list in officer/admin dashboards → call `GET /api/inspections`
- [ ] **P8-10** Replace consumer complaint list → call `GET /api/complaints` (consumer's own)
- [ ] **P8-11** Test full end-to-end flow: Consumer submits complaint → Admin assigns → Officer opens, uploads image → runs compliance check → views report

---

### Phase 9 — Multi-Image Intelligence
**Goal:** Handle curved/multi-angle packaging (a key challenge from your SIH PPT).  
**Duration:** 2 days

- [ ] **P9-01** Inspector flow requires minimum 2 images: front + back (enforce in UI and API validation)
- [ ] **P9-02** Modify `extractLabelData` to accept an array of image URLs — run a single Vision call with all images side-by-side (GPT-4o Vision supports multiple images in one call)
- [ ] **P9-03** Modify `checkVisionRules` to use front image for PDP/symbol checks and back image for nutritional table / ingredient checks
- [ ] **P9-04** Add `imageQualityCheck(imageUrl)` — Vision prompt that scores blur, glare, angle, coverage (1–10); if score <5, return `{ adequate: false, reason: "..." }` so officer is prompted to retake
- [ ] **P9-05** Add quality gate in `POST /api/uploads/image` — runs quality check; returns warning (not rejection) if quality is low, includes `qualityWarning` in response

---

### Phase 10 — Demo Hardening & Polish
**Goal:** The prototype is stable, fast, and impressive for judges.  
**Duration:** 2 days

- [ ] **P10-01** Pre-load 5 sample product images in MinIO (biscuit, snack, beverage, dairy, instant noodles) — spanning compliant and non-compliant examples
- [ ] **P10-02** Create demo mode: one-click demo inspection using a pre-loaded product → shows the full pipeline running live in ~30 seconds
- [ ] **P10-03** Add loading states in frontend: "Extracting label data…" → "Running compliance rules…" → "Generating report…" (progress steps, not just spinner)
- [ ] **P10-04** Add error boundaries in frontend — if AI call fails, show graceful message with retry button
- [ ] **P10-05** Mobile-responsive: Inspector image capture flow must work on phone (inspect on-site scenario for judges)
- [ ] **P10-06** Ensure all 4 role flows complete without error from fresh login
- [ ] **P10-07** Write `README.md` with: one-command setup (`docker-compose up`), environment variable list, demo credentials, sample products

---

## File Structure (After Implementation)

```
MetriIQ/
├── docker-compose.yml
├── .env.example
├── frontend/                  (current src/ → rename or leave)
│   ├── src/
│   │   ├── lib/apiClient.ts   ← NEW
│   │   ├── services/          ← all stubs replaced with real API calls
│   │   └── components/
│   │       └── ComplianceReportView.tsx  ← NEW
│   └── .env.local
└── backend/
    ├── src/
    │   ├── server.ts
    │   ├── lib/
    │   │   ├── db.ts
    │   │   └── minio.ts
    │   ├── models/
    │   │   ├── User.ts
    │   │   ├── Inspection.ts
    │   │   ├── Complaint.ts
    │   │   ├── Product.ts
    │   │   └── ComplianceRule.ts
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── uploads.ts
    │   │   ├── inspections.ts
    │   │   ├── complaints.ts
    │   │   ├── analytics.ts
    │   │   └── rules.ts
    │   ├── middleware/
    │   │   ├── requireAuth.ts
    │   │   └── requireRole.ts
    │   ├── services/
    │   │   ├── ocrService.ts          ← GPT-4o Vision extraction
    │   │   ├── ruleEngine.ts          ← OCR+LLM rule checks
    │   │   ├── visionRuleEngine.ts    ← Vision-only rule checks
    │   │   └── reportService.ts       ← Compliance report generation
    │   └── scripts/
    │       └── seed.ts
    ├── package.json
    └── .env
```

---

## Key Decisions & Rationale

| Decision | Why |
|---|---|
| MinIO instead of S3 | Runs locally in Docker; `aws-sdk` compatible so switching to S3 is changing 3 env vars |
| GPT-4o Vision for both OCR and Vision rules | Single model, single SDK, highest accuracy — no PaddleOCR setup complexity for the prototype |
| Parallel Vision prompts (`Promise.all`) | Keeps total AI latency ~15–20s instead of ~60s if sequential |
| Deterministic JS checks first, LLM only for semantic | Saves tokens; LLM only where human language understanding is needed |
| Multiple images in one Vision call | GPT-4o supports up to 10 images per call; combining front+back reduces API calls by 50% |
| `sharp` for image compression before MinIO | Reduces OpenAI Vision token cost (charged by image resolution) |

---

## Estimated Timeline

| Phase | Scope | Days |
|---|---|---|
| 0 — Infrastructure | Docker, Express skeleton | 1–2 |
| 1 — Auth & Schemas | MongoDB models, JWT auth, seed | 2 |
| 2 — Image Upload | MinIO integration, upload API | 1 |
| 3 — OCR Extraction | GPT-4o Vision label extraction | 3 |
| 4 — OCR+LLM Rules | 14 deterministic + semantic rules | 3 |
| 5 — Vision Rules | 7 vision-only rule groups | 3 |
| 6 — Report Generation | Combine, score, summarise | 2 |
| 7 — Inspection CRUD | All API endpoints | 2 |
| 8 — Frontend Integration | Replace all stubs | 4 |
| 9 — Multi-Image | Quality check, multi-angle | 2 |
| 10 — Demo Polish | Sample data, loading states | 2 |
| **Total** | | **~25 days** |
