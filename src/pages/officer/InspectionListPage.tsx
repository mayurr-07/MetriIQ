import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ScanSearch, Search } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Button } from "@/components/design-system/Button";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import WorkflowStatusBadge from "@/components/inspection/WorkflowStatusBadge";
import { inspectionService } from "@/services/inspection/inspectionService";
import type { InspectionWorkflowState } from "@/types/inspection";

const FILTERS: Array<{ label: string; value: "ALL" | InspectionWorkflowState }> = [
  { label: "All", value: "ALL" },
  { label: "Drafts", value: "DRAFT" },
  { label: "In review", value: "AWAITING_REVIEW" },
  { label: "Passed", value: "PASSED" },
  { label: "Failed", value: "FAILED" },
];

export default function InspectionListPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof FILTERS)[number]["value"]>("ALL");
  const [sort, setSort] = useState<"updated" | "reference">("updated");
  const records = inspectionService.list();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records
      .filter((item) => {
        const matchesQuery =
          !q ||
          item.reference.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q);
        const matchesStatus = status === "ALL" || item.workflowState === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => (sort === "reference" ? a.reference.localeCompare(b.reference) : b.updatedAt.localeCompare(a.updatedAt)));
  }, [query, records, sort, status]);

  return (
    <div>
      <PageHeader
        crumbs={["Inspection Officer", "Inspections"]}
        title="Inspections"
        description="Review, manage and monitor inspection drafts saved on this device."
        action={
          <Link to="/officer/inspections/new">
            <Button variant="primary">
              <ScanSearch className="h-4 w-4" />
              Start New Inspection
            </Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
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
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof FILTERS)[number]["value"])}
          className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
        >
          {FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "updated" | "reference")}
          className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
        >
          <option value="updated">Sort: last updated</option>
          <option value="reference">Sort: reference</option>
        </select>
      </div>

      <Table columns={["Inspection ID", "Product", "Updated", "Status", "Action"]}>
        {filtered.length === 0 ? (
          <TableEmptyRow
            colSpan={5}
            icon={<ScanSearch className="h-5 w-5" />}
            title="No inspections to show"
            description="Start a new inspection to create a local draft. Nothing here is stored on a government server."
            action={
              <Link to="/officer/inspections/new">
                <Button variant="primary" size="sm">
                  Start New Inspection
                </Button>
              </Link>
            }
          />
        ) : (
          filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <p className="font-mono text-[0.72rem] text-[#F0F2F5]">{item.reference}</p>
                {item.isDemo && <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#F59E0B]">Demo</p>}
              </TableCell>
              <TableCell>
                <p>{item.productName}</p>
                <p className="text-[0.75rem] text-[#94A3B8]">{item.brand}</p>
              </TableCell>
              <TableCell className="font-mono text-[0.72rem] text-[#94A3B8]">
                {new Date(item.updatedAt).toLocaleString()}
              </TableCell>
              <TableCell>
                <WorkflowStatusBadge state={item.workflowState} />
              </TableCell>
              <TableCell>
                <Link to={`/officer/inspections/${item.id}`} className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]">
                  Open
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}
