import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GATEWAY_PORT = parseInt(process.env.PORT || "3000", 10);
const MIDDLEWARE_PORT = 3001;

const CLIENT_DIST = path.resolve(__dirname, "../client/dist");
const MIDDLEWARE_DIR = path.resolve(__dirname, "../middleware");

let middlewareChild = null;
let server = null;

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

// --- Express app ---

const app = express();

// Health check (before any middleware)
app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Security headers
app.use((_req, res, next) => {
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// Proxy /api/* to middleware
// Use pathFilter (not Express mount path) to preserve the full /api prefix in the proxied request.
app.use(
  createProxyMiddleware({
    target: `http://127.0.0.1:${MIDDLEWARE_PORT}`,
    pathFilter: "/api",
    changeOrigin: false,
    xfwd: true,
    on: {
      error: (err, _req, res) => {
        console.error("[gateway] Middleware proxy error:", err.message);
        if (res.writeHead) {
          res.writeHead(502, {
            "Content-Type": "text/plain",
          });
          res.end("Bad Gateway");
        }
      },
    },
  }),
);

// Serve client SPA static files
app.use(
  express.static(CLIENT_DIST, {
    maxAge: "1h",
    index: "index.html",
  }),
);

// SPA fallback: any route that wasn't a static file or API call gets index.html
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(CLIENT_DIST, "index.html"));
});

// --- Graceful shutdown ---

function shutdown() {
  console.log("[gateway] Shutting down...");

  if (middlewareChild) {
    middlewareChild.removeAllListeners("exit");
    middlewareChild.kill("SIGTERM");
  }

  if (server) {
    server.close(() => process.exit(0));
  }
  else {
    process.exit(0);
  }

  // Force exit after 10 seconds
  setTimeout(() => process.exit(1), 10000);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// --- Start ---

async function main() {
  startMiddleware();

  await waitForService("middleware (fastify)", MIDDLEWARE_PORT);

  server = app.listen(GATEWAY_PORT, "0.0.0.0", () => {
    console.log(`[gateway] Listening on port ${GATEWAY_PORT}`);
    console.log(`[gateway] /api/*  -> middleware on port ${MIDDLEWARE_PORT}`);
    console.log(`[gateway] /*      -> client SPA (static from ${CLIENT_DIST})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
