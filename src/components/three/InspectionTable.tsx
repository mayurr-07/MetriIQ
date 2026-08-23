import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { TABLE_Y } from "@/lib/constants";
import { sceneState } from "@/lib/scrollState";
import { drawLabelFace } from "@/lib/textures";

/**
 * GEOMETRY PROOF — phone never enters the package
 *
 * Package right face worst-case during scan ≈ 2.65
 * Phone capture x = 3.55, half-width 0.68, ry ≤ 0.22
 * Closest phone edge ≈ 3.55 - 0.68*cos(0.22) ≈ 2.89
 * Clearance ≈ 0.24 units minimum
 */

const SW = 512;
const SH = 900;

/** Draws the premium inspection-app UI, using the real package label as the camera feed. */
function drawPhoneScreen(
  ctx: CanvasRenderingContext2D,
  label: HTMLCanvasElement,
  beam: number,
  hand: number,
  preview: number,
  sweep: number,
  time: number,
): void {
  const w = SW;
  const h = SH;

  // dark glass base
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#0b1018");
  bg.addColorStop(0.45, "#101820");
  bg.addColorStop(1, "#0a0e14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // status bar
  ctx.fillStyle = "rgba(8,12,20,0.94)";
  ctx.fillRect(0, 0, w, 54);
  ctx.fillStyle = "#94A3B8";
  ctx.font = "600 18px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("LM Inspect", 28, 28);
  ctx.textAlign = "right";
  ctx.fillStyle = beam > 0.08 ? "#F59E0B" : "#64748B";
  ctx.font = "600 16px 'JetBrains Mono', monospace";
  ctx.fillText(beam > 0.08 ? "LIVE" : "READY", w - 28, 28);

  // notch / sensor strip
  ctx.fillStyle = "#05070b";
  ctx.beginPath();
  ctx.roundRect(w * 0.5 - 56, 10, 112, 18, 9);
  ctx.fill();
  ctx.fillStyle = beam > 0.08 ? "#F59E0B" : "#1e293b";
  ctx.beginPath();
  ctx.arc(w * 0.5 + 34, 19, 4, 0, Math.PI * 2);
  ctx.fill();

  // main camera viewport
  const cardX = 24;
  const cardY = 72;
  const cardW = w - 48;
  const cardH = h - 196;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 22);
  ctx.clip();

  // camera feed background
  ctx.fillStyle = "#141018";
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // draw the actual food-packet label as the live camera image
  const feedPad = 18;
  const feedX = cardX + feedPad;
  const feedY = cardY + feedPad + 8;
  const feedW = cardW - feedPad * 2;
  const feedH = cardH - feedPad * 2 - 70;
  const labelAspect = label.width / label.height;
  const feedAspect = feedW / feedH;
  let dw = feedW;
  let dh = feedH;
  let dx = feedX;
  let dy = feedY;
  if (labelAspect > feedAspect) {
    dh = feedW / labelAspect;
    dy = feedY + (feedH - dh) * 0.5;
  } else {
    dw = feedH * labelAspect;
    dx = feedX + (feedW - dw) * 0.5;
  }

  // mild idle framing, then lock tighter while scanning
  const zoom = 1 + hand * 0.03 + beam * 0.08;
  const cx = dx + dw * 0.5;
  const cy = dy + dh * 0.5;
  const zdw = dw * zoom;
  const zdh = dh * zoom;

  // Live packet preview only appears once the officer has finished lifting the
  // pack (end of Step 02). Before that the camera has nothing framed yet.
  if (preview > 0.02) {
    ctx.save();
    ctx.globalAlpha = preview;
    ctx.drawImage(label, cx - zdw * 0.5, cy - zdh * 0.5, zdw, zdh);
    ctx.restore();
  } else {
    // pre-acquisition state
    ctx.fillStyle = "rgba(148,163,184,0.06)";
    ctx.fillRect(feedX, feedY, feedW, feedH);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(feedX + 12, feedY + 12, feedW - 24, feedH - 24);
    ctx.setLineDash([]);
    ctx.fillStyle = "#64748B";
    ctx.font = "600 15px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AWAITING PACKET", feedX + feedW * 0.5, feedY + feedH * 0.5);
  }

  // scan wash
  if (beam > 0.02) {
    const wash = ctx.createLinearGradient(0, feedY, 0, feedY + feedH);
    wash.addColorStop(0, `rgba(245,158,11,${0.04 + beam * 0.08})`);
    wash.addColorStop(0.5, `rgba(245,158,11,${0.1 + beam * 0.16})`);
    wash.addColorStop(1, `rgba(245,158,11,${0.03 + beam * 0.06})`);
    ctx.fillStyle = wash;
    ctx.fillRect(feedX, feedY, feedW, feedH);
  }

  // target brackets around the packet image
  const bx = cx - zdw * 0.5;
  const by = cy - zdh * 0.5;
  const bw = zdw;
  const bh = zdh;
  const drawCorner = (x: number, y: number, sx: number, sy: number) => {
    ctx.strokeStyle = beam > 0.08 ? "#FFF6E0" : "rgba(255,255,255,0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + sy * 26);
    ctx.lineTo(x, y);
    ctx.lineTo(x + sx * 26, y);
    ctx.stroke();
  };
  if (preview > 0.1) {
    drawCorner(bx - 8, by - 8, 1, 1);
    drawCorner(bx + bw + 8, by - 8, -1, 1);
    drawCorner(bx - 8, by + bh + 8, 1, -1);
    drawCorner(bx + bw + 8, by + bh + 8, -1, -1);
  }

  // bounding boxes over actual declaration regions on the packet image
  const regions = [
    { id: "MRP", nx: 0.6, ny: 0.08, nw: 0.33, nh: 0.15, tone: "#EF4444", at: 0.22 },
    { id: "MFD", nx: 0.06, ny: 0.42, nw: 0.34, nh: 0.12, tone: "#10B981", at: 0.4 },
    { id: "NET", nx: 0.06, ny: 0.66, nw: 0.42, nh: 0.13, tone: "#10B981", at: 0.55 },
    { id: "CARE", nx: 0.52, ny: 0.8, nw: 0.42, nh: 0.13, tone: "#F59E0B", at: 0.7 },
  ];
  regions.forEach((r) => {
    if (beam < r.at) return;
    const rx = bx + r.nx * bw;
    const ry = by + r.ny * bh;
    const rw = r.nw * bw;
    const rh = r.nh * bh;
    ctx.strokeStyle = r.tone;
    ctx.lineWidth = 2;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillStyle = "rgba(8,12,20,0.82)";
    ctx.fillRect(rx, ry - 18, Math.max(42, r.id.length * 10 + 16), 16);
    ctx.fillStyle = r.tone;
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(r.id, rx + 6, ry - 10);
  });

  // sweeping scan line across the packet feed
  if (beam > 0.02) {
    const lineY = by + 6 + sweep * Math.max(12, bh - 12);
    const lineGrad = ctx.createLinearGradient(bx, lineY, bx + bw, lineY);
    lineGrad.addColorStop(0, "rgba(255,246,224,0)");
    lineGrad.addColorStop(0.5, `rgba(255,246,224,${0.55 + beam * 0.4})`);
    lineGrad.addColorStop(1, "rgba(255,246,224,0)");
    ctx.fillStyle = lineGrad;
    ctx.fillRect(bx + 4, lineY - 2, bw - 8, 4);
    const glow = ctx.createLinearGradient(0, lineY - 16, 0, lineY + 16);
    glow.addColorStop(0, "rgba(245,158,11,0)");
    glow.addColorStop(0.5, `rgba(245,158,11,${0.16 + beam * 0.24})`);
    glow.addColorStop(1, "rgba(245,158,11,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(bx + 8, lineY - 16, bw - 16, 32);
  }

  // detection chips over the feed
  const chips = [
    { label: "MRP ₹120", ok: beam > 0.25 },
    { label: "NET 500 g", ok: beam > 0.4 },
    { label: "MFD 07/26", ok: beam > 0.55 },
    { label: "CARE", ok: beam > 0.7 },
  ];
  chips.forEach((chip, i) => {
    const chipW = 104;
    const cx = cardX + 18 + i * (chipW + 8);
    const cy = cardY + cardH - 44;
    ctx.fillStyle = chip.ok ? "rgba(16,185,129,0.2)" : "rgba(8,12,20,0.72)";
    ctx.strokeStyle = chip.ok ? "rgba(16,185,129,0.75)" : "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx, cy, chipW, 28, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = chip.ok ? "#6EE7B7" : "#94A3B8";
    ctx.font = "700 12px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(chip.label, cx + chipW * 0.5, cy + 14);
  });

  ctx.restore();

  // viewport border
  ctx.strokeStyle = beam > 0.08 ? "rgba(245,158,11,0.7)" : "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 22);
  ctx.stroke();

  // bottom action strip
  ctx.fillStyle = "rgba(8,12,20,0.96)";
  ctx.fillRect(0, h - 108, w, 108);
  ctx.fillStyle = beam > 0.08 ? "#F59E0B" : "#94A3B8";
  ctx.font = "700 20px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    beam > 0.08
      ? "SCANNING FOOD PACKET"
      : preview > 0.25
        ? "PACKET IN FRAME"
        : hand > 0.4
          ? "LOCKING ONTO LABEL"
          : "POINT AT PACKET",
    w * 0.5,
    h - 68,
  );

  ctx.fillStyle = "#94A3B8";
  ctx.font = "500 15px 'JetBrains Mono', monospace";
  if (beam > 0.08) {
    const pct = Math.min(99, Math.round(beam * 100 + Math.sin(time * 8) * 2));
    ctx.fillText(`LABEL FEED  ·  OPTICAL LOCK ${pct}%`, w * 0.5, h - 38);
  } else {
    ctx.fillText("CAMERA READY  ·  RULE SET PCR 2011", w * 0.5, h - 38);
  }

  // progress bar
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.roundRect(48, h - 22, w - 96, 6, 3);
  ctx.fill();
  const progress = beam > 0.02 ? beam : hand * 0.35;
  if (progress > 0.01) {
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.roundRect(48, h - 22, (w - 96) * Math.min(1, progress), 6, 3);
    ctx.fill();
  }
}

