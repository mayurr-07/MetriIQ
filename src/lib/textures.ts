import * as THREE from "three";

const W = 1024;
const H = 700;

const PAPER = "#c4a882";
const PAPER_DARK = "#a98d68";
const INK = "#221c14";

function paperBase(ctx: CanvasRenderingContext2D): void {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#cdb18f");
  g.addColorStop(0.5, PAPER);
  g.addColorStop(1, "#b99c78");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // paper fibre
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const len = 2 + Math.random() * 10;
    ctx.strokeStyle = Math.random() > 0.5 ? "#ffffff" : "#5c4630";
    ctx.lineWidth = Math.random() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.restore();

  // soft vignette / print shading
  const v = ctx.createRadialGradient(W * 0.5, H * 0.42, H * 0.2, W * 0.5, H * 0.5, W * 0.72);
  v.addColorStop(0, "rgba(255,255,255,0.10)");
  v.addColorStop(1, "rgba(60,42,24,0.22)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function frame(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "rgba(40,28,16,0.55)";
  ctx.lineWidth = 5;
  ctx.strokeRect(26, 22, W - 52, H - 46);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(38, 34, W - 76, H - 70);
}

function vegMark(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const s = 34;
  ctx.strokeStyle = "#1d6b3f";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, s, s);
  ctx.fillStyle = "#1d6b3f";
  ctx.beginPath();
  ctx.arc(x + s / 2, y + s / 2, s * 0.26, 0, Math.PI * 2);
  ctx.fill();
}

function barcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = INK;
  let cx = x;
  while (cx < x + w) {
    const bw = 1 + Math.random() * 4;
    if (Math.random() > 0.35) ctx.fillRect(cx, y, bw, h);
    cx += bw + 1 + Math.random() * 3;
  }
}

