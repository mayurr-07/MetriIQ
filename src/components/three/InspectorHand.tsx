import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState, prefersReducedMotion } from "@/lib/scrollState";

/**
 * Cinematic left hand — realistic human proportions and articulation.
 *
 * The hand grips the package's LEFT vertical edge:
 *   - Palm rests flat on the left face.
 *   - Fingers wrap the front edge (nails face camera).
 *   - Thumb wraps the rear edge.
 *
 * Every mesh stays outside the package slab at all grip states.
 * Animation timing is driven by the same global scroll keyframes.
 */

// ── Rest / Grab transforms ────────────────────────────────────────
//
// GEOMETRY PROOF — palm must never enter the package slab.
//   Worst case is t 0.135: pkg = [0.15, 0.38, 0.12], rot y = -0.38
//   Package rotated half-extent = 2.2·cos(0.38) + 0.8·sin(0.38) = 2.340
//   Package leftmost world x     = 0.15 - 2.340 = -2.19
//
//   Palm capsule r 0.32 at local x -0.02 → local rightmost +0.30
//   With hand ry -0.1                    → +0.3085
//   Palm rightmost = GRAB.x + pkg[0] + 0.3085
//
//   Require: GRAB.x + 0.3085 < -2.340  →  GRAB.x < -2.6485
//   GRAB.x = -2.80 clears by 0.15 units, with headroom for the
//   package's small rot x/z tilts. Fingers still wrap the front edge
//   because they curl toward +X/+Z and stay ahead of the front face.
const REST = { x: -9.2, y: -0.35, z: 1.05, ry: 0.18, rz: 0.12 };
const GRAB = { x: -2.8, y: 0.22, z: 0.02, ry: -0.1, rz: -0.08 };

// Flex ranges (radians) — natural human curl
const FINGER_OPEN = [0.18, 0.12, 0.08] as const;
const FINGER_GRIP = [0.72, 0.88, 0.64] as const;
const THUMB_OPEN = [0.28, 0.32] as const;
const THUMB_GRIP = [0.82, 0.95] as const;

// Finger definitions (index → little)
const FINGERS = [
  { y: 0.48, z: 0.48, lengths: [0.46, 0.34, 0.26], r: 0.095 },
  { y: 0.16, z: 0.52, lengths: [0.5, 0.38, 0.29], r: 0.102 },
  { y: -0.16, z: 0.48, lengths: [0.47, 0.35, 0.27], r: 0.098 },
  { y: -0.46, z: 0.4, lengths: [0.38, 0.28, 0.22], r: 0.086 },
] as const;

type Mats = {
  skin: THREE.MeshPhysicalMaterial;
  skinDark: THREE.MeshPhysicalMaterial;
  knuckle: THREE.MeshPhysicalMaterial;
  nail: THREE.MeshPhysicalMaterial;
  sleeve: THREE.MeshStandardMaterial;
  cuff: THREE.MeshStandardMaterial;
  shirt: THREE.MeshStandardMaterial;
  watch: THREE.MeshStandardMaterial;
  dial: THREE.MeshStandardMaterial;
};

function createMaterials(): Mats {
  const skin = (
    color: string,
    opts: ConstructorParameters<typeof THREE.MeshPhysicalMaterial>[0] = {},
  ) =>
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.56,
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.52,
      sheen: 0.48,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#f0b890"),
      envMapIntensity: 0.75,
      ...opts,
    });

  return {
    skin: skin("#c49274"),
    skinDark: skin("#a97c5e", { roughness: 0.62 }),
    knuckle: skin("#c9a07e", { roughness: 0.48, clearcoat: 0.42 }),
    nail: new THREE.MeshPhysicalMaterial({
      color: "#e6c4b0",
      roughness: 0.14,
      metalness: 0.03,
      clearcoat: 1,
      clearcoatRoughness: 0.07,
      envMapIntensity: 1.4,
    }),
    sleeve: new THREE.MeshStandardMaterial({ color: "#2a3140", roughness: 0.88, metalness: 0.05 }),
    cuff: new THREE.MeshStandardMaterial({ color: "#3c4658", roughness: 0.76, metalness: 0.14 }),
    shirt: new THREE.MeshStandardMaterial({ color: "#eef2f6", roughness: 0.68 }),
    watch: new THREE.MeshStandardMaterial({ color: "#12161d", roughness: 0.3, metalness: 0.65 }),
    dial: new THREE.MeshStandardMaterial({
      color: "#0c1016",
      emissive: "#F59E0B",
      emissiveIntensity: 0.48,
      roughness: 0.26,
    }),
  };
}

