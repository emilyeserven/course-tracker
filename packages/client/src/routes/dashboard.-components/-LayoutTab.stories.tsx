import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, screen, userEvent, within } from "storybook/test";

import { LayoutTab } from "./-LayoutTab";

import { Tabs, TabsList } from "@/components/ui/tabs";
import { makeLayout } from "@/test-utils/settingsFixtures";

const meta: Meta<typeof LayoutTab> = {
  component: LayoutTab,
  args: {
    layout: makeLayout(),
    onEditTiles: fn(),
    onRename: fn(),
    onDuplicate: fn(),
    onSaveAs: fn(),
    onDelete: fn(),
  },
  // TabsTrigger must render inside Tabs/TabsList context.
  decorators: [
    Story => (
      <Tabs defaultValue="layout-1">
        <TabsList>
          <Story />
        </TabsList>
      </Tabs>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// The tab plus its "More" menu (menu content portals to the body).
export const Default: Story = {
  play: async ({
    canvasElement, args,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("tab", {
        name: "Main",
      }),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", {
        name: /main options/i,
      }),
    );
    await userEvent.click(await screen.findByText("Rename"));
    await expect(args.onRename).toHaveBeenCalled();
  },
};
