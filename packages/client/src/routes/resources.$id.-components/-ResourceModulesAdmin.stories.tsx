import type { Module, ModuleGroup, Resource } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ResourceModulesAdmin } from "./-ResourceModulesAdmin";

import {
  makeModule,
  makeModuleGroup,
  makeTagGroups,
} from "@/test-utils/resourceModulesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStubDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";
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
  modulesAreExhaustive: false,
  topics: [],
};

// Seed everything `useResourceModules` reads via useQuery so the admin renders
// without any network call.
function seededClient(seed: {
  groups: ModuleGroup[];
  modules: Module[];
  modulesAreExhaustive?: boolean;
}) {
  return seededQueryClient([
    [queryKeys.resources.moduleGroups(RESOURCE_ID), seed.groups],
    [queryKeys.resources.modules(RESOURCE_ID), seed.modules],
    [queryKeys.tagGroups.list(), makeTagGroups()],
    [
      queryKeys.resources.detail(RESOURCE_ID),
      {
        ...resourceDetail,
        modulesAreExhaustive: seed.modulesAreExhaustive ?? false,
      },
    ],
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
  play: smokePlay([
    {
      text: /No modules yet\./,
    },
    {
      role: "button",
      name: "LLM Assist",
    },
  ]),
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
              status: "complete",
            }),
            makeModule({
              id: "m2",
              moduleGroupId: "g1",
              name: "Functions",
              status: "in_progress",
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
  play: smokePlay([
    {
      text: "Section 1: Fundamentals",
    },
    {
      text: "Variables",
    },
    {
      text: "Standalone intro",
    },
  ]),
};

// Edit-page context: `canEditExhaustive` renders the toggle, and the exhaustive
// flag drives the `· N%` progress summary.
export const ExhaustiveEditable: Story = {
  args: {
    resourceId: RESOURCE_ID,
    canEditExhaustive: true,
  },
  decorators: [
    queryStubDecorator(
      () =>
        seededClient({
          groups: [],
          modules: [
            makeModule({
              id: "m1",
              moduleGroupId: null,
              name: "Variables",
              status: "complete",
            }),
            makeModule({
              id: "m2",
              moduleGroupId: null,
              name: "Functions",
            }),
          ],
          modulesAreExhaustive: true,
        }),
      {
        className: "max-w-2xl",
      },
    ),
  ],
  play: smokePlay([
    {
      text: "Module list is exhaustive",
    },
    {
      text: /50%/,
    },
  ]),
};
