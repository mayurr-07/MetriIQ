import type { ReactNode } from "react";
import AppShellChrome from "@/components/shells/AppShellChrome";
import { getNavRoutes } from "@/routes/moduleRoutes";

export default function SeniorShell({ children }: { children: ReactNode }) {
  return (
    <AppShellChrome
      roleLabel="Senior Officer"
      navHeading="Compliance Intelligence"
      navItems={getNavRoutes("SENIOR_OFFICER")}
      basePath="/senior"
      fallbackRole="SENIOR_OFFICER"
    >
      {children}
    </AppShellChrome>
  );
}
