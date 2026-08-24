import { PageHeader } from "@/components/design-system/PageHeader";
import { Card, CardDescription, CardTitle } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import DataNotice from "@/components/data/DataNotice";
import { SCOPE_UNAVAILABLE } from "@/types/analytics";
import { ROLE_DEFINITIONS, ROLE_ORDER } from "@/lib/roles";

const SECTIONS = [
  {
    title: "Department settings",
    description: "Department name, jurisdiction and default region for new records.",
    fields: ["Department name", "Jurisdiction", "Default region"],
  },
  {
    title: "Notification preferences",
    description: "Which case events should notify officers once delivery is connected.",
    fields: ["Complaint assigned", "Information response received", "Decision recorded"],
  },
  {
    title: "System configuration",
    description: "Thresholds used by the assistive pipeline when the services are connected.",
    fields: ["OCR confidence threshold", "Image quality floor", "Review escalation rule"],
  },
];

export default function AdminSettings() {
  return (
    <div>
      <PageHeader
        crumbs={["Department Operations", "Settings"]}
        title="Settings"
        description="Department configuration and reference information."
      />

      <DataNotice scope={SCOPE_UNAVAILABLE} />

      <div className="mt-4 flex items-start gap-3 border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-[0.8rem] leading-relaxed text-[#94A3B8]">
          Configuration is read-only in this environment. No credentials, secrets or production
          settings are stored in the frontend.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardTitle className="text-base">{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.fields.map((field) => (
                <label key={field} className="block">
                  <span className="mb-1.5 block font-mono text-[0.56rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                    {field}
                  </span>
                  <input
                    disabled
                    placeholder="Not configured"
                    className="w-full border border-white/12 bg-[#0B111C] px-3 py-2.5 text-sm text-[#F0F2F5] outline-none placeholder:text-[#475569] disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" disabled title="Requires the configuration service">
                Save changes
              </Button>
            </div>
          </Card>
        ))}

        <Card>
          <CardTitle className="text-base">Access &amp; roles</CardTitle>
          <CardDescription>Workspace roles recognised by the platform.</CardDescription>
          <ul className="mt-4 divide-y divide-white/6">
            {ROLE_ORDER.map((role) => {
              const def = ROLE_DEFINITIONS[role];
              return (
                <li key={role} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <span>
                    <span className="block text-[0.86rem] text-[#F0F2F5]">{def.label}</span>
                    <span className="block text-[0.76rem] text-[#94A3B8]">{def.description}</span>
                  </span>
                  <code className="font-mono text-[0.66rem] text-[#64748B]">{def.route}</code>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
