import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type Vec3 = [number, number, number];

export type Keyframe = {
  t: number;
  cam: Vec3;
  target: Vec3;
  pkg: Vec3;
  rot: Vec3;
  beam: number;
  hand: number;
  boxes: number;
  nodes: number;
  focus: number;
};

/**
 * ── SCROLL MATH (verified) ────────────────────────────────────────────────
 * #story height = 310 + 210 + 410 + 350 = 1280vh
 * ScrollTrigger range = 1280vh − 100vh viewport = 1180vh
 * so  t = sectionTopVh / 1180
 *
 *   01 hero        0vh     t 0.000
 *   02 PICK UP   100vh     t 0.085  ← hand must grip here
 *   03 SCAN      200vh     t 0.170  ← beam must peak here
 *   04 AI label  310vh     t 0.263
 *   05 rules     410vh     t 0.347
 *   06 issue     520vh     t 0.441
 *   07 evidence  620vh     t 0.525
 *   08 complete  730vh     t 0.619
 *   09 report    820vh     t 0.695
 *   10 stored    930vh     t 0.788
 *   11 dashboard 1030vh    t 0.873
 *   12 finale    1160vh    t 0.983
 */
export const KEYFRAMES: Keyframe[] = [
  // ── 01 THE PACKAGE ──────────────────────────────────────────────
  { t: 0.000, cam: [0.1, 1.0, 10.4],  target: [-1.0, 0.15, 0],    pkg: [0, 0.15, 0],       rot: [0, -0.30, 0],     beam: 0,    hand: 0,    boxes: 0,   nodes: 0,    focus: 0 },
  { t: 0.045, cam: [0.8, 0.95, 8.2],  target: [-0.5, 0.20, 0],    pkg: [0, 0.15, 0],       rot: [0, -0.26, 0],     beam: 0,    hand: 0,    boxes: 0,   nodes: 0,    focus: 0 },

  // ── 02 PICK UP (starts t 0.085) — hand enters, grips, lifts ─────
  { t: 0.085, cam: [1.25, 0.95, 7.1], target: [0.10, 0.25, 0],    pkg: [0, 0.15, 0],       rot: [0, -0.22, 0],     beam: 0,    hand: 0.15, boxes: 0,   nodes: 0,    focus: 0 },
  { t: 0.110, cam: [1.45, 0.98, 6.6], target: [0.40, 0.28, 0],    pkg: [0.08, 0.26, 0.06], rot: [0.03, -0.32, 0.07], beam: 0,  hand: 0.65, boxes: 0,   nodes: 0,    focus: 0 },
  { t: 0.135, cam: [1.55, 1.00, 6.3], target: [0.50, 0.32, 0],    pkg: [0.15, 0.38, 0.12], rot: [0.05, -0.38, 0.10], beam: 0,  hand: 1,    boxes: 0,   nodes: 0,    focus: 0 },

  // ── 03 SCAN (starts t 0.170) — beam peaks, hand still holding ───
  { t: 0.170, cam: [1.35, 0.90, 5.95],target: [0.25, 0.30, 0.08], pkg: [0.12, 0.35, 0.10], rot: [0.04, -0.33, 0.08], beam: 0.35, hand: 1,   boxes: 0,   nodes: 0,    focus: 0 },
  { t: 0.195, cam: [1.10, 0.85, 5.80],target: [0.05, 0.30, 0.10], pkg: [0.10, 0.33, 0.10], rot: [0.04, -0.30, 0.06], beam: 1,    hand: 1,   boxes: 0,   nodes: 0,    focus: 0 },
  { t: 0.225, cam: [0.80, 0.78, 5.60],target: [-0.10, 0.26, 0.06],pkg: [0.06, 0.26, 0.06], rot: [0.03, -0.22, 0.04], beam: 0.8,  hand: 0.95,boxes: 0,   nodes: 0,    focus: 0 },
  { t: 0.250, cam: [0.40, 0.68, 5.40],target: [-0.30, 0.20, 0.02],pkg: [0.02, 0.18, 0.02], rot: [0.01, -0.12, 0.02], beam: 0.2,  hand: 0.4, boxes: 0,   nodes: 0,    focus: 0 },

  // ── 04 AI SEES THE LABEL (starts t 0.263) — hand gone, boxes draw ─
  { t: 0.263, cam: [0.15, 0.62, 5.20],target: [-0.45, 0.16, 0],   pkg: [0, 0.15, 0],       rot: [0, -0.06, 0],     beam: 0,    hand: 0,    boxes: 0.3, nodes: 0,    focus: 0 },
  { t: 0.305, cam: [0, 0.56, 4.95],   target: [-0.70, 0.15, 0],   pkg: [0, 0.15, 0],       rot: [0, 0, 0],         beam: 0,    hand: 0,    boxes: 1,   nodes: 0,    focus: 0 },

  // ── 05 RULES CHECK (starts t 0.347) ─────────────────────────────
  { t: 0.347, cam: [-0.25, 0.52, 4.75],target: [0.60, 0.15, 0],   pkg: [0, 0.15, 0],       rot: [0, 0.06, 0],      beam: 0,    hand: 0,    boxes: 1,   nodes: 0,    focus: 0 },
  { t: 0.400, cam: [0.45, 0.58, 4.10],target: [0.55, 0.55, 0.35], pkg: [0, 0.15, 0],       rot: [0, -0.05, 0],     beam: 0,    hand: 0,    boxes: 0.9, nodes: 0,    focus: 0.4 },

  // ── 06 ISSUE DETECTED (starts t 0.441) ──────────────────────────
  { t: 0.441, cam: [1.40, 0.78, 2.60],target: [1.25, 1.00, 0.80], pkg: [0, 0.15, 0],       rot: [0, -0.02, 0],     beam: 0,    hand: 0,    boxes: 0.7, nodes: 0,    focus: 1 },
  { t: 0.490, cam: [1.36, 0.78, 2.50],target: [1.26, 1.00, 0.80], pkg: [0, 0.15, 0],       rot: [0, -0.02, 0],     beam: 0,    hand: 0,    boxes: 0.7, nodes: 0,    focus: 1 },

  // ── 07 EVIDENCE CAPTURED (starts t 0.525) ───────────────────────
  { t: 0.525, cam: [-0.10, 0.60, 6.60],target: [-1.00, 0.10, 0],  pkg: [-2.10, 0.10, 0],   rot: [0, 0.30, 0],      beam: 0,    hand: 0,    boxes: 0.3, nodes: 0,    focus: 0 },

  // ── 08 INSPECTION COMPLETE (starts t 0.619) ─────────────────────
  { t: 0.575, cam: [0, 0.60, 6.40],   target: [0, -0.30, 0],      pkg: [0, 0.15, 0],       rot: [0, -0.05, 0],     beam: 0,    hand: 0,    boxes: 0.15,nodes: 0.06, focus: 0 },
  { t: 0.619, cam: [0, 0.62, 6.50],   target: [0, -0.32, 0],      pkg: [0, 0.15, 0],       rot: [0, -0.05, 0],     beam: 0,    hand: 0,    boxes: 0.1, nodes: 0.14, focus: 0 },

  // ── 09 REPORT GENERATED (starts t 0.695) ────────────────────────
  { t: 0.695, cam: [0, 0.70, 6.80],   target: [1.00, 0.15, 0],    pkg: [0, 0.15, 0],       rot: [0, -0.10, 0],     beam: 0,    hand: 0,    boxes: 0,   nodes: 0.30, focus: 0 },

  // ── 10 STORED IN SYSTEM (starts t 0.788) ────────────────────────
  { t: 0.788, cam: [0, 1.00, 9.40],   target: [-0.90, 0.10, 0],   pkg: [0, 0.05, -0.30],   rot: [0, -0.06, 0],     beam: 0,    hand: 0,    boxes: 0,   nodes: 0.70, focus: 0 },

  // ── 11 DASHBOARD (starts t 0.873) ───────────────────────────────
  { t: 0.873, cam: [-1.50, 1.00, 9.80],target: [-1.70, 0.10, -0.2],pkg: [-2.50, 0.05, -0.5],rot: [0, 0.45, 0],     beam: 0,    hand: 0,    boxes: 0,   nodes: 0.90, focus: 0 },

  // ── 12 THE BIG PICTURE (starts t 0.983) ─────────────────────────
  { t: 0.983, cam: [0, 1.10, 10.60],  target: [0, -0.50, -0.40],  pkg: [0, 0.05, -0.80],   rot: [0, -0.05, 0],     beam: 0,    hand: 0,    boxes: 0,   nodes: 1,    focus: 0 },
  { t: 1.000, cam: [0, 1.15, 11.60],  target: [0, -0.50, -0.60],  pkg: [0, 0.05, -1.20],   rot: [0, -0.05, 0],     beam: 0,    hand: 0,    boxes: 0,   nodes: 1,    focus: 0 },
];

