import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Scale, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/design-system/Button";

const TABS = [
  { href: "/report/new", label: "Report a Problem", icon: ShieldAlert },
  { href: "/report/track", label: "Track Complaint", icon: Search },
];

/**
 * Lightweight consumer shell.
 *
 * Deliberately simple and friendly — no sidebar, no dense navigation, no
 * government-dashboard chrome. A citizen should understand this screen in
 * under two seconds.
 */
export default function ConsumerShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/report";

  return (
    <div className="flex min-h-screen flex-col bg-[#080C14] text-[#F0F2F5]">
      <header className="border-b border-white/8 bg-[#080C14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-3 px-5 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55"
          >
            <Scale className="h-5 w-5 shrink-0 text-[#F59E0B]" />
            <span className="truncate font-display text-lg text-[#F0F2F5]">Legal Metrology</span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            {!isHome && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/report")}>
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            )}
          </div>
        </div>

        {/* simple segmented tabs — replaces a dashboard-style nav bar */}
        <div className="mx-auto flex max-w-4xl gap-1 px-5 pb-3 sm:px-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = location.pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                to={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[38px] flex-1 items-center justify-center gap-2 border px-3 text-[0.72rem] font-medium transition sm:flex-none sm:px-4 ${
                  active
                    ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                    : "border-white/10 bg-white/[0.02] text-[#94A3B8] hover:border-white/20 hover:text-[#F0F2F5]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:px-6 sm:py-10">{children}</main>

      <footer className="border-t border-white/8 py-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-5 text-center sm:px-6">
          <span className="flex items-center gap-1.5 font-mono text-[0.62rem] text-[#10B981]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Official reporting channel
          </span>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#64748B]">
            Dept. of Legal Metrology · Consumer Protection Division
          </p>
        </div>
      </footer>
    </div>
  );
}
