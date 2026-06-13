import { useEffect, useRef, useState } from "react";

interface UseHoverPopoverOptions {
  /** ms to wait after hover-out before closing (grace period for re-entering). */
  closeDelay?: number;
}

/**
 * Hover-driven open/close state for a popover: opens immediately on
 * handleOpen, closes after a short grace delay on handleClose (so the
 * pointer can travel into the popover content), with cancelClose to abort a
 * pending close and a setOpen escape hatch for click-toggle / onOpenChange.
 * Stays dumb about app-specific guards — wrap handleOpen/handleClose at the
 * call site where needed.
 */
export function useHoverPopover({
  closeDelay = 120,
}: UseHoverPopoverOptions = {}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleOpen = () => {
    cancelClose();
    setOpen(true);
  };

  const handleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  return {
    open,
    setOpen,
    cancelClose,
    handleOpen,
    handleClose,
  };
}
