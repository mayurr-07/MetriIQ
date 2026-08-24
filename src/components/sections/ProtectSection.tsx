import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Database, LayoutDashboard, Users } from "lucide-react";
import StoryBlock from "@/components/ui/StoryBlock";
import StatCounter from "@/components/ui/StatCounter";
import { DASHBOARD, PRODUCT } from "@/lib/constants";
import { prefersReducedMotion } from "@/lib/scrollState";

const METRICS = [
  { label: "Inspections", value: DASHBOARD.inspections, tone: "text-[#F0F2F5]" },
  { label: "Compliant", value: DASHBOARD.compliant, tone: "text-[#10B981]" },
  { label: "Potential issues", value: DASHBOARD.issues, tone: "text-[#EF4444]" },
  { label: "Review required", value: DASHBOARD.review, tone: "text-[#F59E0B]" },
];

const TREND_MAX = Math.max(...DASHBOARD.trend);

/** Zone cells rendered per district row in the compliance grid. */
const ZONES_PER_DISTRICT = 12;

/** Compliance bands — the same thresholds the legend documents. */
const BAND_HIGH = 75;
const BAND_MID = 50;

function bandOf(value: number): { key: "high" | "mid" | "low"; hex: string; label: string } {
  if (value >= BAND_HIGH) return { key: "high", hex: "#10B981", label: "High" };
  if (value >= BAND_MID) return { key: "mid", hex: "#F59E0B", label: "Moderate" };
  return { key: "low", hex: "#EF4444", label: "Low" };
}

/**
 * Derives a per-zone compliance reading from a district's real value.
 * Deterministic, so the grid is stable across renders — the variation
 * models zone-level spread around the district mean rather than inventing
 * unrelated noise.
 */
function zoneValue(districtValue: number, zoneIndex: number): number {
  const wave = Math.sin(zoneIndex * 1.7 + districtValue * 0.37);
  const spread = 11;
  return Math.max(4, Math.min(99, Math.round(districtValue + wave * spread)));
}

