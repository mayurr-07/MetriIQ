import type { ReactNode } from "react";
import AppShellChrome from "@/components/shells/AppShellChrome";
import { getNavRoutes } from "@/routes/moduleRoutes";

export default function OfficerShell({ children }: { children: ReactNode }) {
  return (
    <AppShellChrome
      roleLabel="Inspection Officer"
      navHeading="Field Navigation"
      navItems={getNavRoutes("INSPECTION_OFFICER")}
      basePath="/officer"
      fallbackRole="INSPECTION_OFFICER"
    >
      {children}
    </AppShellChrome>
  );
}
