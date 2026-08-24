import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FlaskConical,
  Lock,
  Mail,
  MessageSquareWarning,
  Scale,
  Settings2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { ROLE_DEFINITIONS, ROLE_ORDER } from "@/lib/roles";
import { getDefaultRouteForRole } from "@/lib/rbac";
import type { Role } from "@/types";

/** Icon per role — visual aid only, not an identity. */
const ROLE_ICONS: Record<Role, typeof ClipboardCheck> = {
  INSPECTION_OFFICER: ClipboardCheck,
  ADMIN: Settings2,
  SENIOR_OFFICER: BarChart3,
  CONSUMER: MessageSquareWarning,
};

/** Subtle per-role accent so the four workspaces feel individually recognizable. */
const ROLE_ACCENT: Record<Role, string> = {
  INSPECTION_OFFICER: "#F59E0B",
  ADMIN: "#38BDF8",
  SENIOR_OFFICER: "#A78BFA",
  CONSUMER: "#10B981",
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const { user, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(ROLE_DEFINITIONS.INSPECTION_OFFICER.demoEmail);
  const [password, setPassword] = useState(ROLE_DEFINITIONS.INSPECTION_OFFICER.demoPassword);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<"credentials" | "demo">("demo");

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from || getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login({ email, password });
      navigate(from || getDefaultRouteForRole(loggedUser.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleAccess = async (role: Role) => {
    setError(null);
    setLoading(true);
    setPendingRole(role);
    try {
      const loggedUser = await login({ role });
      navigate(from || getDefaultRouteForRole(loggedUser.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Access failed.");
    } finally {
      setLoading(false);
      setPendingRole(null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#080C14] text-[#F0F2F5]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
      <div className="fx-scanlines" />
      <div className="fx-grain" />

      {/* header */}
      <header className="relative z-10 border-b border-white/8 bg-[#080C14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-5 md:px-10">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55">
            <span className="grid h-9 w-9 shrink-0 place-items-center border border-[#F59E0B]/30 bg-[#F59E0B]/[0.07]">
              <Scale className="h-[15px] w-[15px] text-[#F59E0B]" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-base text-[#F0F2F5]">Legal Metrology</span>
              <span className="hidden font-mono text-[0.52rem] uppercase tracking-[0.26em] text-[#94A3B8] sm:block">
                Compliance Platform
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#94A3B8] sm:flex">
              <FlaskConical className="h-3 w-3 text-[#F59E0B]" />
              Dev Environment
            </span>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back to landing</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="relative z-10 mx-auto w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-center"
        >
          <span className="eyebrow">SIH PS:26034</span>
          <h1 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-[#F0F2F5] sm:text-3xl">
            AI-Assisted Food Compliance,
            <br />
            Legal Metrology &amp; Consumer Protection Platform
          </h1>
          <p className="mt-3 text-sm text-[#94A3B8]">Select your workspace to continue.</p>
        </motion.div>

        {from && (
          <div className="mt-6 flex items-center gap-3 border border-[#F59E0B]/35 bg-[#F59E0B]/10 px-4 py-3 text-xs text-[#F59E0B]">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              Authentication required to access <code className="font-mono">{from}</code>.
            </span>
          </div>
        )}

        {/* tabs */}
        <div className="mt-8 flex border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("demo")}
            className={`flex-1 border-b-2 pb-3 text-center font-mono text-xs uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55 ${
              activeTab === "demo"
                ? "border-[#F59E0B] font-semibold text-[#F59E0B]"
                : "border-transparent text-[#94A3B8] hover:text-[#F0F2F5]"
            }`}
          >
            Development Access
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className={`flex-1 border-b-2 pb-3 text-center font-mono text-xs uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55 ${
              activeTab === "credentials"
                ? "border-[#F59E0B] font-semibold text-[#F59E0B]"
                : "border-transparent text-[#94A3B8] hover:text-[#F0F2F5]"
            }`}
          >
            Sign In
          </button>
        </div>

        <Card className="mt-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="mb-6 flex items-start gap-3 border border-[#EF4444]/40 bg-[#EF4444]/10 p-4 text-xs text-[#EF4444]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-mono font-semibold uppercase tracking-wider">Authentication Error</p>
                <p className="mt-1 leading-relaxed text-[#F0F2F5]/90">{error}</p>
              </div>
            </motion.div>
          )}

          {activeTab === "demo" ? (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#F59E0B]">
                  Select a workspace
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                  Development access layer for evaluation. Demo accounts only — not real
                  personnel.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {ROLE_ORDER.map((role, i) => {
                  const def = ROLE_DEFINITIONS[role];
                  const Icon = ROLE_ICONS[role];
                  const accent = ROLE_ACCENT[role];
                  const isPending = pendingRole === role;

                  return (
                    <motion.button
                      key={role}
                      type="button"
                      disabled={loading}
                      onClick={() => handleRoleAccess(role)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
                      className="group relative flex flex-col justify-between overflow-hidden border border-white/10 bg-[#0E1521] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55 disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      <span
                        className="absolute inset-x-0 top-0 h-0.5 opacity-70"
                        style={{ backgroundColor: accent }}
                        aria-hidden="true"
                      />
                      <div>
                        <span
                          className="grid h-8 w-8 place-items-center border border-white/10 bg-white/[0.03]"
                          style={{ color: accent }}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <h3 className="mt-3 font-display text-base font-semibold text-[#F0F2F5]">
                          {def.label}
                        </h3>
                        <p className="mt-1 text-[0.72rem] leading-relaxed text-[#94A3B8]">
                          {def.description}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-2.5">
                        <span className="font-mono text-[0.6rem] text-[#64748B]">{def.route}</span>
                        {isPending ? (
                          <span
                            className="h-3 w-3 animate-spin rounded-full border border-current/30 border-t-current"
                            style={{ color: accent }}
                          />
                        ) : (
                          <ArrowRight className="h-3.5 w-3.5 text-[#475569] transition group-hover:translate-x-0.5" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <p className="border-t border-white/8 pt-4 font-mono text-[0.6rem] leading-relaxed text-[#64748B]">
                AI is an assistive layer. Final inspection decisions remain with the
                authorized officer.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block font-mono text-xs uppercase tracking-wider text-[#94A3B8]"
                >
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-white/12 bg-[#0B111C] py-2.5 pl-10 pr-3.5 font-mono text-xs text-[#F0F2F5] outline-none transition focus:border-[#F59E0B]"
                    placeholder="officer@legalmetrology.dev"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block font-mono text-xs uppercase tracking-wider text-[#94A3B8]"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-white/12 bg-[#0B111C] py-2.5 pl-10 pr-3.5 font-mono text-xs text-[#F0F2F5] outline-none transition focus:border-[#F59E0B]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="md" loading={loading} className="mt-2 w-full">
                Sign In
              </Button>

              <div className="mt-4 space-y-1.5 border-t border-white/8 pt-4">
                <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[#64748B]">
                  Demo accounts
                </p>
                {ROLE_ORDER.map((role) => {
                  const def = ROLE_DEFINITIONS[role];
                  return (
                    <div
                      key={role}
                      className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.6rem] text-[#64748B]"
                    >
                      <span className="text-[#94A3B8]">{def.label}</span>
                      <span>
                        {def.demoEmail} · {def.demoPassword}
                      </span>
                    </div>
                  );
                })}
              </div>
            </form>
          )}
        </Card>
      </main>

      <footer className="relative z-10 border-t border-white/8 bg-[#080C14] py-6 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#64748B]">
        Development Environment · Demo Access Only
      </footer>
    </div>
  );
}
