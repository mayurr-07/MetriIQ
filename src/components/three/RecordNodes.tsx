import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/scrollState";

const NODES: Array<{ pos: [number, number, number]; delay: number }> = [
  { pos: [0.4, 0.6, -1.2], delay: 0.0 },
  { pos: [1.9, 1.5, -2.6], delay: 0.22 },
  { pos: [-1.2, 2.1, -2.2], delay: 0.38 },
  { pos: [2.9, -0.4, -1.6], delay: 0.5 },
  { pos: [-2.6, 0.4, -3.0], delay: 0.6 },
  { pos: [0.2, 2.9, -3.4], delay: 0.7 },
  { pos: [-1.6, -1.0, -2.4], delay: 0.78 },
  { pos: [2.2, 2.6, -3.6], delay: 0.86 },
];

/** Department system graph — one inspection record becomes many. */
export default function RecordNodes() {
  const root = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const pts: number[] = [];
    const origin = new THREE.Vector3(0, 0.15, 0.9);
    NODES.forEach((n) => {
      const v = new THREE.Vector3(...n.pos);
      pts.push(origin.x, origin.y, origin.z, v.x, v.y, v.z);
    });
    return new Float32Array(pts);
  }, []);

  useFrame((state, delta) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.02, delta);
    g.rotation.z = Math.sin(t * 0.08) * 0.02;
    g.children.forEach((child, i) => {
      const node = NODES[i];
      if (!node) return;
      const target = Math.max(0, Math.min(1, (sceneState.nodes - node.delay) * 3.2));
      const mesh = child as THREE.Group;
      const dot = mesh.children[0] as THREE.Mesh | undefined;
      const ring = mesh.children[1] as THREE.Mesh | undefined;
      if (dot) {
        const mat = dot.material as THREE.MeshBasicMaterial;
        mat.opacity += (0.95 * target - mat.opacity) * k;
        dot.scale.setScalar(0.6 + target * 0.4);
      }
      if (ring) {
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity += (0.28 * target - mat.opacity) * k;
        ring.rotation.z = t * 0.4 + i;
      }
    });
    const line = g.children[g.children.length - 1] as THREE.LineSegments | undefined;
    if (line) {
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity += (0.2 * sceneState.nodes - mat.opacity) * k;
    }
  });

  return (
    <group ref={root}>
      {NODES.map((n, i) => (
        <group key={i} position={n.pos}>
          <mesh>
            <sphereGeometry args={[0.075, 14, 12]} />
            <meshBasicMaterial color="#F59E0B" transparent opacity={0} />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[0.2, 0.225, 28]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#F59E0B" transparent opacity={0} depthWrite={false} />
      </lineSegments>
    </group>
  );
}
