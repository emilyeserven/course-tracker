import { isIP } from "node:net";

// Guard for user-supplied fetch targets (SSRF defence). Pure + synchronous so
// the Node test runner can load it directly — imports only `node:net`, no `@/`
// aliases, no DNS, no I/O.
//
// Scope: this is a *structural/literal* guard. It rejects non-http(s) schemes,
// `localhost`, and IP literals in private/loopback/link-local/metadata ranges
// (IPv4, IPv6, IPv4-mapped, and obfuscated numeric forms — `new URL()`
// canonicalises `http://2130706433/`, `http://0x7f000001/`, etc. to dotted-quad
// for us). It does NOT resolve DNS, so a *public hostname that resolves to a
// private IP* (DNS rebinding) is intentionally out of scope.
//
// Gotcha: JS `<<` is signed-32-bit, so every IPv4 int result is coerced with
// `>>> 0` to stay unsigned (otherwise `255.255.255.255` compares as `-1`).

/** Thrown when a URL targets a disallowed scheme or address. */
export class UnsafeOutboundUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeOutboundUrlError";
  }
}

// [networkInt, prefixBits, label] — blocked IPv4 CIDR ranges.
const IPV4_BLOCKS: [number, number, string][] = [
  [ipv4ToInt("0.0.0.0"), 8, "this-network 0.0.0.0/8"],
  [ipv4ToInt("127.0.0.0"), 8, "loopback 127.0.0.0/8"],
  [ipv4ToInt("10.0.0.0"), 8, "private 10.0.0.0/8"],
  [ipv4ToInt("172.16.0.0"), 12, "private 172.16.0.0/12"],
  [ipv4ToInt("192.168.0.0"), 16, "private 192.168.0.0/16"],
  [ipv4ToInt("169.254.0.0"), 16, "link-local 169.254.0.0/16"],
  [ipv4ToInt("100.64.0.0"), 10, "CGNAT 100.64.0.0/10"],
  [ipv4ToInt("192.0.0.0"), 24, "IETF 192.0.0.0/24"],
  [ipv4ToInt("255.255.255.255"), 32, "broadcast 255.255.255.255"],
];

/** Parse a canonical dotted-quad into an unsigned 32-bit int. */
function ipv4ToInt(host: string): number {
  const p = host.split(".");
  return (
    ((+p[0] << 24) | (+p[1] << 16) | (+p[2] << 8) | +p[3]) >>> 0
  );
}

/** Reject the IPv4 literal if it falls in any blocked range. */
function assertPublicIpv4(host: string): void {
  const ip = ipv4ToInt(host);
  for (const [net, bits, label] of IPV4_BLOCKS) {
    const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
    if (((ip & mask) >>> 0) === net) {
      throw new UnsafeOutboundUrlError(`Blocked IPv4 range: ${label}`);
    }
  }
}

/**
 * Pull the embedded IPv4 out of an IPv4-mapped IPv6 address. `URL` emits the
 * hex form (`::ffff:7f00:1`); a raw caller could pass the dotted form
 * (`::ffff:127.0.0.1`). Returns a dotted-quad, or null if not mapped.
 */
function extractMappedIpv4(host: string): string | null {
  if (!host.startsWith("::ffff:")) return null;
  const tail = host.slice("::ffff:".length);
  if (tail.includes(".")) return tail;
  const groups = tail.split(":");
  if (groups.length !== 2) return null;
  const hi = parseInt(groups[0], 16);
  const lo = parseInt(groups[1], 16);
  return [hi >> 8, hi & 0xFF, lo >> 8, lo & 0xFF].join(".");
}

/** Reject the IPv6 literal if it's loopback/unspecified/ULA/link-local/mapped. */
function assertPublicIpv6(host: string): void {
  const lower = host.toLowerCase();

  const mapped = extractMappedIpv4(lower);
  if (mapped) {
    assertPublicIpv4(mapped);
    return;
  }

  if (lower === "::" || lower === "::1") {
    throw new UnsafeOutboundUrlError("Blocked IPv6 loopback/unspecified.");
  }

  // Leading hextet drives the prefix checks. A leading `::` (zero head) is
  // already handled by the literal/mapped checks above.
  const head = parseInt(lower.split(":")[0], 16) || 0;
  if ((head & 0xFE00) === 0xFC00) {
    throw new UnsafeOutboundUrlError("Blocked IPv6 ULA fc00::/7.");
  }
  if ((head & 0xFFC0) === 0xFE80) {
    throw new UnsafeOutboundUrlError("Blocked IPv6 link-local fe80::/10.");
  }
}

/**
 * Throw `UnsafeOutboundUrlError` if `url` is not a safe outbound fetch target.
 * Call this before any `fetch()` of a user-supplied URL.
 */
export function assertSafeOutboundUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  }
  catch {
    throw new UnsafeOutboundUrlError("Malformed URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new UnsafeOutboundUrlError(`Disallowed scheme: ${parsed.protocol}`);
  }

  // `hostname` is already lowercased by the WHATWG parser; strip IPv6 brackets.
  let host = parsed.hostname;
  if (host.startsWith("[") && host.endsWith("]")) {
    host = host.slice(1, -1);
  }

  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new UnsafeOutboundUrlError("Loopback hostname not allowed.");
  }

  const kind = isIP(host);
  if (kind === 4) {
    assertPublicIpv4(host);
  }
  else if (kind === 6) {
    assertPublicIpv6(host);
  }
  // A real hostname (kind === 0) is allowed — we never DNS-resolve it.
}
