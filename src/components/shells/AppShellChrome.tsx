import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, Scale, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/design-system/Button";
import { Dialog } from "@/components/design-system/Dialog";
import RoleSwitcher from "@/components/shells/RoleSwitcher";
import type { ModuleRoute } from "@/routes/moduleRoutes";

export interface AppShellChromeProps {
  /** Short role label shown next to the brand mark, e.g. "Inspection Officer". */
  roleLabel: string;
  /** Sidebar section heading, e.g. "Field Navigation". */
  navHeading: string;
  /** Navigation entries — already filtered to nav-visible routes. */
  navItems: ModuleRoute[];
  /** Base path for building hrefs, e.g. "/officer". */
  basePath: string;
  fallbackRole: "INSPECTION_OFFICER" | "ADMIN" | "SENIOR_OFFICER" | "CONSUMER";
  children: ReactNode;
}

/**
 * Shared chrome for every government workspace (Officer, Admin, Senior).
 *
 * Consolidates header, sidebar, mobile navigation and logout confirmation
 * into a single, consistently polished implementation so all three shells
 * behave and feel identical — only their navigation config differs.
 */
export default function AppShellChrome({
  roleLabel,
  navHeading,
  navItems,
  basePath,
  fallbackRole,
  children,
}: AppShellChromeProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  // Close the mobile sheet automatically on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const confirmLogout = () => {
    setLogoutOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-[#F0F2F5]">
      {/* ── top header ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#080C14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              className="grid h-10 w-10 shrink-0 place-items-center border border-white/12 text-[#94A3B8] transition hover:border-white/25 hover:text-[#F0F2F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55 md:hidden"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55"
            >
              <Scale className="h-5 w-5 shrink-0 text-[#F59E0B]" />
              <span className="truncate font-display text-lg text-[#F0F2F5]">Legal Metrology</span>
            </Link>
            <span className="hidden h-4 w-px shrink-0 bg-white/12 md:block" />
            <span className="hidden shrink-0 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#F59E0B] md:inline">
              {roleLabel}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <RoleSwitcher fallback={fallbackRole} />

            <div className="hidden text-right sm:block">
              <p className="font-mono text-[0.68rem] text-[#F0F2F5]">{user?.name}</p>
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#94A3B8]">
                {user?.badgeNumber || user?.district || "Demo access"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLogoutOpen(true)}>
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── main layout with sidebar ── */}
      <div className="mx-auto flex w-full max-w-7xl pt-16">
        <aside className="fixed inset-y-0 left-0 top-16 z-40 hidden w-64 overflow-y-auto border-r border-white/8 bg-[#080C14]/95 pb-8 pt-6 backdrop-blur-md md:block">
          <div className="px-5">
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-[#64748B]">
              {navHeading}
            </p>
            <nav className="mt-4 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const href = `${basePath}/${item.path}`;
                const active = location.pathname === href;
                return (
                  <Link
                    key={item.path}
                    to={href}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-[40px] items-center gap-3 px-3 font-mono text-[0.64rem] uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55 ${
                      active
                        ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                        : "text-[#94A3B8] hover:bg-white/5 hover:text-[#F0F2F5]"
                    }`}
                  >
                    <span
                      className={`absolute inset-y-0 left-0 w-0.5 bg-[#F59E0B] transition-opacity ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    />
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.navLabel}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* mobile menu */}
        {mobileOpen && (
          <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-[#080C14]/98 p-5 backdrop-blur-xl md:hidden">
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const href = `${basePath}/${item.path}`;
                const active = location.pathname === href;
                return (
                  <Link
                    key={item.path}
                    to={href}
                    className={`flex min-h-[48px] items-center gap-3 px-4 font-mono text-[0.7rem] uppercase tracking-[0.2em] transition ${
                      active
                        ? "border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                        : "border border-white/8 bg-[#111827] text-[#94A3B8]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {item.navLabel}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* content area */}
        <main className="min-h-[calc(100vh-4rem)] w-full flex-1 px-5 py-8 md:ml-64 md:px-10">
          {children}
        </main>
      </div>

      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Sign out?"
        description="You'll need to sign in again to access this workspace."
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => setLogoutOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirmLogout}>
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
