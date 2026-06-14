import { describe, expect, test } from "vitest";

import { isHttpUrl } from "./isHttpUrl.ts";

describe("isHttpUrl", () => {
  test("accepts http and https URLs", () => {
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("https://example.com/path?q=1")).toBe(true);
  });

  test("rejects non-http(s) protocols", () => {
    expect(isHttpUrl("ftp://example.com")).toBe(false);
    expect(isHttpUrl("mailto:someone@example.com")).toBe(false);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
  });

  test("rejects strings that are not valid URLs", () => {
    expect(isHttpUrl("not a url")).toBe(false);
    expect(isHttpUrl("example.com")).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });
});
