import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion, sceneState, writeSceneState } from "@/lib/scrollState";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Lenis inertia scroll + the single global ScrollTrigger that drives the 3D story. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    sceneState.reduced = prefersReducedMotion();
    if (sceneState.reduced) {
      writeSceneState(0);
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  useGSAP(() => {
    const story = document.querySelector<HTMLElement>("#story");
    if (!story) return;
    const st = ScrollTrigger.create({
      trigger: story,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => writeSceneState(self.progress),
      onRefresh: (self) => writeSceneState(self.progress),
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => window.clearTimeout(id);
  }, []);

  return <>{children}</>;
}
