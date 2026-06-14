import assert from "node:assert";
import { test } from "node:test";

import {
  assertSafeOutboundUrl,
  UnsafeOutboundUrlError,
} from "../utils/safeOutboundUrl.ts";

// The guard is pure and never fetches, so none of these touch the network.
function assertBlocked(url: string): void {
  assert.throws(
    () => assertSafeOutboundUrl(url),
    UnsafeOutboundUrlError,
    `expected ${url} to be blocked`,
  );
}

function assertAllowed(url: string): void {
  assert.doesNotThrow(
    () => assertSafeOutboundUrl(url),
    `expected ${url} to be allowed`,
  );
}

test("blocks private/loopback/link-local/metadata IPv4 literals", () => {
  for (const host of [
    "127.0.0.1",
    "10.1.2.3",
    "172.16.5.4",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
    "100.64.0.1",
    "192.0.0.1",
    "255.255.255.255",
  ]) {
    assertBlocked(`http://${host}/`);
  }
});

test("blocks obfuscated IPv4 forms (URL normalises them to dotted-quad)", () => {
  assertBlocked("http://2130706433/"); // 127.0.0.1
  assertBlocked("http://0x7f000001/"); // 127.0.0.1
  assertBlocked("http://0177.0.0.1/"); // 127.0.0.1
  assertBlocked("http://127.1/"); // 127.0.0.1
  assertBlocked("http://127.0.0.1./"); // trailing dot stripped for IP literals
  assertBlocked("http://0xA9FEA9FE/"); // 169.254.169.254
});

test("blocks loopback/ULA/link-local IPv6 literals", () => {
  for (const host of ["::1", "::", "fc00::1", "fd12:3456::1", "fe80::1", "febf::1"]) {
    assertBlocked(`http://[${host}]/`);
  }
});

test("blocks IPv4-mapped IPv6 addresses", () => {
  assertBlocked("http://[::ffff:127.0.0.1]/");
  assertBlocked("http://[::ffff:169.254.169.254]/");
});

test("blocks localhost and *.localhost (case-insensitive)", () => {
  assertBlocked("http://localhost/");
  assertBlocked("http://localhost:9200/");
  assertBlocked("https://api.localhost/");
  assertBlocked("http://LOCALHOST/");
});

test("blocks non-http(s) schemes", () => {
  assertBlocked("file:///etc/passwd");
  assertBlocked("ftp://example.com/");
  assertBlocked("gopher://example.com/");
});

test("blocks malformed URLs (incl. IPv6 zone ids)", () => {
  assertBlocked("not a url");
  assertBlocked("");
  assertBlocked("http://[fe80::1%eth0]/");
});

test("allows public https/http targets without touching the network", () => {
  assertAllowed("https://calendar.google.com/calendar/ical/abc/basic.ics");
  assertAllowed("http://8.8.8.8/");
  assertAllowed("https://[2606:4700:4700::1111]/");
  assertAllowed("http://example.com./");
});

test("range math is exact at block boundaries (no naive prefix matching)", () => {
  // Just outside 172.16.0.0/12.
  assertAllowed("http://172.15.255.255/");
  assertAllowed("http://172.32.0.0/");
  // Just outside 100.64.0.0/10.
  assertAllowed("http://100.63.255.255/");
  assertAllowed("http://100.128.0.0/");
  // Just past fe80::/10.
  assertAllowed("http://[fec0::1]/");
  // A hostname that merely starts like a blocked range must not be range-checked.
  assertAllowed("https://fed.example.org/");
  assertAllowed("https://10.example.com/");
});