export default function ProtectSection() {
  const dash = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = dash.current;
      if (!el) return;
      const bars = el.querySelectorAll<HTMLElement>("[data-bar]");
      const line = el.querySelector<SVGPolylineElement>("[data-trend]");
      const dots = el.querySelectorAll<HTMLElement>("[data-dot]");

      if (prefersReducedMotion()) {
        gsap.set(bars, { scaleX: 1 });
        // Cells carry inline opacity:0 for the reveal — they must be restored
        // here or the whole grid stays invisible for reduced-motion users.
        gsap.set(dots, { opacity: 1 });
        if (line) gsap.set(line, { strokeDashoffset: 0 });
        return;
      }

      gsap.fromTo(
        bars,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.08,
          transformOrigin: "left center",
          scrollTrigger: { trigger: el, start: "top 72%" },
        },
      );

      if (line) {
        const len = line.getTotalLength();
        gsap.fromTo(
          line,
          { strokeDasharray: len, strokeDashoffset: len },
          {
            strokeDashoffset: 0,
            duration: 1.8,
            ease: "power2.inOut",
            scrollTrigger: { trigger: el, start: "top 70%" },
          },
        );
      }

      gsap.fromTo(
        dots,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.9,
          ease: "power2.out",
          stagger: { each: 0.012, from: "center" },
          scrollTrigger: { trigger: el, start: "top 65%" },
        },
      );
    },
    { scope: dash },
  );

  return (
    <section id="protect" aria-label="Act IV — Protect">
      {/* 10 — STORED IN SYSTEM */}
      <StoryBlock vh={100}>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="max-w-md">
            <div data-reveal className="flex items-center gap-3">
              <Database className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#F59E0B]">
                Act IV · 10 — Protect
              </span>
            </div>
            <h2 data-reveal className="mt-4 font-display text-[2.1rem] leading-tight text-[#F0F2F5]">
              One record enters
              <br />
              the department system.
            </h2>
            <p data-reveal className="mt-4 text-[0.92rem] leading-relaxed text-[#94A3B8]">
              The inspection closes on the spot and syncs as a single signed record. Multiply that
              by every officer in the field and the department sees compliance form in real time.
            </p>
            <div data-reveal className="glass mt-5 px-4 py-4">
              <div className="flex items-center gap-3 text-[0.78rem] text-[#94A3B8]">
                <span className="border border-white/12 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#F0F2F5]">
                  Package
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span className="border border-white/12 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#F0F2F5]">
                  Digital record
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span className="border border-[#F59E0B]/40 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#F59E0B]">
                  Dept. system
                </span>
              </div>
            </div>
          </div>
        </div>
      </StoryBlock>

      {/* 11 — DEPARTMENT DASHBOARD */}
      <StoryBlock vh={130}>
        <div ref={dash} className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="ml-auto max-w-2xl">
            <div data-reveal className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#F59E0B]">
                11 — Inspector / department dashboard
              </span>
            </div>

            <div data-reveal className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {METRICS.map((m) => (
                <div key={m.label} className="border border-white/10 bg-[#0E1521]/85 px-3 py-4">
                  <p className={`font-display text-[1.9rem] leading-none ${m.tone}`}>
                    <StatCounter value={m.value} />
                  </p>
                  <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[#94A3B8]">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>

            <div data-reveal className="mt-3 grid gap-3 md:grid-cols-2">
              {/* district compliance */}
              <div className="border border-white/10 bg-[#0E1521]/85 p-4">
                <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                  District-wise compliance
                </p>
                <ul className="mt-4 space-y-3">
                  {DASHBOARD.districts.map((d) => (
                    <li key={d.name} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 font-mono text-[0.62rem] text-[#94A3B8]">
                        {d.name}
                      </span>
                      <span className="relative h-1.5 flex-1 bg-white/8">
                        <span
                          data-bar
                          className="absolute inset-y-0 left-0 block bg-[#10B981]"
                          style={{ width: `${d.value}%` }}
                        />
                      </span>
                      <span className="w-9 shrink-0 text-right font-mono text-[0.62rem] text-[#F0F2F5]">
                        {d.value}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* trend + categories */}
              <div className="space-y-3">
                <div className="border border-white/10 bg-[#0E1521]/85 p-4">
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                    Monthly inspection volume
                  </p>
                  <svg viewBox="0 0 100 38" className="mt-3 h-24 w-full" preserveAspectRatio="none">
                    <polyline
                      data-trend
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="0.8"
                      vectorEffect="non-scaling-stroke"
                      points={DASHBOARD.trend
                        .map((v, i) => {
                          const x = (i / (DASHBOARD.trend.length - 1)) * 100;
                          const y = 34 - (v / TREND_MAX) * 30;
                          return `${x.toFixed(2)},${y.toFixed(2)}`;
                        })
                        .join(" ")}
                    />
                  </svg>
                </div>

                <div className="border border-white/10 bg-[#0E1521]/85 p-4">
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                    Common violation categories
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DASHBOARD.categories.map((c) => (
                      <span
                        key={c.name}
                        className="border border-white/12 px-2.5 py-1.5 font-mono text-[0.6rem] text-[#94A3B8]"
                      >
                        {c.name}
                        <span className="ml-2 text-[#F59E0B]">{c.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* zone-level compliance grid — every cell is derived from real
                district data and is individually labelled and readable */}
            <div data-reveal className="mt-3 border border-white/10 bg-[#0E1521]/85 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                    Zone-level compliance grid
                  </p>
                  <p className="mt-1.5 text-[0.66rem] leading-relaxed text-[#64748B]">
                    Each cell is one enforcement zone · shaded by compliance rate
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[#94A3B8]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-[#10B981]" />
                    ≥{BAND_HIGH}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-[#F59E0B]" />
                    {BAND_MID}–{BAND_HIGH - 1}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-[#EF4444]" />
                    &lt;{BAND_MID}%
                  </span>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5">
                {DASHBOARD.districts.map((district) => {
                  const band = bandOf(district.value);
                  return (
                    <li key={district.name} className="flex items-center gap-2 sm:gap-3">
                      <span className="w-14 shrink-0 truncate font-mono text-[0.55rem] text-[#94A3B8] sm:w-20 sm:text-[0.6rem]">
                        {district.name}
                      </span>

                      <span className="flex min-w-0 flex-1 gap-[3px] sm:gap-1">
                        {Array.from({ length: ZONES_PER_DISTRICT }).map((_, z) => {
                          const value = zoneValue(district.value, z);
                          const cell = bandOf(value);
                          return (
                            <span
                              key={z}
                              data-dot
                              title={`${district.name} · Zone ${z + 1} — ${value}% compliant (${cell.label})`}
                              className="h-3.5 min-w-0 flex-1 rounded-[2px] sm:h-4"
                              style={{
                                opacity: 0,
                                backgroundColor: cell.hex,
                                // luminance encodes the value inside its band
                                filter: `saturate(${0.65 + (value / 100) * 0.6})`,
                              }}
                            />
                          );
                        })}
                      </span>

                      <span
                        className="w-9 shrink-0 text-right font-mono text-[0.55rem] tabular-nums sm:w-11 sm:text-[0.6rem]"
                        style={{ color: band.hex }}
                      >
                        {district.value}%
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-4 border-t border-white/[0.06] pt-3 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-[#475569]">
                {DASHBOARD.districts.length} districts ·{" "}
                {DASHBOARD.districts.length * ZONES_PER_DISTRICT} zones surveyed
              </p>
            </div>
          </div>
        </div>
      </StoryBlock>

      {/* 12 — THE BIG PICTURE */}
      <StoryBlock vh={120} align="end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-20 text-center md:px-10 md:pb-24">
          <div className="mx-auto max-w-3xl">
            <div data-reveal className="flex items-center justify-center gap-3">
              <Users className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#94A3B8]">
                12 — The big picture
              </span>
            </div>

            <div
              data-reveal
              className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[#94A3B8]"
            >
              {["Package", "Inspector", "Department", "Consumer"].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span
                    className={`border px-2.5 py-1.5 ${
                      i === arr.length - 1
                        ? "border-[#10B981]/45 text-[#10B981]"
                        : "border-white/12 text-[#F0F2F5]"
                    }`}
                  >
                    {step}
                  </span>
                  {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-[#F59E0B]" />}
                </span>
              ))}
            </div>

            <h2
              data-reveal
              className="mt-10 font-display text-[clamp(2.3rem,7vw,5rem)] font-semibold leading-[1] tracking-[-0.02em] text-[#F0F2F5]"
            >
              Inspect Smarter.
              <br />
              <span className="text-[#F59E0B]">Protect Consumers.</span>
            </h2>
            <p
              data-reveal
              className="mx-auto mt-6 max-w-xl font-quote text-[1.15rem] italic leading-relaxed text-[#94A3B8]"
            >
              “Government-grade AI assistance for packaged-product compliance.”
            </p>
            <p
              data-reveal
              className="mt-6 font-mono text-[0.62rem] uppercase tracking-[0.26em] text-[#64748B]"
            >
              {PRODUCT.licence} · Reference inspection {PRODUCT.inspectionId}
            </p>
          </div>
        </div>
      </StoryBlock>
    </section>
  );
}
