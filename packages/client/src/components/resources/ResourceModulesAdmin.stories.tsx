import type { Module, ModuleGroup, Resource } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { ResourceModulesAdmin } from "./ResourceModulesAdmin";

import {
  makeModule,
  makeModuleGroup,
  makeTagGroups,
} from "@/test-utils/resourceModulesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStubDecorator } from "@/test-utils/storyDecorators";
import { queryKeys } from "@/utils/queryKeys";

const RESOURCE_ID = "resource-1";

// The detail query only feeds the (closed) LLM-assist dialog's props, which read
// it via optional chaining — a minimal resource is plenty.
const resourceDetail: Resource = {
  id: RESOURCE_ID,
  name: "Intro to TypeScript",
  description: "A practical introduction.",
  url: "https://example.com/course",
  cost: {
    cost: "0",
    isCostFromPlatform: false,
    splitBy: 1,
  },
  progressCurrent: 0,
  progressTotal: 0,
  status: "active",
  topics: [],
};

// Seed everything `useResourceModules` reads via useQuery so the admin renders
// without any network call.
function seededClient(seed: {
  groups: ModuleGroup[];
  modules: Module[];
}) {
  return seededQueryClient([
    [queryKeys.resources.moduleGroups(RESOURCE_ID), seed.groups],
    [queryKeys.resources.modules(RESOURCE_ID), seed.modules],
    [queryKeys.tagGroups.list(), makeTagGroups()],
    [queryKeys.resources.detail(RESOURCE_ID), resourceDetail],
  ]);
}

const meta = {
  component: ResourceModulesAdmin,
  args: {
    resourceId: RESOURCE_ID,
  },
} satisfies Meta<typeof ResourceModulesAdmin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [
    queryStubDecorator(
      () =>
        seededClient({
          groups: [],
          modules: [],
        }),
      {
        className: "max-w-2xl",
      },
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/No modules yet\./)).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: "LLM Assist",
      }),
    ).toBeInTheDocument();
  },
};

export const Populated: Story = {
  decorators: [
    queryStubDecorator(
      () =>
        seededClient({
          groups: [
            makeModuleGroup({
              id: "g1",
              name: "Section 1: Fundamentals",
            }),
          ],
          modules: [
            makeModule({
              id: "m1",
              moduleGroupId: "g1",
              name: "Variables",
              isComplete: true,
            }),
            makeModule({
              id: "m2",
              moduleGroupId: "g1",
              name: "Functions",
            }),
            makeModule({
              id: "m3",
              moduleGroupId: null,
              name: "Standalone intro",
            }),
          ],
        }),
      {
        className: "max-w-2xl",
      },
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Section 1: Fundamentals"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Variables")).toBeInTheDocument();
    await expect(canvas.getByText("Standalone intro")).toBeInTheDocument();
  },
};
