import type { ReactNode } from "react";
import AppShellChrome from "@/components/shells/AppShellChrome";
import { getNavRoutes } from "@/routes/moduleRoutes";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AppShellChrome
      roleLabel="Department Admin"
      navHeading="Department Admin"
      navItems={getNavRoutes("ADMIN")}
      basePath="/admin"
      fallbackRole="ADMIN"
    >
      {children}
    </AppShellChrome>
  );
}
