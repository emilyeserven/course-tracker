import type { Module } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ModuleListItem } from "./-ModuleListItem";

import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import { useResourceModules } from "@/hooks/useResourceModules";
import {
  makeModule,
  seededModuleAdminClient,
} from "@/test-utils/resourceModulesFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const RESOURCE_ID = "resource-1";

const moduleItem: Module = makeModule({
  id: "m1",
  moduleGroupId: null,
  name: "Variables and Types",
  status: "in_progress",
});

// A single module row driven by the live controllers. It renders an <li>, so the
// decorator wraps it in a <ul>.
function Host() {
  const api = useResourceModules(RESOURCE_ID);
  const ui = useModuleAdminUiState();
  return (
    <ModuleListItem
      module={moduleItem}
      resourceId={RESOURCE_ID}
      groupId={null}
      list={[moduleItem]}
      index={0}
      api={api}
      ui={ui}
    />
  );
}

const meta: Meta<typeof ModuleListItem> = {
  component: ModuleListItem,
  render: () => (
    <ul className="flex flex-col divide-y rounded-sm border">
      <Host />
    </ul>
  ),
  decorators: [
    queryStubDecorator(
      () => seededModuleAdminClient({
        modules: [moduleItem],
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
