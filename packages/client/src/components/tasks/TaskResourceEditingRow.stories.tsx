import type { ResourceSelectOption } from "./resourceMeta";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { EditingRow } from "./TaskResourceEditingRow";

import {
  expectRemoveHidden,
  expectSaveDisabled,
} from "@/test-utils/editRowStoryPlays";
import {
  makeModule,
  makeModuleGroup,
  makeTaskResource,
} from "@/test-utils/tasksFixtures";

const resourceOptions: ResourceSelectOption[] = [
  {
    id: "resource-1",
    name: "Intro to TypeScript",
  },
  {
    id: "resource-2",
    name: "Advanced React",
  },
];

const meta: Meta<typeof EditingRow> = {
  component: EditingRow,
  args: {
    resource: makeTaskResource({
      name: "",
      url: "",
      resourceId: null,
    }),
    resourceOptions,
    allModuleGroups: [makeModuleGroup()],
    allModules: [makeModule()],
    isNew: true,
    isSaving: false,
    onSave: fn(),
    onCancel: fn(),
    onDelete: fn(),
  },
  decorators: [
    Story => (
      <table>
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

/** A brand-new row: Save/Cancel only, no Remove. */
export const NewRow: Story = {
  play: async (context) => {
    const canvas = within(context.canvasElement);
    await expect(canvas.getByLabelText("Name")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: "Save",
      }),
    ).toBeInTheDocument();
    await expectRemoveHidden(context);
  },
};

/** Editing an existing row exposes the destructive Remove action. */
export const EditExisting: Story = {
  args: {
    resource: makeTaskResource({
      name: "Starter repo",
      url: "https://example.com/repo",
    }),
    isNew: false,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Remove",
      }),
    ).toBeInTheDocument();
  },
};

/** While saving, the Save button is disabled. */
export const Saving: Story = {
  args: {
    isSaving: true,
  },
  play: expectSaveDisabled,
};
