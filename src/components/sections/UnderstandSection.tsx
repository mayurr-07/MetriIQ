import { Boxes, Scale } from "lucide-react";
import StoryBlock from "@/components/ui/StoryBlock";
import { DECLARATIONS } from "@/lib/constants";
import type { Declaration } from "@/lib/constants";

const TONE: Record<Declaration["status"], { dot: string; text: string; word: string }> = {
  pass: { dot: "bg-[#10B981]", text: "text-[#10B981]", word: "Passed" },
  review: { dot: "bg-[#F59E0B]", text: "text-[#F59E0B]", word: "Review Required" },
  issue: { dot: "bg-[#EF4444]", text: "text-[#EF4444]", word: "Potential Violation" },
};

export default function UnderstandSection() {
  return (
    <section id="understand" aria-label="Act II — Understand">
      {/* 04 — AI SEES THE LABEL */}
      <StoryBlock vh={100}>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="max-w-md">
            <div data-reveal className="flex items-center gap-3">
              <Boxes className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#F59E0B]">
                Act II · 04 — Understand
              </span>
            </div>
            <h2 data-reveal className="mt-4 font-display text-[2.1rem] leading-tight text-[#F0F2F5]">
              The model reads the label,
              <br />
              not a description of it.
            </h2>
            <p data-reveal className="mt-4 text-[0.92rem] leading-relaxed text-[#94A3B8]">
              Spatial understanding places a region on each declaration exactly where it is printed
              — top-right price panel, bottom-left quantity block, manufacture date, consumer care
              line. Nothing is guessed from text alone.
            </p>
            <ul data-reveal className="mt-5 space-y-2 font-mono text-[0.68rem] text-[#94A3B8]">
              {DECLARATIONS.map((d) => (
                <li key={d.id} className="flex items-center gap-3">
                  <span className={`h-1.5 w-1.5 ${TONE[d.status].dot}`} />
                  <span className="w-36 uppercase tracking-[0.18em] text-[#F0F2F5]">{d.label}</span>
                  <span className="text-[#94A3B8]">
                    region {Math.round(d.box.x * 100)},{Math.round(d.box.y * 100)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </StoryBlock>

      {/* 05 — RULES CHECK */}
      <StoryBlock vh={110}>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="ml-auto max-w-xl">
            <div data-reveal className="flex items-center gap-3">
              <Scale className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#F59E0B]">
                05 — Rules check
              </span>
            </div>
            <h2 data-reveal className="mt-4 mb-6 font-display text-[2.1rem] leading-tight text-[#F0F2F5]">
              Every declaration,
              <br />
              against the Rule.
            </h2>

            <div className="relative space-y-3">
              {DECLARATIONS.map((d) => (
                <div key={d.id} data-reveal className="relative">
                  {/* connector to the declaration region on the pack */}
                  <span
                    aria-hidden
                    className="absolute -left-6 top-1/2 hidden h-px w-5 bg-gradient-to-l from-white/25 to-transparent md:block"
                  />
                  <div className="flex items-start gap-4 border border-white/10 bg-[#0E1521]/85 px-4 py-3.5 backdrop-blur-md">
                    <span className={`mt-2 h-2 w-2 shrink-0 ${TONE[d.status].dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-[#94A3B8]">
                          {d.label}
                        </p>
                        <p className="font-display text-lg text-[#F0F2F5]">{d.value}</p>
                      </div>
                      <p className="mt-2 font-mono text-[0.62rem] leading-relaxed text-[#64748B]">
                        {d.rule}
                      </p>
                      <p className="mt-1 text-[0.78rem] text-[#94A3B8]">{d.note}</p>
                    </div>
                    <span
                      className={`shrink-0 font-mono text-[0.58rem] uppercase tracking-[0.18em] ${TONE[d.status].text}`}
                    >
                      {TONE[d.status].word}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StoryBlock>
    </section>
  );
}
