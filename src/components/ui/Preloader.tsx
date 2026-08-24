import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/scrollState";

const STAGES = [
  "Establishing secure session",
  "Loading rule set — PCR 2011",
  "Calibrating optical pipeline",
  "Inspection assistant ready",
] as const;

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (prefersReducedMotion()) {
      setHidden(true);
      document.body.style.overflow = prev;
      return;
    }

    const counter = el.querySelector<HTMLElement>("[data-count]");
    const bar = el.querySelector<HTMLElement>("[data-bar]");
    const stage = el.querySelector<HTMLElement>("[data-stage]");
    const ring = el.querySelector<SVGCircleElement>("[data-ring]");
    const seal = el.querySelector<HTMLElement>("[data-seal]");
    const rules = el.querySelectorAll<HTMLElement>("[data-rule]");
    const brackets = el.querySelectorAll<HTMLElement>("[data-bracket]");
    const marks = el.querySelectorAll<HTMLElement>("[data-mark]");

    const CIRC = 2 * Math.PI * 52;
    if (ring) {
      ring.style.strokeDasharray = `${CIRC}`;
      ring.style.strokeDashoffset = `${CIRC}`;
    }

    const state = { n: 0 };
    let lastStage = -1;

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        document.body.style.overflow = prev;
        setHidden(true);
      },
    });

    // ── entrance ──
    tl.fromTo(
      brackets,
      { opacity: 0, scale: 0.82 },
      { opacity: 1, scale: 1, duration: 0.7, stagger: 0.06 },
    )
      .fromTo(
        seal,
        { opacity: 0, scale: 0.86, filter: "blur(6px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.85 },
        0.15,
      )
      .fromTo(
        rules,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, stagger: 0.08, transformOrigin: "left center" },
        0.3,
      )
      .fromTo(
        marks,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 },
        0.4,
      )

      // ── load ──
      .to(
        state,
        {
          n: 100,
          duration: 2.3,
          ease: "power2.inOut",
          onUpdate: () => {
            const v = Math.round(state.n);
            if (counter) counter.textContent = String(v).padStart(3, "0");
            if (ring) ring.style.strokeDashoffset = `${CIRC * (1 - v / 100)}`;
            const idx = Math.min(STAGES.length - 1, Math.floor(v / 26));
            if (stage && idx !== lastStage) {
              lastStage = idx;
              gsap.fromTo(
                stage,
                { opacity: 0, y: 6 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
              );
              stage.textContent = STAGES[idx];
            }
          },
        },
        0.5,
      )
      .to(bar, { scaleX: 1, duration: 2.3, ease: "power2.inOut" }, 0.5)

      // ── seal confirm ──
      .to(seal, { scale: 1.04, duration: 0.22, ease: "power2.out" })
      .to(seal, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.55)" })

      // ── exit ──
      .to(
        el.querySelectorAll("[data-out]"),
        { opacity: 0, y: -14, duration: 0.45, stagger: 0.05, ease: "power2.in" },
        "+=0.15",
      )
      .to(
        el,
        { clipPath: "circle(0% at 50% 50%)", duration: 1, ease: "power4.inOut" },
        "-=0.2",
      );

    return () => {
      tl.kill();
      document.body.style.overflow = prev;
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#080C14]"
      style={{ clipPath: "circle(150% at 50% 50%)" }}
    >
      {/* depth wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(245,158,11,0.07) 0%, transparent 55%)",
        }}
      />
      {/* grid field */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "68px 68px",
          maskImage: "radial-gradient(ellipse at 50% 50%, #000 20%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 20%, transparent 72%)",
        }}
      />

      {/* registration brackets */}
      {[
        "left-6 top-6 border-l border-t md:left-10 md:top-10",
        "right-6 top-6 border-r border-t md:right-10 md:top-10",
        "left-6 bottom-6 border-b border-l md:left-10 md:bottom-10",
        "right-6 bottom-6 border-b border-r md:right-10 md:bottom-10",
      ].map((pos) => (
        <span
          key={pos}
          data-bracket
          className={`pointer-events-none absolute h-10 w-10 border-[#F59E0B]/35 ${pos}`}
        />
      ))}

      {/* emblem */}
      <div data-seal className="relative grid h-[132px] w-[132px] place-items-center">
        <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
          <circle
            data-ring
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-[13px] rounded-full border border-white/[0.07]" />
        <span
          className="absolute inset-[19px] rounded-full border border-dashed border-[#F59E0B]/20"
          style={{ animation: "spin 22s linear infinite" }}
        />
        {/* tick marks */}
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-[5px] w-px bg-white/20"
            style={{ transform: `rotate(${i * 30}deg) translateY(-58px)` }}
          />
        ))}
        <span className="relative font-display text-[2rem] leading-none tracking-tight text-[#F0F2F5]">
          LM
        </span>
      </div>

      {/* wordmark */}
      <div className="relative mt-9 flex flex-col items-center">
        <span data-rule className="block h-px w-24 bg-gradient-to-r from-transparent via-[#F59E0B]/55 to-transparent" />
        <p
          data-out
          data-mark
          className="mt-5 font-display text-[1.35rem] leading-none text-[#F0F2F5] md:text-[1.6rem]"
        >
          Legal Metrology
        </p>
        <p
          data-out
          data-mark
          className="mt-2.5 font-mono text-[0.58rem] uppercase tracking-[0.42em] text-[#94A3B8]"
        >
          AI Inspection Assistant
        </p>
        <span data-rule className="mt-5 block h-px w-24 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>

      {/* progress */}
      <div data-out className="relative mt-9 w-[248px] md:w-[300px]">
        <div className="flex items-end justify-between font-mono text-[0.55rem] uppercase tracking-[0.26em] text-[#64748B]">
          <span data-stage className="text-[#94A3B8]">{STAGES[0]}</span>
          <span className="tabular-nums text-[#F59E0B]">
            <span data-count>000</span>%
          </span>
        </div>
        <span className="mt-3 block h-[2px] w-full overflow-hidden bg-white/[0.07]">
          <span
            data-bar
            className="block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#F59E0B]/55 to-[#F59E0B]"
            style={{ boxShadow: "0 0 14px rgba(245,158,11,0.55)" }}
          />
        </span>
      </div>

      {/* footer credential */}
      <p
        data-out
        data-mark
        className="absolute bottom-9 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-[#475569] md:bottom-12"
      >
        Govt. of Rajasthan · Dept. of Legal Metrology · SIH PS:26034
      </p>
    </div>
  );
}
