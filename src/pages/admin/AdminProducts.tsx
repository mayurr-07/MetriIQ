import { useMemo, useState } from "react";
import { Globe, Search } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import DataNotice from "@/components/data/DataNotice";
import { productService } from "@/services/admin/registryService";
import { cn } from "@/utils/cn";

const VERIFICATION_STYLE = {
  VERIFIED: "border-[#10B981]/35 bg-[#10B981]/10 text-[#10B981]",
  DETECTED: "border-[#F59E0B]/35 bg-[#F59E0B]/10 text-[#F59E0B]",
  UNVERIFIED: "border-white/15 bg-white/5 text-[#94A3B8]",
} as const;

const VERIFICATION_LABEL = {
  VERIFIED: "Verified reference",
  DETECTED: "Detected data",
  UNVERIFIED: "Unverified",
} as const;

export default function AdminProducts() {
  const [query, setQuery] = useState("");
  const { products, scope } = productService.list();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Products"]}
        title="Products"
        description="Commodity registry assembled from inspected and reported products."
      />

      <DataNotice scope={scope} />

      <div className="my-4 flex items-start gap-3 border border-[#F59E0B]/30 bg-[#F59E0B]/8 px-4 py-3">
        <p className="text-[0.8rem] leading-relaxed text-[#F0F2F5]/90">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#F59E0B]">
            Detected vs verified ·{" "}
          </span>
          Values captured by OCR or entered during an inspection are marked{" "}
          <strong className="text-[#F59E0B]">Detected data</strong>. They are not promoted to verified
          master reference data until an authoritative source is connected.
        </p>
      </div>

      <label className="relative mb-4 block">
        <span className="sr-only">Search products</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product, brand or category"
          className="w-full border border-white/12 bg-[#0B111C] py-2.5 pl-10 pr-3 font-mono text-xs text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
        />
      </label>

      <Table columns={["Product", "Brand", "Category", "Data status", "Related inspections"]}>
        {filtered.length === 0 ? (
          <TableEmptyRow
            colSpan={5}
            icon={<Globe className="h-5 w-5" />}
            title="No products recorded"
            description="Products appear here once they have been inspected or reported on this device."
          />
        ) : (
          filtered.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-[0.78rem] text-[#94A3B8]">{product.brand}</TableCell>
              <TableCell className="text-[0.78rem] text-[#94A3B8]">{product.category}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center border px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.16em]",
                    VERIFICATION_STYLE[product.verification],
                  )}
                >
                  {VERIFICATION_LABEL[product.verification]}
                </span>
              </TableCell>
              <TableCell className="font-mono text-[0.7rem] tabular-nums text-[#94A3B8]">
                {product.relatedInspectionIds.length}
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}
