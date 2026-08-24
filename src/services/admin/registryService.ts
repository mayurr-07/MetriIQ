import { COMPLIANCE_RULES } from "@/services/inspection/complianceService";
import { draftStore } from "@/services/inspection/draftStore";
import { complaintService } from "@/services/inspection/complaintService";
import {
  SCOPE_LOCAL,
  SCOPE_UNAVAILABLE,
  type DataScope,
  type ManufacturerRecord,
  type OfficerRecord,
  type ProductRecord,
  type RuleRecord,
} from "@/types/analytics";

/**
 * Officer directory.
 *
 * No identity/HR service exists yet, so this returns an empty directory with
 * an explicit UNAVAILABLE scope rather than inventing a staff list.
 */
export const officerManagementService = {
  list(): { officers: OfficerRecord[]; scope: DataScope } {
    return { officers: [], scope: SCOPE_UNAVAILABLE };
  },
  get(_id: string): OfficerRecord | null {
    return null;
  },
};

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Product registry.
 *
 * Derived from products actually inspected or reported on this device. These
 * are marked DETECTED — captured from OCR or officer entry — and are
 * deliberately NOT promoted to VERIFIED master reference data.
 */
export const productService = {
  list(): { products: ProductRecord[]; scope: DataScope } {
    const map = new Map<string, ProductRecord>();

    for (const draft of draftStore.list()) {
      const name = draft.product.productName.trim();
      if (!name) continue;
      const key = slug(name);
      const existing = map.get(key);
      if (existing) {
        existing.relatedInspectionIds.push(draft.reference);
        continue;
      }
      map.set(key, {
        id: key,
        name,
        brand: draft.product.brand || "—",
        category: draft.product.category || "Uncategorised",
        manufacturerId: draft.product.brand ? slug(draft.product.brand) : null,
        manufacturerName: draft.product.brand || null,
        verification: "DETECTED",
        relatedInspectionIds: [draft.reference],
      });
    }

    for (const complaint of complaintService.list()) {
      const name = complaint.productName.trim();
      if (!name) continue;
      const key = slug(name);
      if (map.has(key)) continue;
      map.set(key, {
        id: key,
        name,
        brand: complaint.brand || "—",
        category: "Consumer reported",
        manufacturerId: complaint.brand ? slug(complaint.brand) : null,
        manufacturerName: complaint.manufacturer || complaint.brand || null,
        verification: "UNVERIFIED",
        relatedInspectionIds: complaint.linkedInspectionId ? [complaint.linkedInspectionId] : [],
      });
    }

    const products = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    return { products, scope: products.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE };
  },
};

/**
 * Manufacturer registry.
 *
 * Names are derived from local records. No external licence-verification
 * source is connected, so every entry reports SOURCE_NOT_CONNECTED rather
 * than implying a verified government licence check.
 */
export const manufacturerService = {
  list(): { manufacturers: ManufacturerRecord[]; scope: DataScope } {
    const map = new Map<string, ManufacturerRecord>();
    const { products } = productService.list();

    for (const product of products) {
      const name = product.manufacturerName?.trim();
      if (!name || name === "—") continue;
      const key = slug(name);
      const existing = map.get(key);
      if (existing) {
        existing.productCount += 1;
        existing.relatedInspectionIds.push(...product.relatedInspectionIds);
        continue;
      }
      map.set(key, {
        id: key,
        name,
        identifier: null,
        district: null,
        verification: "SOURCE_NOT_CONNECTED",
        productCount: 1,
        relatedInspectionIds: [...product.relatedInspectionIds],
      });
    }

    const manufacturers = [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    return { manufacturers, scope: manufacturers.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE };
  },
};

/**
 * Rule registry.
 *
 * Built from the same rule definitions the compliance interface uses, so the
 * rule set stays configurable and versioned in one place instead of being
 * hard-coded into screens. No authoritative gazette source is connected, so
 * `sourceReference` is null everywhere.
 */
export const ruleService = {
  list(): { rules: RuleRecord[]; scope: DataScope } {
    const rules: RuleRecord[] = COMPLIANCE_RULES.map((rule) => ({
      id: rule.id,
      code: rule.code,
      title: rule.title,
      category: rule.code.includes("6(1)") ? "Mandatory declaration" : "Packaging requirement",
      description: rule.requirement,
      applicableCategory: "Pre-packaged commodity",
      requirement: rule.requirement,
      status: "ACTIVE",
      version: "v1 (development)",
      effectiveDate: null,
      sourceReference: null,
    }));
    return { rules, scope: SCOPE_LOCAL };
  },
};
