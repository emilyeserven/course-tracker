import type { ModuleGroupOption } from "./ModuleBulkEditRow";
import type { Module, TagGroup } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";

import { expect, userEvent, within } from "storybook/test";

import { ModuleBulkEditRow } from "./ModuleBulkEditRow";

import { moduleToRowDraft } from "@/hooks/useModuleBulkEditDrafts";
import {
  makeModule,
  makeTagGroups,
} from "@/test-utils/resourceModulesFixtures";

const groupOptions: ModuleGroupOption[] = [
  {
    value: "",
    label: "Ungrouped",
  },
  {
    value: "g1",
    label: "Section 1",
  },
];

interface RowDemoProps {
  module: Module;
  tagGroups: TagGroup[];
  showPages: boolean;
  expandedInit: boolean;
}

// A row renders `<tr>`s, so it needs a table ancestor. This wrapper also gives
// the pure row local draft/expand state so the cells are interactive in stories.
function RowDemo({
  module: m,
  tagGroups,
  showPages,
  expandedInit,
}: RowDemoProps) {
  const [rowDraft, setRowDraft] = useState(() => moduleToRowDraft(m));
  const [expanded, setExpanded] = useState(expandedInit);
  const colCount = showPages ? 7 : 6;
  return (
    <table className="w-full">
      <tbody>
        <ModuleBulkEditRow
          rowDraft={rowDraft}
          groupOptions={groupOptions}
          tagGroups={tagGroups}
          showPages={showPages}
          colCount={colCount}
          isDirty={false}
          expanded={expanded}
          onToggleExpand={() => setExpanded(e => !e)}
          onPatchDraft={patch =>
            setRowDraft(prev => ({
              ...prev,
              draft: {
                ...prev.draft,
                ...patch,
              },
            }))}
          onPatchRow={patch =>
            setRowDraft(prev => ({
              ...prev,
              ...patch,
            }))}
        />
      </tbody>
    </table>
  );
}

const meta = {
  component: RowDemo,
  args: {
    module: makeModule({
      id: "m1",
      name: "Variables",
      moduleGroupId: "g1",
    }),
    tagGroups: makeTagGroups(),
    showPages: false,
    expandedInit: false,
  },
} satisfies Meta<typeof RowDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Website: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByDisplayValue("Variables")).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Min",
    })).toBeInTheDocument();
    // No page inputs on a website module.
    await expect(canvas.queryByLabelText("Start page")).not.toBeInTheDocument();
  },
};

export const Book: Story = {
  args: {
    showPages: true,
    module: makeModule({
      id: "m1",
      name: "Chapter 1",
      pageStart: 1,
      pageEnd: 20,
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Start page")).toBeInTheDocument();
    await expect(canvas.getByLabelText("End page")).toBeInTheDocument();
  },
};

export const Expanded: Story = {
  args: {
    expandedInit: true,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Ease of Starting")).toBeInTheDocument();
    await expect(canvas.getByText("Tags")).toBeInTheDocument();
  },
};

// Switching the length control to "Range" reveals the duration-bucket select.
export const SwitchLengthToRange: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Range",
    }));
    await expect(canvas.getByLabelText("Length range")).toBeInTheDocument();
  },
};
