// Storybook browser-test setup (wired into the `storybook` Vitest project in
// vite.config.ts). Stories must not hit the network — they should seed query
// data via `seededQueryClient` instead. This guard intercepts same-origin
// `/api/*` requests and short-circuits them locally, so the suite never
// round-trips to the (down) dev proxy: no `ECONNREFUSED` spam, no per-call
// latency. Rejecting mirrors the prior dead-proxy behavior (components already
// handle these as failed queries), so it's behavior-preserving. Runs only in
// the Vitest context, never the Storybook dev server.

const realFetch = globalThis.fetch.bind(globalThis);

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = requestUrl(input);
  if (url.includes("/api/")) {
    // Greppable, neutral marker. A hit is expected for intentional
    // loading-state stories (empty client on purpose); for a content story it
    // means the query cache wasn't seeded (use seededQueryClient).
    console.warn(`[story-network-guard] short-circuited ${url} (no network in tests)`);
    return Promise.reject(
      new Error(`Story network call blocked by story-network-guard: ${url}`),
    );
  }
  return realFetch(input, init);
}) as typeof fetch;
