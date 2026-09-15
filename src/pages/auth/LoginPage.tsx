import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Lock,
  Mail,
  Scale,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { ROLE_DEFINITIONS, ROLE_ORDER } from "@/lib/roles";
import { getDefaultRouteForRole } from "@/lib/rbac";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  const { user, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(ROLE_DEFINITIONS.INSPECTION_OFFICER.demoEmail);
  const [password, setPassword] = useState(ROLE_DEFINITIONS.INSPECTION_OFFICER.demoPassword);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[#080C14] text-[#F0F2F5]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
      <div className="fx-scanlines" />
      <div className="fx-grain" />

      {/* header */}
      <header className="relative z-10 border-b border-white/8 bg-[#080C14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[var(--app-header-h)] w-full max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-5 md:px-10">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/55 sm:gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#F59E0B]/30 bg-[#F59E0B]/[0.07] sm:h-14 sm:w-14">
              <Scale className="h-5 w-5 text-[#F59E0B] sm:h-7 sm:w-7" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-[1.15rem] text-[#F0F2F5] sm:text-[1.5rem] md:text-[2.15rem]">Legal Metrology</span>
              <span className="hidden font-display text-[0.75rem] uppercase tracking-[0.16em] text-[#94A3B8] sm:block md:text-[0.85rem]">
                Compliance Platform
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
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
      <main className="relative z-10 mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-center"
        >
          <span className="eyebrow">SIH PS:26034</span>
          <h1 className="mt-3 font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-[#F0F2F5] sm:text-4xl lg:text-5xl">
            AI-Assisted Food Compliance, Legal Metrology &amp; Consumer Protection Platform
          </h1>
          <p className="mt-3 text-base text-[#94A3B8]">Select your workspace to continue.</p>
        </motion.div>

        {from && (
          <div className="mt-6 flex items-center gap-3 border border-[#F59E0B]/35 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F59E0B]">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              Authentication required to access <code className="font-mono">{from}</code>.
            </span>
          </div>
        )}

        <Card className="mt-8">
          {/* One-tap demo access */}
          <div className="mb-6">
            <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-wider text-[#64748B]">
              Quick access — tap a role to enter instantly
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_ORDER.map((role) => {
                const def = ROLE_DEFINITIONS[role];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setEmail(def.demoEmail);
                      setPassword(def.demoPassword);
                      setError(null);
                      login({ email: def.demoEmail, password: def.demoPassword })
                        .then((u) => navigate(from || getDefaultRouteForRole(u.role), { replace: true }))
                        .catch((err) => setError(err instanceof Error ? err.message : "Login failed."));
                    }}
                    className="flex min-h-[52px] flex-col items-start border border-white/10 bg-white/[0.02] px-3 py-2 text-left transition hover:border-[#F59E0B]/30 hover:bg-[#F59E0B]/[0.05] active:scale-[0.98]"
                  >
                    <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#F59E0B]">{def.label}</span>
                    <span className="mt-0.5 font-mono text-[0.6rem] text-[#64748B]">{def.demoEmail}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[#475569]">
            <div className="h-px flex-1 bg-white/8" />
            <span className="font-mono text-[0.62rem] uppercase tracking-wider">or sign in manually</span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="my-4 flex items-start gap-3 border border-[#EF4444]/40 bg-[#EF4444]/10 p-4 text-sm text-[#EF4444]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-mono font-semibold uppercase tracking-wider">Authentication Error</p>
                <p className="mt-1 leading-relaxed text-[#F0F2F5]/90">{error}</p>
                <p className="mt-2 text-xs text-[#94A3B8]">Use the quick-access buttons above to log in instantly.</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block font-mono text-sm uppercase tracking-wider text-[#94A3B8]"
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
                  className="w-full border border-white/12 bg-[#0B111C] py-3 pl-10 pr-3.5 font-mono text-sm text-[#F0F2F5] outline-none transition focus:border-[#F59E0B]"
                  placeholder="officer@legalmetrology.dev"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block font-mono text-sm uppercase tracking-wider text-[#94A3B8]"
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
                  className="w-full border border-white/12 bg-[#0B111C] py-3 pl-10 pr-3.5 font-mono text-sm text-[#F0F2F5] outline-none transition focus:border-[#F59E0B]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" loading={loading} className="mt-2 w-full">
              Sign In
            </Button>
          </form>
        </Card>
      </main>

      <footer className="relative z-10 border-t border-white/8 bg-[#080C14] px-4 py-6 text-center font-mono text-[0.75rem] uppercase tracking-[0.14em] text-[#64748B] sm:tracking-[0.18em]">
        SIH 2026 · PS:26034 · AI-Assisted Legal Metrology Compliance Platform
      </footer>
    </div>
  );
}
