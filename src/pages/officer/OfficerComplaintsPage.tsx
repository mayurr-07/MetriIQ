import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Search } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import { StatusBadge } from "@/components/design-system/StatusBadge";
import { complaintService } from "@/services/inspection/complaintService";
import { ISSUE_TYPE_LABELS, type ComplaintStatus, type ComplaintIssueType } from "@/types/complaint";

const FILTERS: Array<{ label: string; value: "ALL" | ComplaintStatus }> = [
  { label: "All Statuses", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "More Info Required", value: "MORE_INFORMATION_REQUIRED" },
  { label: "Inspection In Progress", value: "INSPECTION_IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Rejected", value: "REJECTED" },
];

const ISSUE_FILTERS: Array<{ label: string; value: "ALL" | ComplaintIssueType }> = [
  { label: "All Issues", value: "ALL" },
  { label: "Foreign Object", value: "FOREIGN_OBJECT" },
  { label: "Spoiled Food", value: "SPOILED_FOOD" },
  { label: "Damaged Package", value: "DAMAGED_PACKAGE" },
  { label: "Expired Product", value: "EXPIRED_PRODUCT" },
  { label: "Misleading Label", value: "MISLEADING_LABEL" },
  { label: "Counterfeit", value: "COUNTERFEIT" },
];

export default function OfficerComplaintsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof FILTERS)[number]["value"]>("ALL");
  const [issueType, setIssueType] = useState<(typeof ISSUE_FILTERS)[number]["value"]>("ALL");
  const [sort, setSort] = useState<"date" | "id">("date");

  const complaints = complaintService.list();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return complaints
      .filter((item) => {
        const matchesQuery =
          !q ||
          item.complaintId.toLowerCase().includes(q) ||
          item.productName.toLowerCase().includes(q) ||
          item.complainantName.toLowerCase().includes(q);
        const matchesStatus = status === "ALL" || item.status === status;
        const matchesIssue = issueType === "ALL" || item.issueType === issueType;
        return matchesQuery && matchesStatus && matchesIssue;
      })
      .sort((a, b) => (sort === "id" ? a.complaintId.localeCompare(b.complaintId) : b.updatedAt.localeCompare(a.updatedAt)));
  }, [query, complaints, status, issueType, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        crumbs={["Inspection Officer", "Complaints"]}
        title="Citizen Grievances"
        description="Review and investigate product complaints submitted by consumers with photographic evidence."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search complaints</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by complaint ID, product or consumer name"
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
          value={issueType}
          onChange={(e) => setIssueType(e.target.value as (typeof ISSUE_FILTERS)[number]["value"])}
          className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
        >
          {ISSUE_FILTERS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "date" | "id")}
          className="border border-white/12 bg-[#0B111C] px-3 py-2.5 font-mono text-xs text-[#F0F2F5] outline-none"
        >
          <option value="date">Sort: last updated</option>
          <option value="id">Sort: complaint ID</option>
        </select>
      </div>

      <Table columns={["Complaint ID", "Product", "Issue Category", "Status", "Action"]}>
        {filtered.length === 0 ? (
          <TableEmptyRow
            colSpan={5}
            icon={<ShieldAlert className="h-5 w-5" />}
            title="No complaints found"
            description="No grievances matching your active search/filter criteria are currently registered."
          />
        ) : (
          filtered.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <p className="font-mono text-[0.72rem] text-[#F0F2F5]">{item.complaintId}</p>
                {item.isDemo && (
                  <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#F59E0B]">
                    Demo
                  </p>
                )}
              </TableCell>
              <TableCell>
                <p>{item.productName}</p>
                <p className="text-[0.75rem] text-[#94A3B8]">{item.brand}</p>
              </TableCell>
              <TableCell className="font-mono text-[0.72rem] text-[#94A3B8]">
                {ISSUE_TYPE_LABELS[item.issueType]}
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>
                <Link
                  to={`/officer/complaints/${item.id}`}
                  className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#F59E0B]"
                >
                  Investigate
                </Link>
              </TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}
