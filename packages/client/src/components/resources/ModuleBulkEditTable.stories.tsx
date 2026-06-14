import type { BulkSaveRow } from "./ModuleBulkEditTable";
import type { Module, ModuleGroup, TagGroup } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { ModuleBulkEditTable } from "./ModuleBulkEditTable";

import { useModuleBulkEditDrafts } from "@/hooks/useModuleBulkEditDrafts";
import {
  makeModule,
  makeModuleGroup,
  makeTagGroups,
} from "@/test-utils/resourceModulesFixtures";

interface DemoProps {
  modules: Module[];
  groups: ModuleGroup[];
  tagGroups: TagGroup[];
  isBook: boolean;
  isSaving: boolean;
  onSaveAll: (rows: BulkSaveRow[]) => void;
}

// The table is driven by a `useModuleBulkEditDrafts` editor; this thin wrapper
// owns it so stories can render the table with seeded module data.
function Demo({
  modules,
  groups,
  tagGroups,
  isBook,
  isSaving,
  onSaveAll,
}: DemoProps) {
  const editor = useModuleBulkEditDrafts(modules);
  return (
    <ModuleBulkEditTable
      modules={modules}
      groups={groups}
      tagGroups={tagGroups}
      isBook={isBook}
      editor={editor}
      isSaving={isSaving}
      onSaveAll={onSaveAll}
    />
  );
}

const groups = [
  makeModuleGroup({
    id: "g1",
    name: "Section 1",
  }),
];

const websiteModules: Module[] = [
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
    name: "Standalone",
  }),
];

const meta = {
  component: Demo,
  args: {
    modules: websiteModules,
    groups,
    tagGroups: makeTagGroups(),
    isBook: false,
    isSaving: false,
    onSaveAll: fn(),
  },
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Group")).toBeInTheDocument();
    await expect(canvas.getByText("Status")).toBeInTheDocument();
    await expect(canvas.getByDisplayValue("Variables")).toBeInTheDocument();
    // Website resources omit the page-range column.
    await expect(canvas.queryByText("Pages")).not.toBeInTheDocument();
  },
};

export const Book: Story = {
  args: {
    isBook: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Pages")).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: {
    modules: [],
    groups: [],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("No modules to edit yet."),
    ).toBeInTheDocument();
  },
};

// Editing a single cell stages exactly one changed row; "Save all" forwards only
// that row to the save handler.
export const EditingARow: Story = {
  play: async ({
    canvasElement,
    args,
  }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByDisplayValue("Variables");
    await userEvent.clear(input);
    await userEvent.type(input, "Var X");

    await expect(await canvas.findByText("1 unsaved change")).toBeInTheDocument();

    const saveBtn = canvas.getByRole("button", {
      name: /save all/i,
    });
    await expect(saveBtn).toBeEnabled();
    await userEvent.click(saveBtn);

    await expect(args.onSaveAll).toHaveBeenCalledWith([
      expect.objectContaining({
        groupId: "g1",
        status: "complete",
        draft: expect.objectContaining({
          name: "Var X",
        }),
      }),
    ]);
  },
};
