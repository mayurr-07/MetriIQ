import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Menu, Scale, UserCheck, X } from "lucide-react";
import { ACTS } from "@/lib/constants";
import { sceneState } from "@/lib/scrollState";
import { useAuth } from "@/context/AuthContext";
import { getDefaultRouteForRole } from "@/lib/rbac";
import { Button } from "@/components/design-system/Button";

/** Progress thresholds aligned to the four acts of the story timeline. */
const ACT_BOUNDS = [0.263, 0.441, 0.746] as const;

export default function Navbar({ onOpenContact }: { onOpenContact: () => void }) {
  const bar = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [act, setAct] = useState(0);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = sceneState.progress;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      const next =
        p < ACT_BOUNDS[0] ? 0 : p < ACT_BOUNDS[1] ? 1 : p < ACT_BOUNDS[2] ? 2 : 3;
      setAct((prev) => (prev === next ? prev : next));
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[80]">
      {/* scroll progress */}
      <div className="h-px w-full bg-white/[0.07]">
        <span
          ref={bar}
          className="block h-px w-full origin-left scale-x-0 bg-[#F59E0B]"
          style={{ boxShadow: "0 0 12px rgba(245,158,11,0.7)" }}
        />
      </div>

      <nav className="border-b border-white/[0.07] bg-[#080C14]/80 backdrop-blur-xl">
        {/* 3-column grid keeps the act links optically centred regardless of
            how wide the brand block or the right-hand controls become. */}
        <div className="mx-auto grid w-full max-w-[90rem] grid-cols-[minmax(0,auto)_1fr_auto] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-5 sm:py-4 md:px-10 md:py-5">
          {/* ── brand ── */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex min-w-0 items-center gap-2.5 text-left sm:gap-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-[#F59E0B]/30 bg-[#F59E0B]/[0.07] sm:h-14 sm:w-14">
              <Scale className="h-5 w-5 text-[#F59E0B] sm:h-7 sm:w-7" />
            </span>
            <span className="flex min-w-0 flex-col justify-center">
              <span className="truncate font-display text-[1.15rem] leading-[1.1] text-[#F0F2F5] sm:text-[1.5rem] md:text-[2.15rem]">
                Legal Metrology
              </span>
              <span className="mt-1 hidden font-display text-[0.75rem] uppercase leading-none tracking-[0.16em] text-[#94A3B8] sm:block md:text-[0.85rem]">
                AI Inspection Assistant
              </span>
            </span>
          </button>

          {/* ── act links (centre column) ── */}
          <div className="hidden items-center justify-center gap-1 md:flex">
            {ACTS.map((a, i) => {
              const active = i === act;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => go(a.id)}
                  aria-current={active ? "step" : undefined}
                  className={`group relative flex min-h-[52px] items-center gap-2 px-3.5 font-display text-[1.05rem] uppercase tracking-[0.12em] transition-colors ${
                    active ? "text-[#F59E0B]" : "text-[#94A3B8] hover:text-[#F0F2F5]"
                  }`}
                >
                  <span
                    className={`text-[0.72rem] tabular-nums transition-colors ${
                      active ? "text-[#F59E0B]" : "text-[#475569]"
                    }`}
                  >
                    {a.index}
                  </span>
                  {a.title}
                  <span
                    className={`absolute inset-x-2.5 bottom-[7px] h-px origin-left bg-[#F59E0B] transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-hover:bg-white/25"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* ── right controls ── */}
          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            {/* Fixed width prevents layout shift as the caption text changes. */}
            <span className="hidden w-[220px] text-right font-mono text-[0.7rem] uppercase leading-none tracking-[0.18em] text-[#64748B] xl:block">
              <span className="text-[#F59E0B]">{ACTS[act].index}</span>
              <span className="mx-1.5 text-white/15">/</span>
              {ACTS[act].caption}
            </span>

            {isAuthenticated && user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(getDefaultRouteForRole(user.role))}
                className="hidden sm:inline-flex"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Workspace
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                Portal Login
              </Button>
            )}

            <button
              type="button"
              onClick={onOpenContact}
              className="hidden min-h-[42px] items-center border border-white/12 bg-white/5 px-3.5 font-mono text-[0.72rem] uppercase leading-none tracking-[0.18em] text-[#94A3B8] transition hover:border-white/25 hover:text-[#F0F2F5] sm:inline-flex"
            >
              Request access
            </button>

            <button
              type="button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center border border-white/12 text-[#94A3B8] transition hover:border-white/25 hover:text-[#F0F2F5] md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* ── mobile sheet ── */}
        {open && (
          <div className="border-t border-white/[0.07] bg-[#080C14]/97 px-5 pb-5 pt-1 backdrop-blur-xl md:hidden">
            {ACTS.map((a, i) => {
              const active = i === act;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => go(a.id)}
                  aria-current={active ? "step" : undefined}
                  className="flex min-h-[52px] w-full items-center gap-3 border-b border-white/[0.06] text-left"
                >
                  <span
                    className={`font-mono text-[0.75rem] tabular-nums ${
                      active ? "text-[#F59E0B]" : "text-[#475569]"
                    }`}
                  >
                    {a.index}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span
                      className={`font-display text-[1.05rem] uppercase leading-none tracking-[0.12em] ${
                        active ? "text-[#F59E0B]" : "text-[#F0F2F5]"
                      }`}
                    >
                      {a.title}
                    </span>
                    <span className="mt-1.5 truncate text-[0.78rem] leading-none text-[#64748B]">
                      {a.caption}
                    </span>
                  </span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                  )}
                </button>
              );
            })}

            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setOpen(false);
                    navigate(getDefaultRouteForRole(user.role));
                  }}
                  className="w-full"
                >
                  <UserCheck className="h-4 w-4" />
                  Go to {user.role.replace("_", " ")} Workspace
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setOpen(false);
                    navigate("/login");
                  }}
                  className="w-full"
                >
                  <LogIn className="h-4 w-4" />
                  Portal Login
                </Button>
              )}

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenContact();
                }}
                className="flex min-h-[44px] w-full items-center justify-center border border-white/12 bg-white/5 font-mono text-[0.75rem] uppercase tracking-[0.18em] text-[#94A3B8]"
              >
                Request access
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
