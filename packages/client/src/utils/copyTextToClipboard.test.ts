import { afterEach, describe, expect, test, vi } from "vitest";

import { copyTextToClipboard } from "./copyTextToClipboard.ts";

afterEach(() => {
  vi.unstubAllGlobals();
  // jsdom doesn't implement execCommand, so tests assign it directly.
  delete (document as { execCommand?: unknown }).execCommand;
});

describe("copyTextToClipboard", () => {
  test("uses the async Clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText,
      },
    });

    expect(await copyTextToClipboard("hello")).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  test("falls back to execCommand when the Clipboard API rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText,
      },
    });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    expect(await copyTextToClipboard("hello")).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
    // The temporary textarea is cleaned up.
    expect(document.querySelector("textarea")).toBeNull();
  });

  test("uses the textarea fallback when the Clipboard API is absent", async () => {
    vi.stubGlobal("navigator", {});
    document.execCommand = vi.fn().mockReturnValue(true);

    expect(await copyTextToClipboard("hello")).toBe(true);
  });

  test("returns the execCommand result when the copy is rejected", async () => {
    vi.stubGlobal("navigator", {});
    document.execCommand = vi.fn().mockReturnValue(false);

    expect(await copyTextToClipboard("hello")).toBe(false);
  });

  test("returns false when the fallback throws", async () => {
    vi.stubGlobal("navigator", {});
    document.execCommand = vi.fn().mockImplementation(() => {
      throw new Error("boom");
    });

    expect(await copyTextToClipboard("hello")).toBe(false);
  });
});
