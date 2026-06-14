import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExistingDomainEditor } from "./-ExistingDomainEditor";

import { makeDomain, makeTopicRows } from "@/test-utils/boxFixtures";
import { makeRadar } from "@/test-utils/radarFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import {
  queryStubDecorator,
  routerDecorator,
} from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

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
  play: smokePlay([
    {
      role: "heading",
      name: /edit domain/i,
    },
    {
      role: "tab",
      name: /details/i,
    },
    {
      role: "button",
      name: /save details/i,
    },
  ]),
};

// Before the domain query resolves the editor renders its loading placeholder.
export const Loading: Story = {
  decorators: [queryStubDecorator()],
  play: smokePlay([{
    text: /loading domain/i,
  }]),
};
