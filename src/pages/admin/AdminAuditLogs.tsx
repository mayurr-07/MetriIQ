import { useMemo, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import DataNotice from "@/components/data/DataNotice";
import { adminService } from "@/services/admin/adminService";
import { SCOPE_LOCAL, SCOPE_UNAVAILABLE } from "@/types/analytics";

export default function AdminAuditLogs() {
  const [query, setQuery] = useState("");
  const events = adminService.listAuditEvents();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.actor.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q),
    );
  }, [events, query]);

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Audit Logs"]}
        title="Audit Logs"
        description="Recorded actions across inspections and complaint cases."
      />

      <DataNotice scope={events.length ? SCOPE_LOCAL : SCOPE_UNAVAILABLE} />

      <label className="relative my-4 block">
        <span className="sr-only">Search audit events</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by actor, action or entity ID"
          className="w-full border border-white/12 bg-[#0B111C] py-2.5 pl-10 pr-3 font-mono text-xs text-[#F0F2F5] outline-none focus:border-[#F59E0B]/60"
        />
      </label>

      <Table columns={["Timestamp", "Actor", "Action", "Entity", "Result"]}>
        {filtered.length === 0 ? (
          <TableEmptyRow
            colSpan={5}
            icon={<ScrollText className="h-5 w-5" />}
            title="No audit events recorded"
            description="Events are written as officers create inspections and act on complaint cases."
          />
        ) : (
          filtered.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-mono text-[0.68rem] text-[#94A3B8]">
                {new Date(event.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>
                <p className="text-[0.82rem]">{event.actor}</p>
                <p className="font-mono text-[0.6rem] text-[#64748B]">{event.actorRole}</p>
              </TableCell>
              <TableCell className="font-mono text-[0.66rem] text-[#F59E0B]">
                {event.action.replace(/_/g, " ")}
              </TableCell>
              <TableCell>
                <p className="text-[0.78rem] text-[#94A3B8]">{event.entity}</p>
                <p className="font-mono text-[0.66rem] text-[#E2E8F0]">{event.entityId}</p>
              </TableCell>
              <TableCell className="text-[0.78rem] text-[#94A3B8]">{event.result}</TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}