export default function InspectionTable() {
  const lamp = useRef<THREE.PointLight>(null);
  const phone = useRef<THREE.Group>(null);
  const screenMesh = useRef<THREE.Mesh>(null);
  const glassShine = useRef<THREE.Mesh>(null);
  const statusLed = useRef<THREE.Mesh>(null);
  const flash = useRef<THREE.Mesh>(null);
  const sweep = useRef(0);

  const screen = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SW;
    canvas.height = SH;
    const ctx = canvas.getContext("2d");
    const label = drawLabelFace();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    if (ctx) drawPhoneScreen(ctx, label, 0, 0, 0, 0, 0);
    texture.needsUpdate = true;
    return { canvas, ctx, texture, label };
  }, []);

  useEffect(() => () => {
    screen.texture.dispose();
  }, [screen]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    if (lamp.current) lamp.current.intensity = 8 + Math.sin(t * 3.1) * 0.16;

    const dev = phone.current;
    if (!dev) return;

    const hand = sceneState.hand;
    const beam = sceneState.beam;
    const engage = THREE.MathUtils.smoothstep(hand, 0.15, 0.85);
    const k = 1 - Math.exp(-6.5 * dt);

    // Rest: screen faces the viewer. Capture: slight yaw toward package
    // while keeping the display readable to the camera.
    const rest = { x: 3.55, y: TABLE_Y + 1.2, z: 2.35, rx: 0.04, ry: -0.28, rz: 0.01 };
    const capture = {
      x: 3.55 + sceneState.pkg[0] * 0.1,
      y: TABLE_Y + 1.24 + (sceneState.pkg[1] - 0.15) * 0.12,
      z: 1.95 + sceneState.pkg[2] * 0.12,
      rx: -0.02,
      ry: 0.18,
      rz: -0.01,
    };

    dev.position.x += (THREE.MathUtils.lerp(rest.x, capture.x, engage) - dev.position.x) * k;
    dev.position.y += (THREE.MathUtils.lerp(rest.y, capture.y, engage) - dev.position.y) * k;
    dev.position.z += (THREE.MathUtils.lerp(rest.z, capture.z, engage) - dev.position.z) * k;
    dev.rotation.x += (THREE.MathUtils.lerp(rest.rx, capture.rx, engage) - dev.rotation.x) * k;
    dev.rotation.y += (THREE.MathUtils.lerp(rest.ry, capture.ry, engage) - dev.rotation.y) * k;
    dev.rotation.z += (THREE.MathUtils.lerp(rest.rz, capture.rz, engage) - dev.rotation.z) * k;

    // Real packet preview switches on as Step 02 completes (hand fully gripped,
    // pack lifted) and stays on through the scan beat.
    const preview = Math.max(
      THREE.MathUtils.smoothstep(hand, 0.82, 0.99),
      THREE.MathUtils.smoothstep(beam, 0.02, 0.2),
    );

    // screen content — real package label feed + scan overlays
    sweep.current = (sweep.current + dt * (0.35 + beam * 0.9)) % 1;
    if (screen.ctx) {
      drawPhoneScreen(screen.ctx, screen.label, beam, hand, preview, sweep.current, t);
      screen.texture.needsUpdate = true;
    }

    if (screenMesh.current) {
      const mat = screenMesh.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.35 + beam * 1.25 + Math.sin(t * 3.5) * 0.04;
    }
    if (glassShine.current) {
      const mat = glassShine.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + beam * 0.08 + Math.sin(t * 2.2) * 0.01;
    }
    if (statusLed.current) {
      const mat = statusLed.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.45 + beam * 1.1 + Math.sin(t * 8) * 0.12;
      mat.color.set(beam > 0.08 ? "#F59E0B" : "#10B0FF");
      mat.emissive.set(beam > 0.08 ? "#F59E0B" : "#10B0FF");
    }
    if (flash.current) {
      const mat = flash.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = beam > 0.08 ? 1.4 + Math.sin(t * 14) * 0.35 : 0.15;
    }
  });

  return (
    <group>
      {/* table top */}
      <mesh position={[0, TABLE_Y - 0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[46, 30]} />
        <meshStandardMaterial color="#22232a" roughness={0.62} metalness={0.34} envMapIntensity={0.7} />
      </mesh>

      {/* brushed-steel seams */}
      {[-6.5, -2.2, 2.2, 6.5].map((x) => (
        <mesh key={x} position={[x, TABLE_Y - 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.02, 30]} />
          <meshBasicMaterial color="rgba(255,255,255,0.05)" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* backdrop wall */}
      <mesh position={[0, 6, -13]}>
        <planeGeometry args={[60, 34]} />
        <meshStandardMaterial color="#0d121c" roughness={1} metalness={0} />
      </mesh>

      {/* desk lamp */}
      <group position={[-4.4, TABLE_Y, 1.9]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.7, 0.12, 28]} />
          <meshStandardMaterial color="#15171c" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.17, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.26, 0.1, 20]} />
          <meshStandardMaterial color="#1b1e25" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.055, 2.4, 12]} />
          <meshStandardMaterial color="#1b1e25" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 2.42, 0]} castShadow>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color="#20242c" roughness={0.42} metalness={0.7} />
        </mesh>
        <mesh position={[0.31, 2.55, 0]} rotation={[0, 0, -1.147]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.7, 12]} />
          <meshStandardMaterial color="#1b1e25" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0.62, 2.68, 0]} castShadow>
          <sphereGeometry args={[0.11, 16, 12]} />
          <meshStandardMaterial color="#20242c" roughness={0.42} metalness={0.7} />
        </mesh>
        <group position={[0.62, 2.68, 0]} rotation={[0, 0, 0.5]}>
          <mesh castShadow>
            <coneGeometry args={[0.55, 0.8, 26, 1, true]} />
            <meshStandardMaterial color="#20242c" roughness={0.45} metalness={0.55} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 14]} />
            <meshStandardMaterial color="#1b1e25" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.16, 18, 14]} />
            <meshStandardMaterial color="#fff3d6" emissive="#F59E0B" emissiveIntensity={2.4} roughness={0.3} />
          </mesh>
        </group>
        <pointLight ref={lamp} position={[0.85, 2.3, 0.2]} color="#ffd79a" intensity={8} distance={16} decay={2} />
      </group>

      {/* premium cradle */}
      <group position={[3.55, TABLE_Y, 2.35]}>
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[1.2, 0.08, 0.78]} />
          <meshStandardMaterial color="#171d28" roughness={0.45} metalness={0.62} />
        </mesh>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.92, 0.05, 0.34]} />
          <meshStandardMaterial color="#232b38" roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.14, -0.28]} rotation={[0.55, 0, 0]} castShadow>
          <boxGeometry args={[0.78, 0.04, 0.18]} />
          <meshStandardMaterial color="#2a3342" roughness={0.4} metalness={0.65} />
        </mesh>
      </group>

      {/* ═══ premium smartphone ═══ */}
      <group ref={phone} position={[3.55, TABLE_Y + 1.2, 2.35]} rotation={[0.04, -0.28, 0.01]}>
        {/* titanium chassis */}
        <RoundedBox args={[1.36, 2.34, 0.14]} radius={0.11} smoothness={8} castShadow>
          <meshStandardMaterial color="#4a5568" roughness={0.28} metalness={0.82} envMapIntensity={1.35} />
        </RoundedBox>

        {/* antenna lines */}
        {[-0.92, 0.92].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[1.34, 0.012, 0.142]} />
            <meshStandardMaterial color="#2b3340" roughness={0.5} metalness={0.4} />
          </mesh>
        ))}

        {/* back glass */}
        <mesh position={[0, 0, -0.078]} castShadow>
          <planeGeometry args={[1.24, 2.2]} />
          <meshPhysicalMaterial
            color="#121821"
            roughness={0.18}
            metalness={0.35}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
            envMapIntensity={1.1}
          />
        </mesh>

        {/* camera island */}
        <RoundedBox args={[0.7, 0.7, 0.07]} radius={0.12} smoothness={6} position={[-0.22, 0.78, -0.12]} castShadow>
          <meshStandardMaterial color="#0f141c" roughness={0.22} metalness={0.75} envMapIntensity={1.2} />
        </RoundedBox>
        {[
          [-0.36, 0.92],
          [-0.08, 0.92],
          [-0.36, 0.64],
        ].map(([lx, ly], i) => (
          <group key={`lens-${i}`} position={[lx, ly, -0.16]}>
            <mesh>
              <cylinderGeometry args={[0.105, 0.105, 0.03, 24]} />
              <meshStandardMaterial color="#090c11" roughness={0.08} metalness={0.45} />
            </mesh>
            <mesh position={[0, 0, -0.012]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.07, 24]} />
              <meshPhysicalMaterial color="#0a1020" roughness={0.05} metalness={0.2} transmission={0.15} thickness={0.2} />
            </mesh>
            <mesh position={[0, 0, -0.018]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.078, 0.095, 24]} />
              <meshStandardMaterial color="#3a4558" roughness={0.25} metalness={0.85} />
            </mesh>
          </group>
        ))}
        {/* flash + mic */}
        <mesh ref={flash} position={[-0.08, 0.64, -0.155]}>
          <circleGeometry args={[0.035, 16]} />
          <meshStandardMaterial color="#f5f0e6" emissive="#F59E0B" emissiveIntensity={0.15} roughness={0.25} />
        </mesh>
        <mesh position={[-0.08, 0.55, -0.155]}>
          <circleGeometry args={[0.015, 10]} />
          <meshStandardMaterial color="#1a2030" roughness={0.4} />
        </mesh>

        {/* side buttons */}
        <mesh position={[0.72, 0.42, 0]} castShadow>
          <boxGeometry args={[0.03, 0.18, 0.045]} />
          <meshStandardMaterial color="#9aa6b5" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[0.72, 0.12, 0]} castShadow>
          <boxGeometry args={[0.03, 0.28, 0.045]} />
          <meshStandardMaterial color="#9aa6b5" roughness={0.35} metalness={0.8} />
        </mesh>
        <mesh position={[-0.72, 0.28, 0]} castShadow>
          <boxGeometry args={[0.03, 0.2, 0.045]} />
          <meshStandardMaterial color="#9aa6b5" roughness={0.35} metalness={0.8} />
        </mesh>

        {/* bottom speaker + USB-C */}
        <mesh position={[0, -1.16, 0.02]}>
          <boxGeometry args={[0.28, 0.035, 0.03]} />
          <meshStandardMaterial color="#1b2230" roughness={0.3} metalness={0.65} />
        </mesh>
        {[-0.42, -0.34, -0.26, 0.26, 0.34, 0.42].map((x) => (
          <mesh key={x} position={[x, -1.16, 0.05]}>
            <circleGeometry args={[0.012, 8]} />
            <meshStandardMaterial color="#121820" roughness={0.4} />
          </mesh>
        ))}

        {/* front glass bezel */}
        <mesh position={[0, 0, 0.078]}>
          <planeGeometry args={[1.28, 2.22]} />
          <meshPhysicalMaterial
            color="#070a0f"
            roughness={0.08}
            metalness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.25}
          />
        </mesh>

        {/* active display — CanvasTexture UI */}
        <mesh ref={screenMesh} position={[0, -0.02, 0.084]}>
          <planeGeometry args={[1.18, 2.05]} />
          <meshStandardMaterial
            map={screen.texture}
            emissiveMap={screen.texture}
            emissive="#ffffff"
            emissiveIntensity={0.55}
            roughness={0.25}
            metalness={0.05}
            toneMapped={false}
          />
        </mesh>

        {/* glass specular sheen */}
        <mesh ref={glassShine} position={[0.18, 0.35, 0.086]} rotation={[0, 0, -0.35]}>
          <planeGeometry args={[0.42, 1.1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* dynamic island */}
        <mesh position={[0, 1.0, 0.086]}>
          <planeGeometry args={[0.42, 0.09]} />
          <meshStandardMaterial color="#05070b" roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh ref={statusLed} position={[0.14, 1.0, 0.088]}>
          <circleGeometry args={[0.018, 14]} />
          <meshStandardMaterial color="#10B0FF" emissive="#10B0FF" emissiveIntensity={0.45} roughness={0.15} />
        </mesh>

        {/* home indicator */}
        <mesh position={[0, -1.02, 0.086]}>
          <planeGeometry args={[0.34, 0.03]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
