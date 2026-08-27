/**
 * MetriIQ dev launcher
 *
 * 1. Checks if MongoDB (27017) and MinIO (9000) are reachable.
 * 2. If not → runs `docker-compose up -d` and waits up to 60 s.
 * 3. Once infra is ready → starts frontend (Vite) + backend (tsx watch) in parallel.
 */

import net from "net";
import { execSync, spawn } from "child_process";
import { setTimeout as sleep } from "timers/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const BOLD  = "\x1b[1m";
const CYAN  = "\x1b[36m";
const YEL   = "\x1b[33m";
const GREEN = "\x1b[32m";
const RED   = "\x1b[31m";
const RESET = "\x1b[0m";

const NPM = "npm";

const INFRA = [
  { name: "MongoDB", host: "localhost", port: 27017 },
  { name: "MinIO",   host: "localhost", port: 9000  },
];

function checkPort(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(timeoutMs);
    const done = (ok) => { sock.destroy(); resolve(ok); };
    sock.once("connect", () => done(true));
    sock.once("error",   () => done(false));
    sock.once("timeout", () => done(false));
    sock.connect(port, host);
  });
}

async function getStatuses() {
  return Promise.all(
    INFRA.map(async (s) => ({ ...s, up: await checkPort(s.host, s.port) }))
  );
}

function statusLine(statuses) {
  return statuses
    .map((s) => `${s.name}: ${s.up ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`}`)
    .join("   ");
}

async function waitUntilReady(maxMs = 60_000) {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const statuses = await getStatuses();
    if (statuses.every((s) => s.up)) {
      process.stdout.write("\n");
      return true;
    }
    process.stdout.write(`\r  ${statusLine(statuses)}  — waiting...   `);
    await sleep(2000);
  }
  process.stdout.write("\n");
  return false;
}

// ── Infra check ───────────────────────────────────────────────────────────────

const initial = await getStatuses();
const allUp   = initial.every((s) => s.up);

if (allUp) {
  console.log(`${BOLD}[infra]${RESET} ${statusLine(initial)} — already running, skipping Docker.`);
} else {
  console.log(`${BOLD}[infra]${RESET} ${statusLine(initial)}`);
  console.log(`${BOLD}[infra]${RESET} Starting infrastructure via Docker Compose...`);

  try {
    execSync("docker-compose up -d", { stdio: "inherit", cwd: ROOT });
  } catch {
    console.error(
      `\n${RED}${BOLD}[infra] docker-compose up failed.${RESET}\n` +
      `       Is Docker Desktop running? Start it and try again.\n`
    );
    process.exit(1);
  }

  console.log(`${BOLD}[infra]${RESET} Waiting for services (timeout 60 s)...`);
  const ready = await waitUntilReady(60_000);

  if (!ready) {
    const statuses = await getStatuses();
    console.error(
      `\n${RED}${BOLD}[infra] Timeout reached.${RESET} ${statusLine(statuses)}\n` +
      `       Check Docker logs: npm run infra:logs\n`
    );
    process.exit(1);
  }

  console.log(`${BOLD}[infra]${RESET} ${statusLine(await getStatuses())} — ready.`);
}

console.log(
  `\n${BOLD}[dev]${RESET} ${CYAN}frontend${RESET} on ${BOLD}http://localhost:5173${RESET}  ` +
  `${YEL}backend${RESET} on ${BOLD}http://localhost:4000${RESET}\n`
);

// ── Launch processes ──────────────────────────────────────────────────────────

function prefix(name, color) {
  return (data) => {
    const lines = data.toString().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (const line of lines.split("\n")) {
      if (line.trim()) console.log(`${color}[${name}]${RESET} ${line}`);
    }
  };
}

const frontend = spawn(NPM, ["run", "dev:frontend"], { cwd: ROOT, shell: true });
const backend  = spawn(NPM, ["run", "dev:backend"],  { cwd: ROOT, shell: true });

frontend.stdout.on("data", prefix("frontend", CYAN));
frontend.stderr.on("data", prefix("frontend", CYAN));
backend.stdout.on("data",  prefix("backend",  YEL));
backend.stderr.on("data",  prefix("backend",  YEL));

frontend.on("exit", (code) => {
  console.log(`${RED}[frontend] exited with code ${code}${RESET}`);
  backend.kill();
  process.exit(code ?? 1);
});

backend.on("exit", (code) => {
  console.log(`${RED}[backend] exited with code ${code}${RESET}`);
  frontend.kill();
  process.exit(code ?? 1);
});

process.on("SIGINT",  () => { frontend.kill(); backend.kill(); });
process.on("SIGTERM", () => { frontend.kill(); backend.kill(); });
