import { Users } from "lucide-react";
import { PageHeader } from "@/components/design-system/PageHeader";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { Table, TableCell, TableEmptyRow, TableRow } from "@/components/design-system/Table";
import DataNotice from "@/components/data/DataNotice";
import { officerManagementService } from "@/services/admin/registryService";

const PLANNED = [
  "Create and deactivate officer accounts",
  "Assign jurisdictions and reporting lines",
  "Grant or revoke module permissions",
  "Review officer activity history",
];

export default function AdminOfficers() {
  const { officers, scope } = officerManagementService.list();

  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Officers"]}
        title="Officers"
        description="Manage jurisdictional postings, credentials and access for inspection staff."
        action={
          <Button variant="primary" size="sm" disabled title="Requires the identity service">
            Add officer
          </Button>
        }
      />

      <DataNotice scope={scope} />

      <div className="mt-4">
        <Table columns={["Officer", "Badge No.", "District", "Status", "Last activity"]}>
          {officers.length === 0 ? (
            <TableEmptyRow
              colSpan={5}
              icon={<Users className="h-5 w-5" />}
              title="Officer directory not connected"
              description="No identity or HR service is connected, so no officer accounts can be listed yet."
            />
          ) : (
            officers.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell>{officer.name}</TableCell>
                <TableCell className="font-mono text-[0.72rem]">{officer.badgeNumber}</TableCell>
                <TableCell>{officer.district}</TableCell>
                <TableCell>{officer.status}</TableCell>
                <TableCell className="font-mono text-[0.72rem] text-[#94A3B8]">
                  {officer.lastActivity ?? "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </div>

      <Card className="mt-4">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#F59E0B]">
          Planned capability
        </p>
        <ul className="mt-3 space-y-2">
          {PLANNED.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[0.82rem] text-[#CBD5E1]">
              <span className="mt-1.5 h-1 w-1 shrink-0 bg-[#F59E0B]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
