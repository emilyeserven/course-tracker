import type { Meta, StoryObj } from "@storybook/react-vite";

import { ModuleAssistDialog } from "./-ModuleAssistDialog";

import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import { useResourceModules } from "@/hooks/useResourceModules";
import { seededModuleAdminClient } from "@/test-utils/resourceModulesFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const RESOURCE_ID = "resource-1";

// The dialog is closed by default (driven by ui.llmAssistOpen), so this story is
// a mount smoke test of the wiring between the resource query and the suggest
// dialog props.
function Host() {
  const api = useResourceModules(RESOURCE_ID);
  const ui = useModuleAdminUiState();
  return (
    <ModuleAssistDialog
      resourceId={RESOURCE_ID}
      api={api}
      ui={ui}
    />
  );
}

const meta: Meta<typeof ModuleAssistDialog> = {
  component: ModuleAssistDialog,
  render: () => <Host />,
  decorators: [
    queryStubDecorator(() => seededModuleAdminClient(), {
      className: "max-w-2xl",
    }),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
