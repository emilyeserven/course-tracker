import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { DataTable } from "./data-table";

import {
  dataTableSampleColumns,
  dataTableSampleRows,
} from "@/test-utils/dataTableSampleFixtures";

/** Non-generic harness so the story can be typed against a concrete component. */
function DataTableDemo() {
  return (
    <div className="w-full max-w-xl rounded-md border bg-card">
      <DataTable
        columns={dataTableSampleColumns}
        data={dataTableSampleRows}
        getRowId={r => r.id}
        enableSorting
        enableRowSelection
      />
    </div>
  );
}

const meta = {
  component: DataTableDemo,
} satisfies Meta<typeof DataTableDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    // Sorting: clicking the Name header orders rows ascending.
    await userEvent.click(
      canvas.getByRole("button", {
        name: /name/i,
      }),
    );
    const firstRow = canvas.getAllByRole("row")[1];
    await expect(firstRow).toHaveTextContent("Avocado");

    // Selection: checking a row marks its <tr> as selected.
    const rowCheckbox = canvas.getByLabelText("Select Avocado");
    await userEvent.click(rowCheckbox);
    await expect(rowCheckbox.closest("tr")).toHaveAttribute(
      "data-state",
      "selected",
    );
  },
};
