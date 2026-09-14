import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ScanSearch, Search } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
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
          <Link to="/officer/inspections/new" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              <ScanSearch className="h-4 w-4" />
              Start New Inspection
            </Button>
          </Link>
        }
      />

      {/* Filters */}
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
          className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none lg:w-auto"
        >
          {FILTERS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "updated" | "reference")}
          className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none lg:w-auto"
        >
          <option value="updated">Sort: last updated</option>
          <option value="reference">Sort: reference</option>
        </select>
      </div>

      {/* Mobile card list */}
      <div className="space-y-2 md:hidden">
        {filtered.length === 0 ? (
          <Card>
            <div className="py-8 text-center">
              <ScanSearch className="mx-auto h-8 w-8 text-[#F59E0B] opacity-60" />
              <p className="mt-3 font-display text-lg text-[#F0F2F5]">No inspections to show</p>
              <p className="mt-1 text-sm text-[#94A3B8]">Start a new inspection to create a local draft.</p>
              <div className="mt-5">
                <Link to="/officer/inspections/new">
                  <Button variant="primary" size="sm">Start New Inspection</Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          filtered.map((item) => (
            <Link key={item.id} to={`/officer/inspections/${item.id}`} className="block">
              <Card interactive className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#64748B]">{item.reference}</p>
                      {item.isDemo && (
                        <span className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#F59E0B]">Demo</span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-[#F0F2F5]">{item.productName}</p>
                    <p className="text-[0.78rem] text-[#94A3B8]">{item.brand}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#64748B]" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <WorkflowStatusBadge state={item.workflowState} />
                  <p className="font-mono text-[0.6rem] text-[#64748B]">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table columns={["Inspection ID", "Product", "Updated", "Status", "Action"]}>
          {filtered.length === 0 ? (
            <TableEmptyRow
              colSpan={5}
              icon={<ScanSearch className="h-5 w-5" />}
              title="No inspections to show"
              description="Start a new inspection to create a local draft. Nothing here is stored on a government server."
              action={
                <Link to="/officer/inspections/new">
                  <Button variant="primary" size="sm">Start New Inspection</Button>
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
                  <div className="flex items-center gap-4">
                    <Link to={`/officer/inspections/${item.id}`} className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]">
                      Open
                    </Link>
                    {item.hasReport && (
                      <Link to={`/officer/inspections/${item.id}`} className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#10B981]">
                        View Report
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </div>
    </div>
  );
}
