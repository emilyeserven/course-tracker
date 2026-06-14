import type { Meta, StoryObj } from "@storybook/react-vite";

import { UngroupedModulesSection } from "./-UngroupedModulesSection";

import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import { useResourceModules } from "@/hooks/useResourceModules";
import {
  makeModule,
  seededModuleAdminClient,
} from "@/test-utils/resourceModulesFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const RESOURCE_ID = "resource-1";

// The ungrouped block renders only when there are ungrouped modules (or one is
// being created), so seed a couple of modules with no group.
function Host() {
  const api = useResourceModules(RESOURCE_ID);
  const ui = useModuleAdminUiState();
  return (
    <UngroupedModulesSection
      resourceId={RESOURCE_ID}
      api={api}
      ui={ui}
    />
  );
}

const meta: Meta<typeof UngroupedModulesSection> = {
  component: UngroupedModulesSection,
  render: () => <Host />,
  decorators: [
    queryStubDecorator(
      () =>
        seededModuleAdminClient({
          modules: [
            makeModule({
              id: "m1",
              moduleGroupId: null,
              name: "Standalone intro",
            }),
            makeModule({
              id: "m2",
              moduleGroupId: null,
              name: "Wrap-up",
              status: "complete",
            }),
          ],
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
