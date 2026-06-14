import type { DashboardTileId } from "@emstack/types";

import { useCallback, useEffect, useRef } from "react";

import { rowsForContent, TILE_META } from "@/lib/dashboardTiles";
import { cn } from "@/lib/utils";

/**
 * Wraps a single tile. Auto-height tiles render at their natural height and
 * report it (via ResizeObserver) so the grid can size their row span; fixed
 * tiles fill the grid cell and scroll internally.
 *
 * The grid clones this element to inject the `dnd-grid-item` class, the inline
 * geometry style, drag handlers, and its own ref — so we must forward every
 * received prop (and merge its ref with our measuring ref). Swallowing them
 * leaves tiles unpositioned, undraggable, and with stray always-on handles.
 *
 * One exception: the grid's geometry `style` carries a fixed pixel `height`
 * (the layout row count × rowHeight). For auto-height tiles that height must
 * not reach the measured element — it would feed the element's own height back
 * into the ResizeObserver (freezing the row count) and let taller content
 * overflow into the tile below. So we keep position/transform/width but drop
 * the imposed height for auto tiles, letting them size to their content.
 */
export function GridTile({
  tileId,
  autoHeight,
  rowHeightPx,
  onMeasure,
  className,
  style,
  ref,
  children,
  ...props
}: {
  tileId: DashboardTileId;
  autoHeight: boolean;
  rowHeightPx: number;
  onMeasure: (tileId: DashboardTileId, rows: number) => void;
} & React.ComponentProps<"div">) {
  const innerRef = useRef<HTMLDivElement>(null);
  const minH = TILE_META[tileId].minH;

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    if (!autoHeight) return;
    const el = innerRef.current;
    if (!el) return;
    const measure = () =>
      onMeasure(tileId, rowsForContent(el.offsetHeight, rowHeightPx, minH));
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [autoHeight, tileId, rowHeightPx, minH, onMeasure]);

  // Drop the grid's imposed height for auto tiles so the measured element
  // sizes to its content (see the note above); fixed tiles keep it.
  const itemStyle
    = autoHeight && style
      ? {
        ...style,
        height: undefined,
      }
      : style;

  return (
    <div
      ref={setRef}
      className={cn(
        "min-w-0",
        !autoHeight
        && `
          h-full min-h-0
          *:h-full
        `,
        className,
      )}
      {...props}
      style={itemStyle}
    >
      {children}
    </div>
  );
}
