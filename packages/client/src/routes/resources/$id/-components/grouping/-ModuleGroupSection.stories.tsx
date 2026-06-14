import type { ModuleGroup } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ModuleGroupSection } from "./-ModuleGroupSection";

import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import { useResourceModules } from "@/hooks/useResourceModules";
import {
  makeModule,
  makeModuleGroup,
  seededModuleAdminClient,
} from "@/test-utils/resourceModulesFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const RESOURCE_ID = "resource-1";

const group: ModuleGroup = makeModuleGroup({
  id: "g1",
  name: "Section 1: Fundamentals",
});

const linkedGroup: ModuleGroup = makeModuleGroup({
  id: "g1",
  name: "Section 1: Fundamentals",
  url: "https://example.com/section-1",
});

const modules = [
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
];

// One group rendered against the live controllers; its enumerated modules come
// from the seeded modules query (matched by moduleGroupId).
function Host({
  group: g,
}: { group: ModuleGroup }) {
  const api = useResourceModules(RESOURCE_ID);
  const ui = useModuleAdminUiState();
  return (
    <ModuleGroupSection
      group={g}
      groupIndex={0}
      resourceId={RESOURCE_ID}
      api={api}
      ui={ui}
    />
  );
}

const meta: Meta<typeof ModuleGroupSection> = {
  component: ModuleGroupSection,
  render: () => <Host group={group} />,
  decorators: [
    queryStubDecorator(
      () =>
        seededModuleAdminClient({
          groups: [group],
          modules,
        }),
      {
        className: "max-w-2xl",
      },
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// A group carrying an http(s) url renders the external-link button beside the
// edit (pencil) control in the header.
export const Linked: Story = {
  render: () => <Host group={linkedGroup} />,
  decorators: [
    queryStubDecorator(
      () =>
        seededModuleAdminClient({
          groups: [linkedGroup],
          modules,
        }),
      {
        className: "max-w-2xl",
      },
    ),
  ],
};