export default function InspectorHand() {
  const root = useRef<THREE.Group>(null);
  const fingerJoints = useRef<Array<THREE.Group | null>>([]);
  const thumbJoints = useRef<Array<THREE.Group | null>>([]);
  const mats = useMemo(() => createMaterials(), []);
  const pose = useRef({ x: REST.x, y: REST.y, z: REST.z, ry: REST.ry, rz: REST.rz, rx: 0 });

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;

    const a = sceneState.hand;
    const dt = Math.min(delta, 0.05);
    const speed = a > 0.01 && a < 0.99 ? 10 : 6;
    const k = 1 - Math.exp(-speed * dt);
    const lock = THREE.MathUtils.smoothstep(a, 0.25, 0.55);

    // Follow package during grip
    const tx = THREE.MathUtils.lerp(REST.x, GRAB.x + lock * sceneState.pkg[0], a);
    const ty = THREE.MathUtils.lerp(REST.y, GRAB.y + lock * (sceneState.pkg[1] - 0.15), a);
    const tz = THREE.MathUtils.lerp(REST.z, GRAB.z + lock * sceneState.pkg[2], a);

    pose.current.x += (tx - pose.current.x) * k;
    pose.current.y += (ty - pose.current.y) * k;
    pose.current.z += (tz - pose.current.z) * k;
    pose.current.ry += (THREE.MathUtils.lerp(REST.ry, GRAB.ry, a) - pose.current.ry) * k;
    pose.current.rz += (THREE.MathUtils.lerp(REST.rz, GRAB.rz, a) - pose.current.rz) * k;
    pose.current.rx += (THREE.MathUtils.lerp(0.06, -0.16, a) - pose.current.rx) * k;

    const sway = a > 0.55 && !prefersReducedMotion()
      ? Math.sin(state.clock.elapsedTime * 1.15) * 0.006
      : 0;

    g.position.set(pose.current.x, pose.current.y, pose.current.z);
    g.rotation.set(pose.current.rx + sway * 0.4, pose.current.ry, pose.current.rz + sway);
    g.visible = a > 0.004 || pose.current.x > REST.x + 0.35;

    // Finger articulation (natural human curl)
    const curl = THREE.MathUtils.smoothstep(a, 0.22, 0.88);
    FINGERS.forEach((_, i) => {
      const s = THREE.MathUtils.clamp(curl * 1.08 - i * 0.05, 0, 1);
      const j0 = fingerJoints.current[i * 3];
      const j1 = fingerJoints.current[i * 3 + 1];
      const j2 = fingerJoints.current[i * 3 + 2];
      if (j0) j0.rotation.y = THREE.MathUtils.lerp(FINGER_OPEN[0], FINGER_GRIP[0], s);
      if (j1) j1.rotation.y = THREE.MathUtils.lerp(FINGER_OPEN[1], FINGER_GRIP[1], s);
      if (j2) j2.rotation.y = THREE.MathUtils.lerp(FINGER_OPEN[2], FINGER_GRIP[2], s);
    });

    // Thumb opposition
    const t = THREE.MathUtils.smoothstep(a, 0.28, 0.82);
    const tj0 = thumbJoints.current[0];
    const tj1 = thumbJoints.current[1];
    if (tj0) tj0.rotation.y = THREE.MathUtils.lerp(THUMB_OPEN[0], THUMB_GRIP[0], t);
    if (tj1) tj1.rotation.y = THREE.MathUtils.lerp(THUMB_OPEN[1], THUMB_GRIP[1], t);
  });

  const setFinger = (i: number) => (n: THREE.Group | null) => {
    fingerJoints.current[i] = n;
  };
  const setThumb = (i: number) => (n: THREE.Group | null) => {
    thumbJoints.current[i] = n;
  };

  return (
    <group ref={root} position={[REST.x, REST.y, REST.z]} visible={false}>
      {/* Sleeve */}
      <mesh position={[-1.65, 0, -0.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.38, 1.7, 8, 22]} />
        <primitive object={mats.sleeve} />
      </mesh>

      {/* Cuff */}
      <mesh position={[-0.74, 0, -0.22]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.37, 0.115, 12, 24]} />
        <primitive object={mats.cuff} />
      </mesh>

      {/* Shirt cuff visible under uniform */}
      <mesh position={[-0.48, 0, -0.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.31, 0.18, 6, 18]} />
        <primitive object={mats.shirt} />
      </mesh>

      {/* Wrist */}
      <mesh position={[-0.32, 0, -0.26]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.28, 0.44, 8, 18]} />
        <primitive object={mats.skinDark} />
      </mesh>

      {/* Watch */}
      <group position={[-0.9, 0.24, -0.26]} rotation={[0, 0, 0.08]}>
        <mesh castShadow>
          <boxGeometry args={[0.17, 0.095, 0.42]} />
          <primitive object={mats.watch} />
        </mesh>
        <mesh position={[0.095, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.122, 24]} />
          <primitive object={mats.dial} />
        </mesh>
      </group>

      {/* Palm — realistic human proportions (thin in X, broad in Y) */}
      <mesh position={[-0.02, 0, -0.1]} castShadow receiveShadow>
        <capsuleGeometry args={[0.32, 1.12, 6, 20]} />
        <primitive object={mats.skin} />
      </mesh>

      {/* Thenar mound (thumb side) */}
      <mesh position={[-0.08, -0.34, 0.1]} scale={[0.58, 1, 1]} castShadow>
        <sphereGeometry args={[0.26, 18, 14]} />
        <primitive object={mats.skin} />
      </mesh>

      {/* Hypothenar mound (pinky side) */}
      <mesh position={[-0.04, 0.42, -0.08]} scale={[0.42, 0.9, 0.7]} castShadow>
        <sphereGeometry args={[0.22, 18, 14]} />
        <primitive object={mats.skinDark} />
      </mesh>

      {/* Knuckle heads */}
      {FINGERS.map((f, i) => (
        <mesh key={`kn${i}`} position={[0.09, f.y, 0.34]} castShadow>
          <sphereGeometry args={[f.r * 1.05, 16, 14]} />
          <primitive object={mats.knuckle} />
        </mesh>
      ))}

      {/* Four fingers with natural human joint hierarchy */}
      {FINGERS.map((f, i) => {
        const [l0, l1, l2] = f.lengths;
        return (
          <group key={`f${i}`} position={[0, f.y, 0.34]}>
            {/* Proximal */}
            <group ref={setFinger(i * 3)} rotation={[0, FINGER_OPEN[0], 0]}>
              <mesh position={[0, 0, l0 / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <capsuleGeometry args={[f.r, l0, 6, 16]} />
                <primitive object={mats.skin} />
              </mesh>

              {/* Middle */}
              <group position={[0, 0, l0]} ref={setFinger(i * 3 + 1)} rotation={[0, FINGER_OPEN[1], 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[f.r * 0.92, 16, 14]} />
                  <primitive object={mats.skinDark} />
                </mesh>
                <mesh position={[0, 0, l1 / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <capsuleGeometry args={[f.r * 0.88, l1, 6, 16]} />
                  <primitive object={mats.skin} />
                </mesh>

                {/* Distal + nail */}
                <group position={[0, 0, l1]} ref={setFinger(i * 3 + 2)} rotation={[0, FINGER_OPEN[2], 0]}>
                  <mesh castShadow>
                    <sphereGeometry args={[f.r * 0.82, 16, 14]} />
                    <primitive object={mats.skinDark} />
                  </mesh>
                  <mesh position={[0, 0, l2 / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <capsuleGeometry args={[f.r * 0.76, l2, 6, 16]} />
                    <primitive object={mats.skin} />
                  </mesh>
                  {/* Nail */}
                  <mesh position={[0, f.r * 0.62, l2 * 0.78]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <capsuleGeometry args={[f.r * 0.55, 0.04, 4, 14]} />
                    <primitive object={mats.nail} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>
        );
      })}

      {/* Thumb — realistic opposition and two joints */}
      <group position={[-0.02, -0.48, -0.22]} rotation={[0.1, 0, 0.16]}>
        <group ref={setThumb(0)} rotation={[0, THUMB_OPEN[0], 0]}>
          <mesh position={[0, 0, -0.26]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.52, 6, 16]} />
            <primitive object={mats.skin} />
          </mesh>

          <group position={[0, 0, -0.52]} ref={setThumb(1)} rotation={[0, THUMB_OPEN[1], 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.12, 16, 14]} />
              <primitive object={mats.skinDark} />
            </mesh>
            <mesh position={[0, 0, -0.18]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.108, 0.36, 6, 16]} />
              <primitive object={mats.skin} />
            </mesh>
            {/* Thumb nail */}
            <mesh position={[0, 0.07, -0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <capsuleGeometry args={[0.078, 0.035, 4, 14]} />
              <primitive object={mats.nail} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
