import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import DataNotice from "@/components/data/DataNotice";
import { adminService } from "@/services/admin/adminService";
import { SCOPE_LOCAL, SCOPE_UNAVAILABLE } from "@/types/analytics";

export default function AdminComplaints() {
  const [query, setQuery] = useState("");
  const [linked, setLinked] = useState<"ALL" | "LINKED" | "UNLINKED">("ALL");
  const rows = adminService.listComplaints();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !q ||
        row.complaintId.toLowerCase().includes(q) ||
        row.productName.toLowerCase().includes(q) ||
        row.region.toLowerCase().includes(q);
      const matchesLink =
        linked === "ALL" ||
        (linked === "LINKED" ? Boolean(row.linkedInspectionId) : !row.linkedInspectionId);
      return matchesQuery && matchesLink;
    });
  }, [linked, query, rows]);

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Complaints"]}
        title="Complaints"
        description="Oversight of the consumer complaint lifecycle. Case handling remains with the assigned officer."
      />

      <DataNotice scope={rows.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE} />

      <div className="my-4 flex flex-col gap-3 lg:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search complaints</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by complaint ID, product or region"
            className="w-full border border-white/12 bg-[#0B111C] py-2.5 pl-10 pr-3 font-mono text-xs text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
          />
        </label>
        <select
          value={linked}
          onChange={(e) => setLinked(e.target.value as typeof linked)}
          className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
        >
          <option value="ALL">All complaints</option>
          <option value="LINKED">Linked to an inspection</option>
          <option value="UNLINKED">Not yet linked</option>
        </select>
      </div>

      <Table columns={["Complaint ID", "Product", "Issue", "Region", "Linked inspection", "Status", "Open"]}>
        {filtered.length === 0 ? (
          <TableEmptyRow
            colSpan={7}
            icon={<ShieldAlert className="h-5 w-5" />}
            title="No complaints recorded"
            description="Consumer complaints submitted through the citizen portal will appear here."
          />
        ) : (
          filtered.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-mono text-[0.72rem] text-[#F0F2F5]">{row.complaintId}</p>
                {row.isDemo && (
                  <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#F59E0B]">
                    Demo
                  </p>
                )}
              </TableCell>
              <TableCell>{row.productName}</TableCell>
              <TableCell className="text-[0.78rem] text-[#94A3B8]">{row.issueType}</TableCell>
              <TableCell className="text-[0.78rem] text-[#94A3B8]">{row.region}</TableCell>
              <TableCell>
                {row.linkedInspectionId ? (
                  <Link
                    to={`/officer/inspections/${row.linkedInspectionDraftId}`}
                    className="font-mono text-[0.66rem] text-[#10B981]"
                  >
                    {row.linkedInspectionId}
                  </Link>
                ) : (
                  <span className="font-mono text-[0.66rem] text-[#64748B]">Not linked</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={row.status} />
              </TableCell>
              <TableCell>
                <Link
                  to={`/officer/complaints/${row.id}`}
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