/** Mutable, non-reactive state read inside useFrame (no re-renders). */
export type SceneState = {
  progress: number;
  beam: number;
  hand: number;
  boxes: number;
  nodes: number;
  focus: number;
  cam: Vec3;
  target: Vec3;
  pkg: Vec3;
  rot: Vec3;
  reduced: boolean;
};

export const sceneState: SceneState = {
  progress: 0,
  beam: 0,
  hand: 0,
  boxes: 0,
  nodes: 0,
  focus: 0,
  cam: [0.1, 1.0, 10.4],
  target: [-1.0, 0.15, 0],
  pkg: [0, 0.15, 0],
  rot: [0, -0.3, 0],
  reduced: false,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function sampleKeyframes(p: number): {
  cam: Vec3;
  target: Vec3;
  pkg: Vec3;
  rot: Vec3;
  beam: number;
  hand: number;
  boxes: number;
  nodes: number;
  focus: number;
} {
  const clamped = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].t < clamped) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const span = b.t - a.t || 1;
  const raw = (clamped - a.t) / span;
  const k = smooth(Math.min(1, Math.max(0, raw)));
  const mix3 = (x: Vec3, y: Vec3): Vec3 => [
    lerp(x[0], y[0], k),
    lerp(x[1], y[1], k),
    lerp(x[2], y[2], k),
  ];
  return {
    cam: mix3(a.cam, b.cam),
    target: mix3(a.target, b.target),
    pkg: mix3(a.pkg, b.pkg),
    rot: mix3(a.rot, b.rot),
    beam: lerp(a.beam, b.beam, k),
    hand: lerp(a.hand, b.hand, k),
    boxes: lerp(a.boxes, b.boxes, k),
    nodes: lerp(a.nodes, b.nodes, k),
    focus: lerp(a.focus, b.focus, k),
  };
}

export function writeSceneState(p: number): void {
  const s = sampleKeyframes(p);
  sceneState.progress = p;
  sceneState.cam = s.cam;
  sceneState.target = s.target;
  sceneState.pkg = s.pkg;
  sceneState.rot = s.rot;
  sceneState.beam = s.beam;
  sceneState.hand = s.hand;
  sceneState.boxes = s.boxes;
  sceneState.nodes = s.nodes;
  sceneState.focus = s.focus;
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
