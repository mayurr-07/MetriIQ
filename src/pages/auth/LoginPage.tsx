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

        <Card className="mt-8">
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
        </Card>
      </main>

      <footer className="relative z-10 border-t border-white/8 bg-[#080C14] py-6 text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#64748B]">
        SIH 2026 · PS:26034 · AI-Assisted Legal Metrology Compliance Platform
      </footer>
    </div>
  );
}
