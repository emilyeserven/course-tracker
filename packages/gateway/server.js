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

function pushSchema() {
  return new Promise((resolve, reject) => {
    console.log("[gateway] pushing database schema with drizzle-kit...");
    const drizzleKitBin = path.join(
      MIDDLEWARE_DIR,
      "node_modules",
      ".bin",
      "drizzle-kit",
    );
    const proc = spawn(drizzleKitBin, ["push"], {
      cwd: MIDDLEWARE_DIR,
      stdio: "inherit",
      env: process.env,
    });
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) {
        console.log("[gateway] schema push complete");
        resolve();
      }
      else {
        reject(new Error(`drizzle-kit push exited with code ${code}`));
      }
    });
  });
}

// --- Child process management ---

function startMiddleware() {
  middlewareChild = spawn("node", ["dist/app.js"], {
    cwd: MIDDLEWARE_DIR,
    stdio: "inherit",
    env: {
      ...process.env,
    },
  });

  middlewareChild.on("exit", (code) => {
    console.error(
      `[gateway] middleware exited with code ${code}, restarting...`,
    );
    setTimeout(startMiddleware, 1000);
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

// Health check
app.get("/healthz", async () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
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

  if (middlewareChild) {
    middlewareChild.removeAllListeners("exit");
    middlewareChild.kill("SIGTERM");
  }

  app.close().then(() => process.exit(0));

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
