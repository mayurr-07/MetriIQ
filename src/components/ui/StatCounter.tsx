import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/scrollState";

export type StatCounterProps = {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
};

export default function StatCounter({
  value,
  duration = 1.6,
  className = "",
  format,
}: StatCounterProps) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const node = el.current;
      if (!node) return;
      const render = (n: number) => {
        node.textContent = format ? format(Math.round(n)) : Math.round(n).toLocaleString("en-IN");
      };
      if (prefersReducedMotion()) {
        render(value);
        return;
      }
      const counter = { n: 0 };
      render(0);
      gsap.to(counter, {
        n: value,
        duration,
        ease: "power2.out",
        onUpdate: () => render(counter.n),
        scrollTrigger: { trigger: node, start: "top 88%" },
      });
    },
    { dependencies: [value] },
  );

  return (
    <span ref={el} className={className}>
      0
    </span>
  );
}
