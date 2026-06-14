import type { Meta, StoryObj } from "@storybook/react-vite";

import { ModuleHintTemplatePicker } from "./-ModuleHintTemplatePicker";

import { useResourceModules } from "@/hooks/useResourceModules";
import { seededModuleAdminClient } from "@/test-utils/resourceModulesFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const RESOURCE_ID = "resource-1";

// The picker only needs the module controller; render it via the real hook so the
// trigger reflects the resource's current hint-template config.
function Host() {
  const api = useResourceModules(RESOURCE_ID);
  return <ModuleHintTemplatePicker api={api} />;
}

const meta: Meta<typeof ModuleHintTemplatePicker> = {
  component: ModuleHintTemplatePicker,
  render: () => <Host />,
  decorators: [
    queryStubDecorator(() => seededModuleAdminClient(), {
      className: "max-w-2xl",
    }),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Closed popover — the "Hints" trigger button.
export const Default: Story = {};
