import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { initMinio } from "./lib/minio.js";
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

// ── Startup ───────────────────────────────────────────────────────────────────

async function start() {
  await connectDB();
  await initMinio();
  app.listen(PORT, () =>
    console.log(`[server] MetriIQ API running on http://localhost:${PORT}`)
  );
}

start().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
