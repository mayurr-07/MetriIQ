import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/scrollState";
import { PACKAGE_SIZE, TABLE_Y } from "@/lib/constants";

const COUNT = 460;
const SPAN_Y = 3.4;

/**
 * Amber scan volume: three nested light cones, a travelling scan bar,
 * a ground light pool, an amber practical light and 460 dust motes.
 * Everything scales off `sceneState.beam`, so the beam only exists
 * while the scan beat is on screen.
 */
export default function ScanBeam() {
  const group = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const cone = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const line = useRef<THREE.Mesh>(null);
  const lineGlow = useRef<THREE.Mesh>(null);
  const pool = useRef<THREE.Mesh>(null);
  const lamp = useRef<THREE.PointLight>(null);
  const dust = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // denser toward the cone axis so the volume reads as a light shaft
      const r = Math.pow(Math.random(), 1.7) * 1.5;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.random() * SPAN_Y;
      arr[i * 3 + 2] = Math.sin(a) * r * 0.7;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;
    const power = sceneState.beam;
    // faint lamp flicker so the beam feels like a real emitter, not a decal
    const flicker = 0.9 + 0.1 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 17.1);
    const level = power * flicker;

    g.visible = power > 0.008;
    if (!g.visible) return;

    // sweep across the package face
    const sweep = Math.sin(t * 0.85) * 1.45;
    g.position.x += (sweep - g.position.x) * Math.min(1, delta * 2.2);

    const fade = (m: THREE.Mesh | null, base: number) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity += (base * level - mat.opacity) * 0.14;
    };

    // ── nested cones: wide halo → main shaft → hot core ──
    fade(halo.current, 0.13);
    fade(cone.current, 0.34);
    fade(core.current, 0.3);

    // ── scan bar travels down the shaft ──
    const barY = 3.1 - ((t * 0.75) % 1) * 3.0;
    if (line.current) {
      line.current.position.y = barY;
      const w = 0.5 + (1 - barY / 3.1) * PACKAGE_SIZE[0] * 0.72;
      line.current.scale.x = w;
      const mat = line.current.material as THREE.MeshBasicMaterial;
      mat.opacity += (1.0 * level - mat.opacity) * 0.2;
    }
    if (lineGlow.current) {
      lineGlow.current.position.y = barY;
      const w = 0.9 + (1 - barY / 3.1) * PACKAGE_SIZE[0] * 0.85;
      lineGlow.current.scale.x = w;
      const mat = lineGlow.current.material as THREE.MeshBasicMaterial;
      mat.opacity += (0.32 * level - mat.opacity) * 0.2;
    }

    // ── amber light pool on the table ──
    if (pool.current) {
      const mat = pool.current.material as THREE.MeshBasicMaterial;
      mat.opacity += (0.26 * level - mat.opacity) * 0.12;
      const s = 1 + Math.sin(t * 1.9) * 0.04;
      pool.current.scale.set(s, s, 1);
    }

    // ── practical amber light inside the shaft ──
    if (lamp.current) {
      lamp.current.intensity += (11 * level - lamp.current.intensity) * 0.12;
    }

    // ── dust motes falling through the light ──
    if (dust.current) {
      const mat = dust.current.material as THREE.PointsMaterial;
      mat.opacity += (1.0 * level - mat.opacity) * 0.14;
      dust.current.rotation.y = t * 0.09;
      const p = dust.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < COUNT; i++) {
        let y = p.getY(i) - delta * (0.3 + (i % 9) * 0.06);
        if (y < 0) y = SPAN_Y;
        p.setY(i, y);
      }
      p.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={[0, 0, 0.6]}>
      {/* wide halo */}
      <mesh ref={halo} position={[0, SPAN_Y / 2 + 0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[2.5, SPAN_Y, 48, 1, true]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* main shaft */}
      <mesh ref={cone} position={[0, SPAN_Y / 2 + 0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.65, SPAN_Y, 48, 1, true]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* hot core */}
      <mesh ref={core} position={[0, SPAN_Y / 2 + 0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, SPAN_Y, 28, 1, true]} />
        <meshBasicMaterial
          color="#FFEBC2"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* travelling scan bar — bright line + soft bloom behind it */}
      <mesh ref={lineGlow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.6, 0]}>
        <planeGeometry args={[1, 0.34]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={line} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.6, 0]}>
        <planeGeometry args={[1, 0.045]} />
        <meshBasicMaterial
          color="#FFF6E0"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* light pool on the steel table */}
      <mesh ref={pool} rotation={[-Math.PI / 2, 0, 0]} position={[0, TABLE_Y + 0.02, 0]}>
        <circleGeometry args={[2.1, 40]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* dust inside the shaft */}
      <points ref={dust}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#FDE68A"
          size={0.05}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* practical amber light — lifts the package while scanning */}
      <pointLight ref={lamp} position={[0, 1.4, 0.4]} color="#F59E0B" intensity={0} distance={13} decay={2} />
    </group>
  );
}
