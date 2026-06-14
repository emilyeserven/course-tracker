import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ExistingDomainEditor } from "./-ExistingDomainEditor";

import { makeDomain, makeTopicRows } from "@/test-utils/boxFixtures";
import { makeRadar } from "@/test-utils/radarFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import {
  queryStubDecorator,
  routerDecorator,
} from "@/test-utils/storyDecorators";

const DOMAIN_ID = "domain-1";

// Seeds the three reads the editor makes (domain / radar / topics) so it renders
// the loaded tab UI without hitting the network.
function seededClient() {
  return seededQueryClient([
    [["domain", DOMAIN_ID], makeDomain()],
    [["radar", DOMAIN_ID], makeRadar()],
    [["topics"], makeTopicRows()],
  ]);
}

const meta = {
  component: ExistingDomainEditor,
  args: {
    id: DOMAIN_ID,
    tab: "details",
  },
  decorators: [routerDecorator],
} satisfies Meta<typeof ExistingDomainEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

// With the queries seeded the editor shows its header, tab strip, and the
// (default) Details tab body.
export const Loaded: Story = {
  decorators: [queryStubDecorator(seededClient)],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", {
        name: /edit domain/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByRole("tab", {
      name: /details/i,
    })).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save details/i,
      }),
    ).toBeInTheDocument();
  },
};

// Before the domain query resolves the editor renders its loading placeholder.
export const Loading: Story = {
  decorators: [queryStubDecorator()],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/loading domain/i),
    ).toBeInTheDocument();
  },
};
