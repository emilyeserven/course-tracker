import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import {
  DashboardIntegrationCard,
  SettingsLink,
} from "./-DashboardIntegrationCard";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { cardStoryDecorator } from "@/test-utils/storyDecorators";

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
  decorators: [cardStoryDecorator()],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Not configured yet: the card shows the connect prompt instead of content.
export const ConnectPrompt: Story = {};

// Configured: the card renders its data content.
export const Configured: Story = {
  args: {
    configured: true,
  },
};

// The shared "go to Settings" link used across the integration tiles.
export const SettingsLinkOnly: StoryObj<typeof SettingsLink> = {
  render: () => <SettingsLink>Open settings</SettingsLink>,
};
