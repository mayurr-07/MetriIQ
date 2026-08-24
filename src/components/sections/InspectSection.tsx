import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowDown, BadgeCheck, Camera, Hand, ScanLine } from "lucide-react";
import StoryBlock from "@/components/ui/StoryBlock";
import { PRODUCT } from "@/lib/constants";
import { prefersReducedMotion } from "@/lib/scrollState";

const SCAN_ROWS = [
  { label: "MRP", value: "₹120", state: "detected" as const },
  { label: "Net quantity", value: "500 g", state: "detected" as const },
  { label: "MFD", value: "07 / 26", state: "reading" as const },
  { label: "Customer care", value: "1800-266-XXXX", state: "reading" as const },
];

export default function InspectSection() {
  const hero = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const lines = hero.current?.querySelectorAll<HTMLElement>(".hero-line");
      if (!lines?.length || prefersReducedMotion()) return;
      gsap.fromTo(
        lines,
        { yPercent: 118, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.25, ease: "power3.out", stagger: 0.11, delay: 0.15 },
      );
    },
    { scope: hero },
  );

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="inspect" aria-label="Act I — Inspect">
      {/* 01 — THE PACKAGE */}
      <StoryBlock vh={100} className="items-center">
        <div
          ref={hero}
          className="mx-auto w-full max-w-7xl px-6 pt-28 md:px-10 md:pt-24 lg:pt-16"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span data-reveal className="eyebrow">
                SIH PS:26034 · Dept. of Legal Metrology
              </span>
              <span data-reveal className="hidden h-px w-16 bg-white/15 sm:block" />
            </div>
            <div data-reveal className="rule-line mt-5 w-44" />

            <h1 className="mt-7 font-display text-[clamp(2.5rem,7.4vw,5.2rem)] font-semibold leading-[0.94] tracking-[-0.02em] text-[#F0F2F5]">
              <span className="block overflow-hidden pb-1">
                <span className="hero-line block">One Package.</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-line block">One Scan.</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-line block text-[#F59E0B]">One Complete</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-line block">Inspection.</span>
              </span>
            </h1>

            <p
              data-reveal
              className="mt-7 max-w-xl text-[0.98rem] leading-relaxed text-[#94A3B8] md:text-[1.05rem]"
            >
              An AI-assisted inspection assistant that reads every mandatory declaration on a
              pre-packaged commodity — price, quantity, date and consumer care — and produces
              court-ready visual evidence in a single pass.
            </p>

            <div data-reveal className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollTo("understand")}
                className="inline-flex min-h-[44px] items-center gap-2 border border-[#F59E0B]/45 bg-[#F59E0B]/10 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#F59E0B] transition hover:bg-[#F59E0B]/20"
              >
                <ScanLine className="h-4 w-4" />
                Begin inspection
              </button>
              <button
                type="button"
                onClick={() => scrollTo("verify")}
                className="inline-flex min-h-[44px] items-center gap-2 border border-white/12 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#94A3B8] transition hover:border-white/25 hover:text-[#F0F2F5]"
              >
                <BadgeCheck className="h-4 w-4" />
                See the evidence
              </button>
            </div>
          </div>
        </div>

        {/* specimen slip — reads like an official tag */}
        <div
          data-reveal
          className="glass pointer-events-none absolute right-6 top-24 hidden w-[248px] p-4 lg:block"
        >
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-[#94A3B8]">
            Specimen in frame
          </p>
          <div className="rule-line my-3" />
          <p className="font-display text-lg text-[#F0F2F5]">{PRODUCT.name}</p>
          <dl className="mt-3 space-y-1.5 font-mono text-[0.68rem] text-[#94A3B8]">
            <div className="flex justify-between gap-3">
              <dt>Inspection ID</dt>
              <dd className="text-[#F0F2F5]">{PRODUCT.inspectionId}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Officer</dt>
              <dd className="text-[#F0F2F5]">{PRODUCT.officerId}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>District</dt>
              <dd className="text-[#F0F2F5]">{PRODUCT.district}</dd>
            </div>
          </dl>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <ArrowDown className="cue-bounce mx-auto h-4 w-4 text-[#F59E0B]" />
          <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.32em] text-[#94A3B8]">
            Scroll to inspect
          </p>
        </div>
      </StoryBlock>

      {/* 02 — PICK UP */}
      <StoryBlock vh={100}>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="ml-auto max-w-md">
            <div data-reveal className="glass warm-glow relative p-6">
              <div className="flex items-center gap-3">
                <Hand className="h-4 w-4 text-[#F59E0B]" />
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#F59E0B]">
                  Step 02 — Pick up
                </span>
              </div>
              <h2 className="mt-4 font-display text-[1.9rem] leading-tight text-[#F0F2F5]">
                The officer lifts the pack.
              </h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-[#94A3B8]">
                No lab, no sample preparation. The inspector picks the commodity off the counter,
                turns it to the principal display panel and holds it in front of the handheld
                scanning device — exactly as filed inspections happen today.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-[0.68rem] text-[#94A3B8]">
                <div className="border border-white/8 px-3 py-2">
                  <p className="text-[#F0F2F5]">6.4 s</p>
                  <p className="mt-1 uppercase tracking-[0.16em]">Average handling</p>
                </div>
                <div className="border border-white/8 px-3 py-2">
                  <p className="text-[#F0F2F5]">1 hand</p>
                  <p className="mt-1 uppercase tracking-[0.16em]">No manual entry</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StoryBlock>

      {/* 03 — SCAN */}
      <StoryBlock vh={110}>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="max-w-md">
            <div data-reveal className="flex items-center gap-3">
              <Camera className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#F59E0B]">
                Step 03 — Scan
              </span>
            </div>
            <h2 data-reveal className="mt-4 font-display text-[2rem] leading-tight text-[#F0F2F5]">
              One pass of the beam.
            </h2>
            <div data-reveal className="glass mt-6 divide-y divide-white/8">
              {SCAN_ROWS.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-[#94A3B8]">
                      {row.label}
                    </p>
                    <p className="mt-1 font-display text-lg text-[#F0F2F5]">{row.value}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] ${
                      row.state === "detected" ? "text-[#10B981]" : "text-[#F59E0B]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        row.state === "detected" ? "bg-[#10B981]" : "soft-pulse bg-[#F59E0B]"
                      }`}
                    />
                    {row.state === "detected" ? "Detected" : "Reading…"}
                  </span>
                </div>
              ))}
            </div>
            <p data-reveal className="mt-4 font-mono text-[0.66rem] leading-relaxed text-[#94A3B8]">
              Optical capture complete · 4 declaration regions isolated · image locked for evidence
            </p>
          </div>
        </div>
      </StoryBlock>
    </section>
  );
}
