import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import PackageModel from "./PackageModel";
import ScanBeam from "./ScanBeam";
import BoundingBox from "./BoundingBox";
import InspectionTable from "./InspectionTable";
import RecordNodes from "./RecordNodes";
import { DECLARATIONS } from "@/lib/constants";
import { sceneState } from "@/lib/scrollState";

const STATUS_COLOR: Record<string, string> = {
  pass: "#10B981",
  review: "#F59E0B",
  issue: "#EF4444",
};

function CameraRig() {
  const target = useRef(new THREE.Vector3(0, 0.15, 0));
  const size = useThree((s) => s.size);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame(({ camera }, delta) => {
    const k = 1 - Math.pow(0.0025, delta);
    const w = size.width;
    const narrow = w < 900;
    // Graduated pull-back: the smaller the viewport, the further the camera
    // retreats so the package always fits beside the copy.
    const zScale = w < 420 ? 1.62 : w < 640 ? 1.48 : w < 900 ? 1.34 : 1;
    // On phones the copy sits low, so the whole view shifts up to keep the
    // package in the upper third of the frame.
    const yLift = w < 420 ? -1.5 : w < 640 ? -1.38 : narrow ? -1.25 : 0;

    // Parallax is a desktop pointer affordance; on touch it would drift the
    // framing every time the user swipes, so it is disabled on narrow screens.
    const par = narrow ? 0 : 1;
    const wantX = sceneState.cam[0] + pointer.current.x * 0.22 * par;
    const wantY = sceneState.cam[1] + pointer.current.y * 0.12 * par + yLift;
    const wantZ = sceneState.cam[2] * zScale;

    camera.position.x += (wantX - camera.position.x) * k;
    camera.position.y += (wantY - camera.position.y) * k;
    camera.position.z += (wantZ - camera.position.z) * k;

    const tx = narrow ? 0 : sceneState.target[0];
    const ty = sceneState.target[1] + yLift;
    const tz = sceneState.target[2];
    target.current.x += (tx - target.current.x) * k;
    target.current.y += (ty - target.current.y) * k;
    target.current.z += (tz - target.current.z) * k;
    camera.lookAt(target.current);
  });

  useFrame(({ pointer: p }) => {
    pointer.current.x += (p.x - pointer.current.x) * 0.05;
    pointer.current.y += (p.y - pointer.current.y) * 0.05;
  });

  return null;
}

/** The AI layer: one bounding box per mandatory declaration. */
function BoundingBoxes() {
  return (
    <>
      {DECLARATIONS.map((d, i) => (
        <BoundingBox
          key={d.id}
          stagger={i}
          rect={d.box}
          label={d.label}
          value={d.value}
          color={STATUS_COLOR[d.status] ?? "#F59E0B"}
          anchor={d.side === "left" ? "left" : "right"}
        />
      ))}
    </>
  );
}

/** Warm bloom on the amber practicals — skipped on small screens to keep frames high. */
function Effects() {
  const width = useThree((s) => s.size.width);
  if (width < 900) return null;
  return (
    <EffectComposer>
      <Bloom mipmapBlur intensity={0.58} luminanceThreshold={0.68} luminanceSmoothing={0.3} />
    </EffectComposer>
  );
}

export default function InspectionScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ touchAction: "pan-y" }}
      // Cap resolution on small/low-power devices to protect frame-rate.
      dpr={typeof window !== "undefined" && window.innerWidth < 900 ? [1, 1.4] : [1, 1.75]}
      shadows
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0.1, 1.0, 10.2], fov: 34, near: 0.1, far: 120 }}
    >
      <color attach="background" args={["#080C14"]} />
      <fog attach="fog" args={["#080C14", 14, 40]} />

      {/* Studio lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[-3, 4, 3]}
        intensity={2.4}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      >
        <orthographicCamera attach="shadow-camera" args={[-8, 8, 8, -8, 0.1, 40]} />
      </directionalLight>
      <spotLight position={[3, 2, -2]} angle={0.6} penumbra={1} intensity={18} color="#F59E0B" />
      <pointLight position={[0, -1, 5]} intensity={2.2} color="#cbd5e1" />
      <pointLight position={[-2.5, 2.5, 4]} intensity={1.1} color="#93c5fd" />

      <Suspense fallback={null}>
        <InspectionTable />
        <PackageModel>
          <BoundingBoxes />
        </PackageModel>
        <ScanBeam />
        <RecordNodes />

        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.6} position={[-3, 3, 4]} scale={[6, 6, 1]} color="#ffffff" />
          <Lightformer intensity={1.4} position={[4, 1.5, 2]} scale={[4, 4, 1]} color="#ffd9a3" />
          <Lightformer intensity={0.8} position={[0, -2, 3]} scale={[8, 3, 1]} color="#8fa3bf" />
          <Lightformer
            form="ring"
            intensity={1.1}
            position={[2.5, 2.5, -3]}
            scale={[3, 3, 1]}
            color="#F59E0B"
          />
        </Environment>

        <Effects />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
