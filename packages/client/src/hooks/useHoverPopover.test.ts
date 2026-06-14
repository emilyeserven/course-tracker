import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useHoverPopover } from "./useHoverPopover";

function renderClosingPopover(
  options?: Parameters<typeof useHoverPopover>[0],
) {
  const view = renderHook(() => useHoverPopover(options));
  act(() => {
    view.result.current.handleOpen();
  });
  act(() => {
    view.result.current.handleClose();
  });
  return view;
}

describe("useHoverPopover", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test("starts closed", () => {
    const {
      result,
    } = renderHook(() => useHoverPopover());
    expect(result.current.open).toBe(false);
  });

  test("handleOpen opens immediately", () => {
    const {
      result,
    } = renderHook(() => useHoverPopover());
    act(() => {
      result.current.handleOpen();
    });
    expect(result.current.open).toBe(true);
  });

  test("handleClose keeps it open until the close delay elapses", () => {
    const {
      result,
    } = renderClosingPopover();

    // still open just before the 120ms grace period ends
    act(() => {
      vi.advanceTimersByTime(119);
    });
    expect(result.current.open).toBe(true);

    // closed once the grace period completes
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.open).toBe(false);
  });

  test("cancelClose aborts a pending close", () => {
    const {
      result,
    } = renderClosingPopover();
    act(() => {
      result.current.cancelClose();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.open).toBe(true);
  });

  test("honours a custom closeDelay", () => {
    const {
      result,
    } = renderClosingPopover({
      closeDelay: 300,
    });

    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(result.current.open).toBe(true);

    act(() => {
      vi.advanceTimersByTime(180);
    });
    expect(result.current.open).toBe(false);
  });

  test("setOpen toggles directly (click-toggle escape hatch)", () => {
    const {
      result,
    } = renderHook(() => useHoverPopover());
    act(() => {
      result.current.setOpen(prev => !prev);
    });
    expect(result.current.open).toBe(true);
    act(() => {
      result.current.setOpen(prev => !prev);
    });
    expect(result.current.open).toBe(false);
  });

  test("clears a pending close timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const {
      unmount,
    } = renderClosingPopover();

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
