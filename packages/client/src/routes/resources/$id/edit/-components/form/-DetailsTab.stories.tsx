import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { DetailsTab } from "./-DetailsTab";

import { useResourceEditForm } from "@/hooks/useResourceEditForm";
import { makeModuleAdminResource } from "@/test-utils/resourceModulesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import {
  queryStubDecorator,
  routerDecorator,
} from "@/test-utils/storyDecorators";

// The route owns the form instance, so build one via the real hook and hand it to
// the (presentational) DetailsTab. Topics/providers/tag-groups feed comboboxes;
// empty lists are enough for the form to render.
function Host({
  isNew,
}: { isNew: boolean }) {
  const controller = useResourceEditForm({
    id: isNew ? "new" : "resource-1",
    isNew,
    data: isNew ? undefined : makeModuleAdminResource(),
    skipBlock: fn(),
    invalidateRelated: () => Promise.resolve(),
  });
  return (
    <DetailsTab
      isNew={isNew}
      controller={controller}
      onDelete={fn()}
      onDuplicate={fn()}
      onCancel={fn()}
      onGoToModules={fn()}
    />
  );
}

const meta: Meta<typeof DetailsTab> = {
  component: DetailsTab,
  decorators: [
    routerDecorator,
    queryStubDecorator(
      () =>
        seededQueryClient([
          [["topics"], []],
          [["providers"], []],
          [["tagGroups"], []],
        ]),
      {
        className: "max-w-3xl",
      },
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Editing an existing resource: the full form with delete/duplicate actions.
export const Edit: Story = {
  render: () => <Host isNew={false} />,
};

// New resource: no delete/duplicate, and module tracking is unavailable.
export const New: Story = {
  render: () => <Host isNew />,
};
