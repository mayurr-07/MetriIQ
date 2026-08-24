import { Building } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import DataNotice from "@/components/data/DataNotice";
import { manufacturerService } from "@/services/admin/registryService";

export default function AdminManufacturers() {
  const { manufacturers, scope } = manufacturerService.list();

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Manufacturers"]}
        title="Manufacturers"
        description="Manufacturer and packer registry assembled from recorded product data."
      />

      <DataNotice scope={scope} />

      <div className="my-4 flex items-start gap-3 border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-[0.8rem] leading-relaxed text-[#94A3B8]">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#94A3B8]">
            Licence verification ·{" "}
          </span>
          No external licence directory is connected, so no entry below has been verified against an
          authoritative government source.
        </p>
      </div>

      <Table columns={["Manufacturer", "Identifier", "District", "Verification", "Products"]}>
        {manufacturers.length === 0 ? (
          <TableEmptyRow
            colSpan={5}
            icon={<Building className="h-5 w-5" />}
            title="No manufacturers recorded"
            description="Manufacturer names appear here once products carrying them have been inspected or reported."
          />
        ) : (
          manufacturers.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell className="font-mono text-[0.72rem] text-[#64748B]">
                {m.identifier ?? "Not captured"}
              </TableCell>
              <TableCell className="text-[0.78rem] text-[#94A3B8]">{m.district ?? "—"}</TableCell>
              <TableCell>
                <span className="inline-flex items-center border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#94A3B8]">
                  Source not connected
                </span>
              </TableCell>
              <TableCell className="font-mono text-[0.7rem] tabular-nums text-[#94A3B8]">
                {m.productCount}
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}
