import { FlaskConical } from "lucide-react";

export default function DemoBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-start gap-3 border border-[#F59E0B]/35 bg-[#F59E0B]/10 px-4 py-3">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-[#F59E0B]" aria-hidden="true" />
      <div>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[#F59E0B]">
          Demo analysis · not an official inspection
        </p>
        {!compact && (
          <p className="mt-1 text-[0.8rem] leading-relaxed text-[#F0F2F5]/85">
            OCR, quality analysis and compliance results on this record are sample previews.
            They must not be treated as a Legal Metrology finding.
          </p>
        )}
      </div>
    </div>
  );
}
