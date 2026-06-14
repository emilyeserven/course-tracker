import type { Meta, StoryObj } from "@storybook/react-vite";

import { DndGrid } from "@dnd-grid/react";
import { expect, waitFor } from "storybook/test";

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

// Both regression stories first need the grid-positioned tile element: it must
// carry the injected `dnd-grid-item` class and the absolute positioning the grid
// applies inline (proof the cloned `style` was forwarded — the #279 fix).
async function findPositionedTile(canvasElement: HTMLElement) {
  const item = await waitFor(() => {
    const el = canvasElement.querySelector<HTMLElement>(".dnd-grid-item");
    if (!el) throw new Error("tile did not receive the dnd-grid-item class");
    return el;
  });
  await waitFor(() => expect(getComputedStyle(item).position).toBe("absolute"));
  return item;
}

export const ForwardsGridProps: Story = {
  play: async ({
    canvasElement,
  }) => {
    const item = await findPositionedTile(canvasElement);

    // Geometry is applied inline by the grid (a pixel width narrower than the
    // container) — further proof the cloned `style` was forwarded.
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

// Regression guard for the auto-height path: the grid injects a fixed pixel
// `height` (layout rows × rowHeight) into each item's `style`. For an
// auto-height tile that height must NOT pin the measured element — otherwise
// the ResizeObserver reads its own clamped height (freezing the row count) and
// taller content overflows into the tile below, which is what made every card
// overlap. Here the layout reserves 4 rows × 64px ≈ 256px but the content is
// 600px tall, so a correct tile grows to its content instead of clamping.
const TALL_CONTENT_PX = 600;

function AutoHeightHarness() {
  return (
    <div className="w-[640px]">
      <DndGrid
        layout={[
          {
            id: "todoist",
            x: 0,
            y: 0,
            w: 4,
            h: 4,
          },
        ]}
        cols={4}
        rowHeight={64}
        gap={12}
      >
        <GridTile
          key="todoist"
          tileId="todoist"
          autoHeight={true}
          rowHeightPx={64}
          onMeasure={() => {
            // no-op: this harness asserts on the rendered height directly
          }}
        >
          <div
            data-testid="tall-content"
            style={{
              height: TALL_CONTENT_PX,
            }}
          >
            Tall content
          </div>
        </GridTile>
      </DndGrid>
    </div>
  );
}

export const AutoHeightSizesToContent: Story = {
  render: () => <AutoHeightHarness />,
  play: async ({
    canvasElement,
  }) => {
    const item = await findPositionedTile(canvasElement);

    // The tile grows to its ~600px content rather than being clamped to the
    // layout's 4-row (~256px) imposed height. A regressed build leaves the
    // inline height in place, so the element stays ~256px and the content
    // overflows into neighbouring tiles.
    await waitFor(() =>
      expect(item.getBoundingClientRect().height)
        .toBeGreaterThan(TALL_CONTENT_PX - 50));
  },
};
