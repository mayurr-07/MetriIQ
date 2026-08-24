import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Search } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import WorkflowStatusBadge from "@/components/inspection/WorkflowStatusBadge";
import DataNotice from "@/components/data/DataNotice";
import { adminService } from "@/services/admin/adminService";
import { SCOPE_LOCAL, SCOPE_UNAVAILABLE } from "@/types/analytics";

export default function AdminInspections() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"ALL" | "COMPLAINT" | "DIRECT">("ALL");
  const rows = adminService.listInspections();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !q ||
        row.reference.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q) ||
        row.brand.toLowerCase().includes(q);
      const matchesSource =
        source === "ALL" ||
        (source === "COMPLAINT" ? Boolean(row.sourceComplaintId) : !row.sourceComplaintId);
      return matchesQuery && matchesSource;
    });
  }, [query, rows, source]);

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Inspections"]}
        title="Inspections"
        description="Department-level monitoring of inspection records and their originating complaints."
      />

      <DataNotice scope={rows.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE} />

      <div className="my-4 flex flex-col gap-3 lg:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search inspections</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference, product or brand"
            className="w-full border border-white/12 bg-[#0B111C] py-2.5 pl-10 pr-3 font-mono text-xs text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
          />
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as typeof source)}
          className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
        >
          <option value="ALL">All sources</option>
          <option value="COMPLAINT">From a complaint</option>
          <option value="DIRECT">Officer-initiated</option>
        </select>
      </div>

      <Table columns={["Reference", "Product", "Source", "Evidence", "Status", "Open"]}>
        {filtered.length === 0 ? (
          <TableEmptyRow
            colSpan={6}
            icon={<Activity className="h-5 w-5" />}
            title="No inspection records"
            description="Inspection records created by officers on this device will appear here."
          />
        ) : (
          filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-mono text-[0.72rem] text-[#F0F2F5]">{row.reference}</p>
                {row.isDemo && (
                  <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#F59E0B]">
                    Demo
                  </p>
                )}
              </TableCell>
              <TableCell>
                <p>{row.productName}</p>
                <p className="text-[0.75rem] text-[#94A3B8]">{row.brand}</p>
              </TableCell>
              <TableCell>
                {row.sourceComplaintId ? (
                  <span className="font-mono text-[0.68rem] text-[#10B981]">{row.sourceComplaintId}</span>
                ) : (
                  <span className="font-mono text-[0.68rem] text-[#64748B]">Officer-initiated</span>
                )}
              </TableCell>
              <TableCell className="font-mono text-[0.72rem] tabular-nums text-[#94A3B8]">
                {row.evidenceCount}
              </TableCell>
              <TableCell>
                <WorkflowStatusBadge state={row.state} />
              </TableCell>
              <TableCell>
                <Link
                  to={`/officer/inspections/${row.id}`}
                  className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}
