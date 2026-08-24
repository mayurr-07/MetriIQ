import { cn } from "@/utils/cn";
import type { CategoryCount, TrendPoint } from "@/types/analytics";

/** Horizontal bar list — best for comparing category counts. */
export function BarList({
  items,
  accent = "#F59E0B",
}: {
  items: CategoryCount[];
  accent?: string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.key}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[0.82rem] text-[#E2E8F0]">{item.label}</span>
            <span className="shrink-0 font-mono text-[0.72rem] tabular-nums text-[#94A3B8]">
              {item.count}
            </span>
          </div>
          <div
            className="mt-1.5 h-1.5 w-full bg-white/[0.06]"
            role="img"
            aria-label={`${item.label}: ${item.count}`}
          >
            <div
              className="h-full transition-[width] duration-500"
              style={{ width: `${(item.count / max) * 100}%`, backgroundColor: accent }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Sparkline-style trend chart rendered as inline SVG. */
export function TrendChart({ points, accent = "#F59E0B" }: { points: TrendPoint[]; accent?: string }) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const w = 100;
  const h = 34;
  const step = points.length > 1 ? w / (points.length - 1) : 0;

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(2)} ${(h - (p.value / max) * (h - 4)).toFixed(2)}`)
    .join(" ");

  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-28 w-full"
        role="img"
        aria-label={points.map((p) => `${p.label}: ${p.value}`).join(", ")}
      >
        {points.length > 1 && <path d={area} fill={accent} opacity={0.12} />}
        <path
          d={path}
          fill="none"
          stroke={accent}
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={p.label + i}
            cx={i * step}
            cy={h - (p.value / max) * (h - 4)}
            r={1.4}
            fill={accent}
          />
        ))}
      </svg>
      <figcaption className="mt-2 flex justify-between font-mono text-[0.6rem] text-[#64748B]">
        {points.map((p, i) => (
          <span key={p.label + i} className="truncate">
            {p.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/** Proportional segmented bar — a readable alternative to a pie chart. */
export function DistributionBar({ items }: { items: CategoryCount[] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0) || 1;
  const palette = ["#F59E0B", "#38BDF8", "#A78BFA", "#10B981", "#EF4444", "#94A3B8"];

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden bg-white/[0.06]" role="img" aria-label="Distribution">
        {items.map((item, i) => (
          <div
            key={item.key}
            style={{ width: `${(item.count / total) * 100}%`, backgroundColor: palette[i % palette.length] }}
            title={`${item.label}: ${item.count}`}
          />
        ))}
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.key} className="flex items-center gap-2 text-[0.78rem] text-[#CBD5E1]">
            <span
              className="h-2 w-2 shrink-0"
              style={{ backgroundColor: palette[i % palette.length] }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <span className="font-mono text-[0.7rem] tabular-nums text-[#94A3B8]">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Region density strip — a lightweight stand-in for a future GIS map. */
export function RegionDensity({
  rows,
}: {
  rows: Array<{ region: string; complaints: number; inspections: number }>;
}) {
  const max = Math.max(...rows.map((r) => r.complaints + r.inspections), 1);
  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const total = row.complaints + row.inspections;
        const intensity = total / max;
        return (
          <li key={row.region} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-[0.8rem] text-[#E2E8F0]">{row.region}</span>
            <span className="relative h-6 min-w-0 flex-1 bg-white/[0.04]">
              <span
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${Math.max(intensity * 100, 6)}%`,
                  backgroundColor: `rgba(245, 158, 11, ${0.25 + intensity * 0.5})`,
                }}
              />
            </span>
            <span className="w-24 shrink-0 text-right font-mono text-[0.65rem] tabular-nums text-[#94A3B8]">
              {row.complaints}c · {row.inspections}i
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Risk level pill — always pairs colour with an explicit text label. */
export function RiskBadge({ level }: { level: "LOW" | "MODERATE" | "ELEVATED" | "HIGH" }) {
  const map = {
    HIGH: "border-[#EF4444]/45 bg-[#EF4444]/10 text-[#EF4444]",
    ELEVATED: "border-[#F59E0B]/45 bg-[#F59E0B]/10 text-[#F59E0B]",
    MODERATE: "border-blue-400/35 bg-blue-400/10 text-blue-300",
    LOW: "border-white/15 bg-white/5 text-[#94A3B8]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.16em]",
        map[level],
      )}
    >
      {level}
    </span>
  );
}
