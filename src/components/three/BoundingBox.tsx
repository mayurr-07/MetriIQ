import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PACKAGE_SIZE } from "@/lib/constants";
import { sceneState } from "@/lib/scrollState";
import { tagTexture } from "@/lib/textures";

const [W, H, D] = PACKAGE_SIZE;

export type BoundingBoxProps = {
  /** normalised rect on the front face, 0..1 from top-left */
  rect: { x: number; y: number; w: number; h: number };
  label: string;
  value: string;
  color: string;
  /** how much this box lags behind the global AI-layer reveal */
  stagger: number;
  /** anchor the caption chip to the left or right edge */
  anchor: "left" | "right";
};

const THICK = 0.022;

export default function BoundingBox({
  rect,
  label,
  value,
  color,
  stagger,
  anchor,
}: BoundingBoxProps) {
  const root = useRef<THREE.Group>(null);
  const fill = useRef<THREE.Mesh>(null);
  const top = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const bottom = useRef<THREE.Mesh>(null);
  const left = useRef<THREE.Mesh>(null);
  const chip = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const w = rect.w * W;
    const h = rect.h * H;
    const cx = (rect.x + rect.w / 2 - 0.5) * W;
    const cy = (0.5 - (rect.y + rect.h / 2)) * H;
    return { w, h, cx, cy };
  }, [rect]);

  const chipTex = useMemo(() => tagTexture(`${label}  ${value}`, color), [label, value, color]);

  useFrame(() => {
    const raw = (sceneState.boxes - stagger * 0.08) * 1.6;
    const p = Math.min(1, Math.max(0, raw));
    const g = root.current;
    if (!g) return;
    g.visible = p > 0.004;

    // four sequential strokes: top → right → bottom → left
    const seg = (v: number) => Math.min(1, Math.max(0, v * 4));
    const sTop = seg(p);
    const sRight = seg(p - 0.25);
    const sBottom = seg(p - 0.5);
    const sLeft = seg(p - 0.75);

    const { w, h } = geo;
    if (top.current) {
      top.current.scale.x = sTop || 0.0001;
      top.current.position.x = -w / 2 + (w * sTop) / 2;
    }
    if (right.current) {
      right.current.scale.y = sRight || 0.0001;
      right.current.position.y = h / 2 - (h * sRight) / 2;
    }
    if (bottom.current) {
      bottom.current.scale.x = sBottom || 0.0001;
      bottom.current.position.x = w / 2 - (w * sBottom) / 2;
    }
    if (left.current) {
      left.current.scale.y = sLeft || 0.0001;
      left.current.position.y = -h / 2 + (h * sLeft) / 2;
    }
    if (fill.current) {
      const mat = fill.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.085 * p;
    }
    if (chip.current) {
      const s = Math.min(1, Math.max(0, (p - 0.72) / 0.28));
      chip.current.scale.setScalar(s || 0.0001);
      chip.current.position.y = geo.h / 2 + 0.22 * s;
    }
  });

  const { w, h, cx, cy } = geo;
  const chipX = anchor === "right" ? w / 2 - 0.62 : -w / 2 + 0.62;

  return (
    <group ref={root} position={[cx, cy, D / 2 + 0.03]} visible={false}>
      <mesh ref={fill}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh ref={top} position={[0, h / 2, 0]}>
        <planeGeometry args={[w, THICK]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh ref={bottom} position={[0, -h / 2, 0]}>
        <planeGeometry args={[w, THICK]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh ref={left} position={[-w / 2, 0, 0]}>
        <planeGeometry args={[THICK, h]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh ref={right} position={[w / 2, 0, 0]}>
        <planeGeometry args={[THICK, h]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} depthWrite={false} />
      </mesh>

      <group ref={chip} position={[chipX, h / 2 + 0.22, 0]} scale={0.0001}>
        <mesh>
          <planeGeometry args={[1.24, 0.31]} />
          <meshBasicMaterial map={chipTex} transparent depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
