/**
 * MetriIQ dev launcher
 *
 * 1. Checks if MongoDB (27017) and MinIO (9000) are reachable.
 * 2. If not → runs `docker-compose up -d` and waits up to 60 s.
 * 3. If Docker fails (daemon not running etc.) → clear error, exit 1.
 * 4. Once infra is ready → starts frontend (Vite) + backend (tsx watch)
 *    side-by-side via `concurrently` with colour-coded prefixed output.
 */

import net from "net";
import { execSync, spawn } from "child_process";
import { setTimeout as sleep } from "timers/promises";

const BOLD  = "\x1b[1m";
const CYAN  = "\x1b[36m";
const YEL   = "\x1b[33m";
const GREEN = "\x1b[32m";
const RED   = "\x1b[31m";
const RESET = "\x1b[0m";

const INFRA = [
  { name: "MongoDB", host: "localhost", port: 27017 },
  { name: "MinIO",   host: "localhost", port: 9000  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Main ──────────────────────────────────────────────────────────────────────

const initial = await getStatuses();
const allUp   = initial.every((s) => s.up);

if (allUp) {
  console.log(
    `${BOLD}[infra]${RESET} ${statusLine(initial)} — already running, skipping Docker.`
  );
} else {
  console.log(
    `${BOLD}[infra]${RESET} ${statusLine(initial)}`
  );
  console.log(`${BOLD}[infra]${RESET} Starting infrastructure via Docker Compose...`);

  try {
    execSync("docker-compose up -d", { stdio: "inherit" });
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

  const final = await getStatuses();
  console.log(`${BOLD}[infra]${RESET} ${statusLine(final)} — ready.`);
}

console.log(
  `\n${BOLD}[dev]${RESET} ${CYAN}frontend${RESET} on ${BOLD}http://localhost:5173${RESET}  ` +
  `${YEL}backend${RESET} on ${BOLD}http://localhost:4000${RESET}\n`
);

const proc = spawn(
  "npx",
  [
    "concurrently",
    "--kill-others-on-fail",       // if one crashes, kill the other too
    "--names",         "frontend,backend",
    "--prefix-colors", "cyan.bold,yellow.bold",
    "--prefix",        "[{name}]",
    "npm run dev:frontend",
    "npm run dev:backend",
  ],
  { stdio: "inherit", shell: true }
);

// Forward exit code so CI / shell knows if something crashed
proc.on("exit", (code) => process.exit(code ?? 0));
