import type { Meta, StoryObj } from "@storybook/react-vite";

import { DndGrid } from "@dnd-grid/react";
import { expect, waitFor } from "@storybook/test";

import { GridTile } from "./-DashboardGrid";

// Regression guard for the dashboard grid: @dnd-grid clones each child to inject
// the `dnd-grid-item` class, the inline geometry (position/width/transform), drag
// handlers, and a ref. GridTile must forward all of them — a previous version
// swallowed them, leaving tiles unpositioned (full-width, no gap), undraggable,
// and with a stray always-visible handle in the bottom-left.
//
// A fixed-height tile keeps its SE resize handle, so we can assert the injected
// class + geometry + handle all reach the DOM and the hover toggle works.
function GridTileHarness() {
  return (
    <div className="w-[640px]">
      <DndGrid
        layout={[
          {
            id: "todoist",
            x: 0,
            y: 0,
            w: 2,
            h: 4,
            resizable: true,
          },
        ]}
        cols={4}
        rowHeight={64}
        gap={12}
        resizeHandles={["se"]}
      >
        <GridTile
          key="todoist"
          tileId="todoist"
          autoHeight={false}
          rowHeightPx={64}
          onMeasure={() => {
            // no-op: this fixed-height tile never reports a measured row count
          }}
        >
          <div data-testid="tile-content">Tile content</div>
        </GridTile>
      </DndGrid>
    </div>
  );
}

const meta = {
  component: GridTileHarness,
} satisfies Meta<typeof GridTileHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ForwardsGridProps: Story = {
  play: async ({
    canvasElement,
  }) => {
    // The grid's injected class must reach the rendered tile element.
    const item = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLElement>(".dnd-grid-item");
      if (!el) throw new Error("tile did not receive the dnd-grid-item class");
      return el;
    });

    // Geometry is applied inline by the grid (position:absolute + a pixel width
    // narrower than the container) — proof the cloned `style` was forwarded.
    await waitFor(() =>
      expect(getComputedStyle(item).position).toBe("absolute"));
    await expect(item.getBoundingClientRect().width).toBeLessThan(640);

    // The SE (bottom-right) resize handle exists and is hidden by default — the
    // regression showed an always-visible handle because the scoped
    // `.dnd-grid-item > .react-resizable-handle { opacity: 0 }` rule never
    // matched once the class was swallowed. (Hover reveal is a CSS :hover that
    // synthetic events can't reliably trigger in-browser, so it isn't asserted.)
    const handle = item.querySelector<HTMLElement>(
      ".react-resizable-handle-se",
    );
    if (!handle) throw new Error("SE resize handle was not rendered");
    await expect(getComputedStyle(handle).opacity).toBe("0");
  },
};