/** Deterministic pseudo-random so the printed chips look the same on every reload. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** One golden, salted potato chip drawn in Canvas 2D. */
function drawChip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  seed: number,
): void {
  const rand = seeded(seed);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  // subtle drop shadow anchoring the chip to the label
  ctx.save();
  ctx.translate(3, 5);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 1.05, ry * 1.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(60,42,24,0.22)";
  ctx.filter = "blur(4px)";
  ctx.fill();
  ctx.restore();

  // wavy chip outline (two frequencies gives it a real "kettle-cooked" edge)
  const steps = 44;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const wave = 1 + Math.sin(t * 3 + seed) * 0.09 + Math.sin(t * 7 + seed) * 0.035;
    const x = Math.cos(t) * rx * wave;
    const y = Math.sin(t) * ry * wave;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  // golden fried fill
  const grad = ctx.createRadialGradient(-rx * 0.25, -ry * 0.3, rx * 0.1, 0, 0, rx * 1.15);
  grad.addColorStop(0, "#fbe08a");
  grad.addColorStop(0.55, "#e2a24d");
  grad.addColorStop(1, "#8f4f16");
  ctx.fillStyle = grad;
  ctx.fill();

  // crisp edge
  ctx.strokeStyle = "rgba(74,42,12,0.7)";
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // top-left highlight (studio light)
  ctx.beginPath();
  ctx.ellipse(-rx * 0.2, -ry * 0.3, rx * 0.45, ry * 0.28, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,244,206,0.32)";
  ctx.fill();

  // fried texture spots
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * rx * 0.72;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d * (ry / rx), 1 + rand() * 2.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(84,46,14,${0.22 + rand() * 0.28})`;
    ctx.fill();
  }

  // salt crystals
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * rx * 0.6;
    const px = Math.cos(a) * d;
    const py = Math.sin(a) * d * (ry / rx);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(px - 0.9, py - 0.9, 1.9, 1.9);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(px - 1.6, py - 1.6, 3.2, 3.2);
  }

  ctx.restore();
}

/**
 * A cluster of five overlapping chips with scattered salt and crumbs.
 * Total footprint is kept to roughly ±100px horizontally and ±90px
 * vertically around (cx, cy) so callers can fit it into a known-clear gap.
 */
function drawChipCluster(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const rand = seeded(9911);

  // background crumbs
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.arc(
      cx - 95 + rand() * 190,
      cy - 78 + rand() * 156,
      1 + rand() * 2.2,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = `rgba(160,110,45,${0.35 + rand() * 0.35})`;
    ctx.fill();
  }
  // scattered salt
  for (let i = 0; i < 22; i++) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(cx - 100 + rand() * 200, cy - 82 + rand() * 164, 1.4, 1.4);
  }

  // five chips — deterministic placement, compact cluster
  drawChip(ctx, cx - 66, cy + 16, 36, 26, -0.55, 101);
  drawChip(ctx, cx + 13, cy - 14, 44, 31, 0.18, 202);
  drawChip(ctx, cx + 76, cy + 18, 34, 25, 0.75, 303);
  drawChip(ctx, cx - 26, cy + 40, 27, 20, 1.2, 404);
  drawChip(ctx, cx + 50, cy - 39, 25, 18, -0.32, 505);
}

/** Front label of the food package — pure Canvas 2D, no external assets. */
export function drawLabelFace(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  paperBase(ctx);
  frame(ctx);

  // ── Brand band ─────────────────────────────────────────  y 34–92
  ctx.fillStyle = "#7b1e2b";
  ctx.fillRect(38, 34, W - 76, 58);
  ctx.fillStyle = "#f7f0e2";
  ctx.font = "700 34px Inter, 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("SHUDH AHAAR", 62, 64);
  // Kept short and left of x≈583 so it never reaches the MRP box (starts x=610.4).
  ctx.font = "500 17px Inter, Arial, sans-serif";
  ctx.fillStyle = "rgba(247,240,226,0.82)";
  ctx.fillText("LEGAL METROLOGY TEST PACK", 340, 65);

  // ── Product title & subtitle (left column) ─────────────  y 118–192
  ctx.fillStyle = INK;
  ctx.font = "700 48px 'Playfair Display', Georgia, serif";
  ctx.fillText("Classic Salted", 62, 148);
  ctx.font = "400 22px Inter, Arial, sans-serif";
  ctx.fillStyle = "#4a3a26";
  // Shortened so the line ends well clear of the MRP box (starts x=610.4).
  ctx.fillText("Crispy Potato Chips  ·  Sunflower Oil", 62, 186);

  // ── Vegetarian mark ── sits in the clear gap between the title and the
  // MRP box (x 431–610, y 92–165) so it never sits under the price panel.
  vegMark(ctx, 520, 98);

  // ── Chip photography cluster ── placed below the header row and above
  // the legal rail, clear of the MRP box (ends y 165) and the legal rail
  // (starts y ≈390): safe vertical band is y 202–358 for this x range.
  drawChipCluster(ctx, 750, 280);

  // ── MRP block ── declaration, top-right ─────────────────
  // Rect matches the normalised box in constants.ts (x 0.6 w 0.33 y 0.08 h 0.15)
  // exactly, so the 3D bounding-box overlay lands flush on the printed panel.
  const mrpX = 0.6 * W;
  const mrpY = 0.08 * H;
  const mrpW = 0.33 * W;
  const mrpH = 0.15 * H;
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  ctx.fillRect(mrpX, mrpY, mrpW, mrpH);
  ctx.strokeStyle = "rgba(34,28,20,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(mrpX, mrpY, mrpW, mrpH);
  ctx.fillStyle = INK;
  ctx.font = "700 26px Inter, Arial, sans-serif";
  ctx.fillText("MRP", mrpX + 12, mrpY + 32);
  ctx.font = "800 72px Inter, Arial, sans-serif";
  ctx.fillText("₹120", mrpX + 86, mrpY + 46);
  ctx.font = "500 17px Inter, Arial, sans-serif";
  ctx.fillStyle = "#4a3a26";
  ctx.fillText("(incl. of all taxes)", mrpX + 14, mrpY + 88);

  // ── MFD block ── declaration, centre-left ───────  y 294–378
  const mfdY = 0.42 * H;
  ctx.fillStyle = INK;
  ctx.font = "700 25px Inter, Arial, sans-serif";
  ctx.fillText("MFD  07 / 26", 62, mfdY + 18);
  ctx.font = "500 18px Inter, Arial, sans-serif";
  ctx.fillStyle = "#4a3a26";
  ctx.fillText("BEST BEFORE: 04 MONTHS FROM MFG", 62, mfdY + 46);
  ctx.fillText("BATCH NO. CP-2607-A19", 62, mfdY + 70);

  // ── Legal & nutritional rail ── below MFD, above Net Qty ── y 396–458
  // Three tightly-set lines, kept to the left column so the barcode on the
  // right has its own gutter. No y-value collides with any declaration.
  const legalY = 396;
  ctx.font = "500 15px Inter, Arial, sans-serif";
  ctx.fillStyle = "#3c2f20";
  ctx.fillText(
    "MKT BY: Shudh Ahaar Foods Pvt. Ltd., Plot 14, Jaipur (Raj.) 302013",
    62,
    legalY,
  );
  ctx.fillText(
    "FSSAI 10019043001123  ·  CIN U15100RJ2014PTC045112",
    62,
    legalY + 22,
  );
  ctx.fillText(
    "Nutrition per 100 g: Energy 512 kcal · Fat 32 g · Carb 55 g · Protein 6 g",
    62,
    legalY + 44,
  );

  // ── Barcode ── right of the legal rail, well clear of every declaration
  barcode(ctx, 782, 392, 165, 50);
  ctx.fillStyle = "#3c2f20";
  ctx.font = "500 12px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("8 901234 567890", 864, 456);
  ctx.textAlign = "left";

  // ── Net Quantity block ── declaration, bottom-left ──
  // x/w match the normalised box in constants.ts (x 0.06 w 0.42) exactly.
  const nqX = 0.06 * W;
  const nqY = 0.66 * H;
  const nqW = 0.42 * W;
  ctx.fillStyle = "#1c2b1f";
  ctx.fillRect(nqX, nqY, nqW, H * 0.13);
  ctx.fillStyle = "#e9f0e6";
  ctx.font = "700 22px Inter, Arial, sans-serif";
  ctx.fillText("NET QUANTITY", nqX + 18, nqY + 26);
  ctx.font = "800 44px Inter, Arial, sans-serif";
  ctx.fillText("500 g", nqX + 18, nqY + 62);
  ctx.font = "500 16px Inter, Arial, sans-serif";
  ctx.fillStyle = "rgba(233,240,230,0.75)";
  ctx.fillText("When packed. Store in a cool, dry place.", nqX + 208, nqY + 62);

  // ── Customer Care block ── declaration, bottom-right ──
  const ccX = 0.52 * W;
  const ccY = 0.8 * H;
  ctx.strokeStyle = "rgba(34,28,20,0.45)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ccX, ccY, W * 0.42, H * 0.13);
  ctx.fillStyle = INK;
  ctx.font = "700 21px Inter, Arial, sans-serif";
  ctx.fillText("CUSTOMER CARE", ccX + 16, ccY + 26);
  ctx.font = "600 27px 'JetBrains Mono', monospace";
  ctx.fillText("1800-266-XXXX", ccX + 16, ccY + 58);
  ctx.font = "500 16px Inter, Arial, sans-serif";
  ctx.fillStyle = "#4a3a26";
  ctx.fillText("care@shudhahaar.example  ·  Mon–Sat 10:00–18:00", ccX + 16, ccY + 84);

  // print sheen
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, "rgba(255,255,255,0.06)");
  sheen.addColorStop(0.45, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(0,0,0,0.06)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  return canvas;
}

/** Plain cardboard side / back / top faces. */
export function drawPlainFace(tone: "side" | "top" = "side"): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  const g = ctx.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, tone === "top" ? "#bb9f7c" : "#b1895f");
  g.addColorStop(1, tone === "top" ? "#a98d68" : PAPER_DARK);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 900; i++) {
    ctx.strokeStyle = Math.random() > 0.5 ? "#fff" : "#4b3620";
    ctx.lineWidth = Math.random() * 1.4;
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.random() * 12, y + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(40,28,16,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 476);
  return c;
}

export function labelTexture(): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(drawLabelFace());
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function plainTexture(tone: "side" | "top" = "side"): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(drawPlainFace(tone));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Transparent caption chip used by the 3D bounding boxes. */
export function tagTexture(text: string, accent: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(c);
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = "rgba(8, 12, 20, 0.82)";
  ctx.fillRect(0, 30, 512, 68);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 30, 6, 68);
  ctx.fillStyle = "#f0f2f5";
  ctx.font = "600 40px 'JetBrains Mono', monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), 24, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Data-URL crop of the flagged MRP region, used inside the evidence panel. */
export function mrpCropDataUrl(): string {
  const src = drawLabelFace();
  const c = document.createElement("canvas");
  c.width = 460;
  c.height = 220;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(src, 0.56 * W, 0.03 * H, 0.42 * W, 0.2 * H, 0, 0, 460, 220);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 10]);
  ctx.strokeRect(6, 6, 448, 208);
  return c.toDataURL("image/png");
}
