import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { ProgressModeField } from "./-ProgressModeField";

import { useResourceEditForm } from "@/hooks/useResourceEditForm";
import { makeModuleAdminResource } from "@/test-utils/resourceModulesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

// The field needs the live edit-form instance for its manual progress number
// fields, so build one via the real hook against a seeded query client.
function Host({
  isNew,
  modulesAreExhaustive,
  tracksProgress = true,
}: {
  isNew: boolean;
  modulesAreExhaustive: boolean;
  tracksProgress?: boolean;
}) {
  const controller = useResourceEditForm({
    id: isNew ? "new" : "resource-1",
    isNew,
    data: isNew ? undefined : makeModuleAdminResource(),
    skipBlock: fn(),
    invalidateRelated: () => Promise.resolve(),
  });
  return (
    <ProgressModeField
      form={controller.form}
      modulesAreExhaustive={modulesAreExhaustive}
      tracksProgress={tracksProgress}
      isNew={isNew}
      onModeChange={fn()}
      onGoToModules={fn()}
    />
  );
}

const meta: Meta<typeof ProgressModeField> = {
  component: ProgressModeField,
  decorators: [
    queryStubDecorator(
      () =>
        seededQueryClient([
          [["providers"], []],
          [["tagGroups"], []],
        ]),
      {
        className: "max-w-md",
      },
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Manual mode: the current/total progress number fields are shown.
export const Manual: Story = {
  render: () => (
    <Host
      isNew={false}
      modulesAreExhaustive={false}
    />
  ),
};

// Module-tracking mode: the number fields collapse to a "Go to Modules" shortcut.
export const ModuleTracking: Story = {
  render: () => (
    <Host
      isNew={false}
      modulesAreExhaustive
    />
  ),
};

// No-progress mode: the resource opts out of tracking; the number fields and
// the modules shortcut collapse to an infinity-icon explanation.
export const NoProgress: Story = {
  render: () => (
    <Host
      isNew={false}
      modulesAreExhaustive={false}
      tracksProgress={false}
    />
  ),
};

// New resources can't use module tracking yet — that radio is disabled.
export const NewResource: Story = {
  render: () => (
    <Host
      isNew
      modulesAreExhaustive={false}
    />
  ),
};
