import { useEffect, useState } from "react";
import { AlertTriangle, FileCheck2, ScanSearch, ShieldCheck } from "lucide-react";
import StoryBlock from "@/components/ui/StoryBlock";
import StatCounter from "@/components/ui/StatCounter";
import { DECLARATIONS, ISSUE, PRODUCT, RESULT_SUMMARY } from "@/lib/constants";
import { mrpCropDataUrl } from "@/lib/textures";

const SUMMARY_TONE = {
  pass: { text: "text-[#10B981]", border: "border-[#10B981]/35", dot: "bg-[#10B981]" },
  review: { text: "text-[#F59E0B]", border: "border-[#F59E0B]/35", dot: "bg-[#F59E0B]" },
  issue: { text: "text-[#EF4444]", border: "border-[#EF4444]/40", dot: "bg-[#EF4444]" },
} as const;

export default function VerifySection() {
  const [crop, setCrop] = useState<string>("");

  useEffect(() => {
    const id = window.setTimeout(() => setCrop(mrpCropDataUrl()), 250);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section id="verify" aria-label="Act III — Verify">
      {/* 06 — ISSUE DETECTED */}
      <StoryBlock vh={100} align="start">
        <div className="mx-auto w-full max-w-7xl px-6 pt-28 md:px-10 md:pt-32">
          <div className="mx-auto max-w-2xl text-center">
            <div
              data-reveal
              className="inline-flex items-center gap-3 border border-[#EF4444]/40 bg-[#EF4444]/8 px-4 py-2"
            >
              <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#EF4444]">
                Act III · 06 — Issue detected
              </span>
            </div>
            <h2
              data-reveal
              className="mt-5 font-display text-[clamp(1.8rem,4.6vw,3rem)] leading-tight text-[#F0F2F5]"
            >
              {ISSUE.title}
            </h2>
            <p
              data-reveal
              className="mt-2 font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[#94A3B8]"
            >
              Confidence: <StatCounter value={ISSUE.confidence} className="text-[#F59E0B]" />%
            </p>
            <div data-reveal className="glass mx-auto mt-6 max-w-lg px-5 py-4 text-left">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-[#94A3B8]">
                Region under review
              </p>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-[#F0F2F5]">
                MRP declaration — top-right principal display panel. Printed digit height measures
                below the mandated minimum and the "₹" glyph overlaps the price numeral.
              </p>
            </div>
          </div>
        </div>
      </StoryBlock>

      {/* 07 — EVIDENCE CAPTURED */}
      <StoryBlock vh={110}>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="ml-auto max-w-lg">
            <div data-reveal className="flex items-center gap-3">
              <ScanSearch className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#F59E0B]">
                07 — Evidence captured
              </span>
            </div>

            <div data-reveal className="paper mt-4 p-5">
              <div className="flex items-center justify-between border-b border-[#1a1f2b]/15 pb-3">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.26em] text-[#5b6472]">
                  Evidence captured
                </p>
                <span className="inline-flex h-6 items-center border border-[#b45309]/40 px-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-[#b45309]">
                  Exhibit A
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <div className="w-full shrink-0 sm:w-[46%]">
                  {crop ? (
                    <img
                      src={crop}
                      alt="Cropped image of the MRP declaration region on the package"
                      className="w-full border border-[#1a1f2b]/20"
                    />
                  ) : (
                    <div className="h-[92px] w-full animate-pulse bg-[#1a1f2b]/10" />
                  )}
                  <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[#5b6472]">
                    Crop · MRP region
                  </p>
                </div>
                <dl className="flex-1 space-y-2.5 font-mono text-[0.7rem]">
                  <div>
                    <dt className="text-[0.55rem] uppercase tracking-[0.2em] text-[#5b6472]">
                      Declaration
                    </dt>
                    <dd className="text-[#1a1f2b]">{ISSUE.declaration}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.55rem] uppercase tracking-[0.2em] text-[#5b6472]">
                      Status
                    </dt>
                    <dd className="text-[#b91c1c]">{ISSUE.status}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.55rem] uppercase tracking-[0.2em] text-[#5b6472]">
                      Confidence
                    </dt>
                    <dd className="text-[#1a1f2b]">{ISSUE.confidence}%</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-[#1a1f2b]/15 pt-3">
                <ShieldCheck className="h-3.5 w-3.5 text-[#b45309]" />
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#5b6472]">
                  {ISSUE.backing}
                </p>
              </div>
              <p className="mt-3 font-mono text-[0.55rem] leading-relaxed text-[#8a8172]">
                SHA-256 9f4c…b21e · captured {PRODUCT.date} · device LM-HH-118 · officer{" "}
                {PRODUCT.officerId}
              </p>
            </div>
          </div>
        </div>
      </StoryBlock>

      {/* 08 — INSPECTION COMPLETE */}
      <StoryBlock vh={90} align="end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-10 md:pb-20">
          <div data-reveal className="mx-auto max-w-3xl text-center">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#94A3B8]">
              08 — Inspection complete
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.6rem)] text-[#F0F2F5]">
              Result recorded against{" "}
              <span className="font-mono text-[#F59E0B]">{PRODUCT.inspectionId}</span>
            </h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {RESULT_SUMMARY.map((r) => (
                <div
                  key={r.label}
                  data-reveal
                  className={`border ${SUMMARY_TONE[r.tone].border} bg-[#0E1521]/80 px-4 py-5`}
                >
                  <p className={`font-display text-[2.6rem] leading-none ${SUMMARY_TONE[r.tone].text}`}>
                    <StatCounter value={r.value} />
                  </p>
                  <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8]">
                    {r.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </StoryBlock>

      {/* 09 — REPORT GENERATED */}
      <StoryBlock vh={110}>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="ml-auto max-w-2xl">
            <div data-reveal className="flex items-center gap-3">
              <FileCheck2 className="h-4 w-4 text-[#F59E0B]" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-[#F59E0B]">
                09 — Report generated
              </span>
            </div>

            <div data-reveal className="paper mt-4 p-5 md:p-7">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#1a1f2b]/80 pb-3">
                <div>
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-[#5b6472]">
                    Government of Rajasthan · Legal Metrology
                  </p>
                  <h3 className="mt-1 font-display text-[1.5rem] leading-tight text-[#1a1f2b]">
                    Packaged Commodity Inspection Report
                  </h3>
                </div>
                <div className="text-right font-mono text-[0.62rem] text-[#5b6472]">
                  <p className="text-[#1a1f2b]">{PRODUCT.inspectionId}</p>
                  <p>{PRODUCT.date}</p>
                </div>
              </header>

              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-[0.66rem] text-[#5b6472] md:grid-cols-4">
                <div>
                  <dt className="text-[0.55rem] uppercase tracking-[0.18em]">Product</dt>
                  <dd className="text-[#1a1f2b]">{PRODUCT.name}</dd>
                </div>
                <div>
                  <dt className="text-[0.55rem] uppercase tracking-[0.18em]">Brand</dt>
                  <dd className="text-[#1a1f2b]">{PRODUCT.brand}</dd>
                </div>
                <div>
                  <dt className="text-[0.55rem] uppercase tracking-[0.18em]">Inspector</dt>
                  <dd className="text-[#1a1f2b]">{PRODUCT.officer}</dd>
                </div>
                <div>
                  <dt className="text-[0.55rem] uppercase tracking-[0.18em]">District</dt>
                  <dd className="text-[#1a1f2b]">{PRODUCT.district}</dd>
                </div>
              </dl>

              <div className="mt-5 -mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[300px] border-collapse text-left font-mono text-[0.66rem]">
                <thead>
                  <tr className="border-y border-[#1a1f2b]/25 text-[0.55rem] uppercase tracking-[0.18em] text-[#5b6472]">
                    <th className="py-2">Declaration</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {DECLARATIONS.map((d) => (
                    <tr key={d.id} className="border-b border-[#1a1f2b]/12">
                      <td className="py-2 text-[#1a1f2b]">
                        {d.label}
                        <span className="ml-2 text-[#8a8172]">{d.value}</span>
                      </td>
                      <td
                        className={`py-2 uppercase ${
                          d.status === "pass"
                            ? "text-[#047857]"
                            : d.status === "review"
                              ? "text-[#b45309]"
                              : "text-[#b91c1c]"
                        }`}
                      >
                        {d.status === "pass"
                          ? "Passed"
                          : d.status === "review"
                            ? "Review"
                            : "Non-compliance"}
                      </td>
                      <td className="py-2 text-[#5b6472]">
                        {d.status === "pass" ? "Visual + OCR" : "Visual crop"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <footer className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#1a1f2b]/20 pt-4">
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#5b6472]">
                  Compliance status
                </p>
                <span className="inline-flex items-center gap-2 border border-[#b45309] px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#b45309]">
                  Review required
                </span>
              </footer>
            </div>
          </div>
        </div>
      </StoryBlock>
    </section>
  );
}
