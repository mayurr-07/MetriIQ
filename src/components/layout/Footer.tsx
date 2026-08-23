import { ArrowUp, Mail, MapPin, ShieldCheck } from "lucide-react";
import { ACTS, PRODUCT } from "@/lib/constants";

export default function Footer({ onOpenContact }: { onOpenContact: () => void }) {
  return (
    <footer className="relative z-10 border-t border-white/8 bg-[#080C14]">
      <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-[1.6rem] leading-tight text-[#F0F2F5]">
              AI Legal Metrology
              <br />
              Inspection Assistant
            </p>
            <p className="mt-4 max-w-sm text-[0.86rem] leading-relaxed text-[#94A3B8]">
              Decision-support for field inspectors under the Legal Metrology (Packaged Commodities)
              Rules, 2011. Every finding remains reviewable by the inspecting officer.
            </p>
            <button
              type="button"
              onClick={onOpenContact}
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#F59E0B] transition hover:bg-[#F59E0B]/20"
            >
              Request department access
            </button>
          </div>

          <div>
            <p className="eyebrow">The journey</p>
            <ul className="mt-4 space-y-2">
              {ACTS.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById(a.id)?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="flex min-h-[36px] items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.18em] text-[#94A3B8] transition hover:text-[#F0F2F5]"
                  >
                    <span className="text-[#F59E0B]">{a.index}</span>
                    {a.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Reference</p>
            <ul className="mt-4 space-y-2 font-mono text-[0.64rem] leading-relaxed text-[#94A3B8]">
              <li>Rule 6 — mandatory declarations</li>
              <li>Rule 18 — retail price print</li>
              <li>Rule 33 — inspection powers</li>
              <li>SIH problem statement PS:26034</li>
            </ul>
          </div>

          <div>
            <p className="eyebrow">Controller’s office</p>
            <ul className="mt-4 space-y-3 text-[0.8rem] text-[#94A3B8]">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
                Dept. of Legal Metrology, Jaipur — Zone II, Rajasthan 302005
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
                lm-ai-support@rajasthan.example
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
                Helpline 1800-266-XXXX · Mon–Sat 10:00–18:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#64748B]">
            © 2026 Department of Legal Metrology · Demonstration build · Reference{" "}
            {PRODUCT.inspectionId}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex min-h-[44px] items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-[#94A3B8] transition hover:text-[#F59E0B]"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Back to the package
          </button>
        </div>
      </div>
    </footer>
  );
}
