import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import {
  DashboardIntegrationCard,
  SettingsLink,
} from "./-DashboardIntegrationCard";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof DashboardIntegrationCard> = {
  component: DashboardIntegrationCard,
  args: {
    tile: makeTile("readwise"),
    onUpdateTile: fn(),
    title: "Readwise",
    settingsLink: <SettingsLink className="text-sm">Set API key</SettingsLink>,
    configured: false,
    isPending: false,
    error: null,
    connectPrompt: <p>Add your API key in Settings to connect.</p>,
    children: <div>Integration content</div>,
  },
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Not configured yet: the card shows the connect prompt instead of content.
export const ConnectPrompt: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/add your api key in settings/i),
    ).toBeInTheDocument();
  },
};

// Configured: the card renders its data content.
export const Configured: Story = {
  args: {
    configured: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Integration content"),
    ).toBeInTheDocument();
  },
};

// The shared "go to Settings" link used across the integration tiles.
export const SettingsLinkOnly: StoryObj<typeof SettingsLink> = {
  render: () => <SettingsLink>Open settings</SettingsLink>,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: /open settings/i,
      }),
    ).toBeInTheDocument();
  },
};
