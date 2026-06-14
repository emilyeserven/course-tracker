// Every path.*/spawn/fetch sink here takes literal or constant args
// (CLIENT_DIST/MIDDLEWARE_DIR resolved from __dirname, hardcoded
// "node"/drizzle-kit commands, fixed 127.0.0.1 health/readiness probes). No
// request input reaches these sinks, so the candidates are not exploitable. The
// localhost http:// probes are intentionally cleartext.
// fallow-ignore-file security-sink
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import fastifyHttpProxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GATEWAY_PORT = parseInt(process.env.PORT || "3000", 10);
const MIDDLEWARE_PORT = 3001;

const CLIENT_DIST = path.resolve(__dirname, "../client/dist");
const MIDDLEWARE_DIR = path.resolve(__dirname, "../middleware");

let middlewareChild = null;

// --- Schema push ---

function runInMiddleware(label, command, args) {
  return new Promise((resolve, reject) => {
    console.log(`[gateway] ${label}...`);
    const proc = spawn(command, args, {
      cwd: MIDDLEWARE_DIR,
      stdio: "inherit",
      env: process.env,
    });
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) {
        console.log(`[gateway] ${label} complete`);
        resolve();
      }
      else {
        reject(new Error(`${label} exited with code ${code}`));
      }
    });
  });
}

async function pushSchema() {
  // Runtime migrations first, then push — same order as the middleware's
  // push:prod script. Migrations transform/drop legacy tables so the
  // subsequent diff never contains destructive statements, which drizzle-kit
  // would otherwise stop and prompt about (and hang: this is a non-TTY).
  await runInMiddleware(
    "running runtime migrations",
    "node",
    ["dist/db/migrate.js"],
  );
  await runInMiddleware(
    "pushing database schema with drizzle-kit",
    path.join(MIDDLEWARE_DIR, "node_modules", ".bin", "drizzle-kit"),
    ["push"],
  );
}

// --- Child process management ---

// Crash-loop protection: back off exponentially between restarts, and give up
// (exit non-zero, so the orchestrator restarts the whole container) after too
// many consecutive short-lived runs. Without this the old fixed 1s respawn
// looped forever while /healthz kept reporting ok. A run that survives
// HEALTHY_RUN_MS resets the counter and the backoff.
const RESTART_BASE_DELAY_MS = 1000;
const RESTART_MAX_DELAY_MS = 30000;
const HEALTHY_RUN_MS = 60000;
const MAX_CONSECUTIVE_CRASHES = 5;

let restartDelay = RESTART_BASE_DELAY_MS;
let consecutiveCrashes = 0;

function startMiddleware() {
  const startedAt = Date.now();
  middlewareChild = spawn("node", ["dist/app.js"], {
    cwd: MIDDLEWARE_DIR,
    stdio: "inherit",
    env: process.env,
  });

  middlewareChild.on("exit", (code) => {
    if (Date.now() - startedAt >= HEALTHY_RUN_MS) {
      consecutiveCrashes = 0;
      restartDelay = RESTART_BASE_DELAY_MS;
    }

    consecutiveCrashes += 1;
    if (consecutiveCrashes > MAX_CONSECUTIVE_CRASHES) {
      console.error(
        `[gateway] middleware crashed ${consecutiveCrashes} times in a row, giving up`,
      );
      process.exit(1);
    }

    console.error(
      `[gateway] middleware exited with code ${code}, restarting in ${restartDelay}ms...`,
    );
    setTimeout(startMiddleware, restartDelay);
    restartDelay = Math.min(restartDelay * 2, RESTART_MAX_DELAY_MS);
  });

  return middlewareChild;
}

// --- Readiness checks ---

async function waitForService(name, port, maxRetries = 30, interval = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      if (res.ok || res.status === 302 || res.status === 404) {
        console.log(`[gateway] ${name} is ready on port ${port}`);
        return;
      }
    }
    catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error(`[gateway] ${name} failed to start on port ${port}`);
}

// --- Fastify app ---

const app = Fastify({
  logger: false,
});

// Security headers
app.addHook("onSend", async (_request, reply) => {
  reply.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-Frame-Options", "DENY");
});

// Health check — probes the middleware so health reflects the whole stack,
// not just this proxy shell. Any HTTP response means the process is up.
app.get("/healthz", async (_request, reply) => {
  try {
    await fetch(`http://127.0.0.1:${MIDDLEWARE_PORT}/`, {
      signal: AbortSignal.timeout(2000),
    });
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
  catch {
    return reply.status(503).send({
      status: "error",
      message: "middleware unreachable",
    });
  }
});

// Proxy /api/* to middleware
await app.register(fastifyHttpProxy, {
  upstream: `http://127.0.0.1:${MIDDLEWARE_PORT}`,
  prefix: "/api",
  rewritePrefix: "/api",
  http: {
    requestOptions: {
      timeout: 30000,
    },
  },
});

// Serve client SPA static files
await app.register(fastifyStatic, {
  root: CLIENT_DIST,
  maxAge: "1h",
});

// SPA fallback: any route that wasn't a static file or API call gets index.html
app.setNotFoundHandler(async (_request, reply) => {
  return reply.sendFile("index.html");
});

// --- Graceful shutdown ---

function shutdown() {
  console.log("[gateway] Shutting down...");

  // Let the middleware finish in-flight work before closing the proxy.
  const middlewareExited = middlewareChild
    ? new Promise((resolve) => {
      middlewareChild.removeAllListeners("exit");
      middlewareChild.once("exit", resolve);
      middlewareChild.kill("SIGTERM");
    })
    : Promise.resolve();

  middlewareExited
    .then(() => app.close())
    .then(() => process.exit(0));

  // Force exit after 10 seconds
  setTimeout(() => process.exit(1), 10000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// --- Start ---

async function main() {
  await pushSchema();

  startMiddleware();

  await waitForService("middleware (fastify)", MIDDLEWARE_PORT);

  await app.listen({
    port: GATEWAY_PORT,
    host: "0.0.0.0",
  });
  console.log(`[gateway] listening on http://localhost:${GATEWAY_PORT}`);
  console.log(`[gateway] /api/*  -> middleware on port ${MIDDLEWARE_PORT}`);
  console.log(`[gateway] /*      -> client SPA (static from ${CLIENT_DIST})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
