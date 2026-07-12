import { describe, expect, it } from "vitest";

import { buildBookmarkPageUrl, resolveBookmarkHref } from "./bookmarkLinks";

const API = "http://eserve-raspi:3000";

describe("buildBookmarkPageUrl", () => {
  it("builds the app page URL and encodes the id", () => {
    expect(buildBookmarkPageUrl("abc 123", API)).toBe(
      "http://eserve-raspi:3000/bookmarks/abc%20123",
    );
  });

  it("strips trailing slashes on the base URL", () => {
    expect(buildBookmarkPageUrl("a", "http://x:3000///")).toBe(
      "http://x:3000/bookmarks/a",
    );
  });

  it("returns null when the endpoint or id is missing", () => {
    expect(buildBookmarkPageUrl("a", null)).toBeNull();
    expect(buildBookmarkPageUrl("", API)).toBeNull();
  });
});

describe("resolveBookmarkHref", () => {
  const linkable = {
    externalId: "a",
    url: "https://example.com/article",
  };

  it("opens the underlying page for the 'page' target", () => {
    expect(resolveBookmarkHref(linkable, "page", API)).toBe(
      "https://example.com/article",
    );
  });

  it("opens the bookmark page for the 'bookmark' target", () => {
    expect(resolveBookmarkHref(linkable, "bookmark", API)).toBe(
      "http://eserve-raspi:3000/bookmarks/a",
    );
  });

  it("falls back to the bookmark page when 'page' has no url", () => {
    expect(
      resolveBookmarkHref({
        externalId: "a",
        url: null,
      }, "page", API),
    ).toBe("http://eserve-raspi:3000/bookmarks/a");
  });

  it("falls back to the url when 'bookmark' has no endpoint", () => {
    expect(resolveBookmarkHref(linkable, "bookmark", null)).toBe(
      "https://example.com/article",
    );
  });

  it("returns null when neither is available", () => {
    expect(
      resolveBookmarkHref({
        externalId: "a",
        url: null,
      }, "page", null),
    ).toBeNull();
  });
});
