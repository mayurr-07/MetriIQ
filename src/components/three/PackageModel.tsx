import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";
import { PACKAGE_SIZE } from "@/lib/constants";
import { sceneState } from "@/lib/scrollState";
import { labelTexture, plainTexture } from "@/lib/textures";

const [W, H, D] = PACKAGE_SIZE;

export type PackageModelProps = {
  children?: React.ReactNode;
};

export default function PackageModel({ children }: PackageModelProps) {
  const group = useRef<THREE.Group>(null);
  const highlight = useRef<THREE.Mesh>(null);
  const seam = useRef<THREE.Mesh>(null);
  const [fontTick, setFontTick] = useState(0);

  useEffect(() => {
    let alive = true;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (alive) setFontTick((v) => v + 1);
      });
    }
    return () => {
      alive = false;
    };
  }, []);

  const materials = useMemo(() => {
    const side = plainTexture("side");
    const top = plainTexture("top");
    const face = labelTexture();
    const mk = (map: THREE.Texture): THREE.MeshStandardMaterial =>
      new THREE.MeshStandardMaterial({
        map,
        color: "#ffffff",
        roughness: 0.88,
        metalness: 0.06,
        envMapIntensity: 0.9,
      });
    const mats = [
      mk(side),
      mk(side),
      mk(top),
      mk(side),
      mk(face),
      mk(side),
    ];
    return {
      mats,
      dispose: () => {
        mats.forEach((m) => m.dispose());
        side.dispose();
        top.dispose();
        face.dispose();
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontTick]);

  useEffect(() => {
    return () => {
      materials.dispose();
    };
  }, [materials]);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.pow(0.0016, delta);
    g.position.x += (sceneState.pkg[0] - g.position.x) * k;
    g.position.y += (sceneState.pkg[1] - g.position.y) * k;
    g.position.z += (sceneState.pkg[2] - g.position.z) * k;
    g.rotation.x += (sceneState.rot[0] - g.rotation.x) * k;
    g.rotation.y += (sceneState.rot[1] - g.rotation.y) * k;
    g.rotation.z += (sceneState.rot[2] - g.rotation.z) * k;

    if (highlight.current) {
      const mat = highlight.current.material as THREE.MeshBasicMaterial;
      const target = sceneState.focus;
      mat.opacity += (target * 0.34 - mat.opacity) * k;
      highlight.current.visible = mat.opacity > 0.005;
    }
    if (seam.current) {
      const mat = seam.current.material as THREE.MeshBasicMaterial;
      mat.opacity += (0.5 - mat.opacity) * 0.1;
    }
  });

  return (
    <group ref={group} position={[0, 0.15, 0]} rotation={[0, -0.3, 0]}>
      <mesh castShadow receiveShadow material={materials.mats}>
        <boxGeometry args={[W, H, D]} />
        <Edges scale={1.0} threshold={15} color="#4a3722" />
      </mesh>

      {/* top flap seam */}
      <mesh ref={seam} position={[0, H / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.98, 0.035]} />
        <meshBasicMaterial color="#6b5236" transparent opacity={0.5} />
      </mesh>

      {/* flagged region overlay over the MRP declaration */}
      <mesh ref={highlight} position={[W * 0.265, H * 0.345, D / 2 + 0.012]}>
        <planeGeometry args={[W * 0.33, H * 0.15]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0} depthWrite={false} />
      </mesh>

      {children}

      {/* contact shadow softener */}
      <mesh position={[0, -H / 2 - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 1.5, D * 2.4]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.42} depthWrite={false} />
      </mesh>
    </group>
  );
}
