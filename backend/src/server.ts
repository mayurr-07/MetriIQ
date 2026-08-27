import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { initMinio } from "./lib/minio.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});
app.use("/api/auth", authRoutes);

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
