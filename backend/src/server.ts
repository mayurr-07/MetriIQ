import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { connectDB } from "./lib/db.js";
import { initMinio } from "./lib/minio.js";
import { User } from "./models/User.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/uploads.js";
import inspectionRoutes from "./routes/inspections.js";
import complaintRoutes from "./routes/complaints.js";
import analyticsRoutes from "./routes/analytics.js";
import rulesRoutes from "./routes/rules.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/api/auth",        authRoutes);
app.use("/api/uploads",     uploadRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/complaints",  complaintRoutes);
app.use("/api/analytics",   analyticsRoutes);
app.use("/api/rules",       rulesRoutes);

// ── Global error handler ──────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[error]", err.message);
  const status = (err as { status?: number }).status ?? 500;
  res.status(status).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ── Demo seed (idempotent — skips existing accounts) ─────────────────────────

async function seedDemoUsers() {
  const DEMO = [
    { name: "Priya Sharma",  email: "officer@legalmetrology.dev",  password: "officer123",  role: "officer"  as const, district: "Mumbai Suburban" },
    { name: "Vikram Desai",  email: "admin@legalmetrology.dev",    password: "admin123",    role: "admin"    as const, district: "Mumbai" },
    { name: "Anita Kulkarni",email: "senior@legalmetrology.dev",   password: "senior123",   role: "senior"   as const, district: "Maharashtra" },
    { name: "Rahul Mehta",   email: "consumer@legalmetrology.dev", password: "consumer123", role: "consumer" as const, district: "Pune" },
  ];
  for (const u of DEMO) {
    const exists = await User.findOne({ email: u.email });
    if (exists) continue;
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, passwordHash });
    console.log(`[seed] Created demo user: ${u.email}`);
  }
}

// ── Startup ───────────────────────────────────────────────────────────────────

async function start() {
  await connectDB();
  await initMinio();
  await seedDemoUsers();
  app.listen(PORT, () =>
    console.log(`[server] MetriIQ API running on http://localhost:${PORT}`)
  );
}

start().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
