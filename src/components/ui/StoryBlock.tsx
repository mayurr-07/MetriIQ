import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/scrollState";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type StoryBlockProps = {
  id?: string;
  /** height in vh */
  vh?: number;
  /** vertical placement of the copy so the package always keeps its place */
  align?: "start" | "center" | "end";
  className?: string;
  children: ReactNode;
};

const ALIGN = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
} as const;

/**
 * One beat of the story. Children marked with `data-reveal` animate in once
 * as the block enters the viewport (never re-pops, never breaks the flow).
 */
export default function StoryBlock({
  id,
  vh = 100,
  align = "center",
  className = "",
  children,
}: StoryBlockProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
      if (!targets.length) return;

      if (prefersReducedMotion()) {
        gsap.set(targets, { opacity: 1, y: 0, clearProps: "all" });
        return;
      }

      gsap.fromTo(
        targets,
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <div
      id={id}
      ref={root}
      className={`story-block relative flex w-full max-w-full ${ALIGN[align]} ${className}`}
      // Height is applied in CSS from this variable so it can resolve to
      // `dvh` where supported and fall back to `vh` everywhere else.
      style={{ "--block-vh": vh } as CSSProperties}
    >
      {children}
    </div>
  );
}
