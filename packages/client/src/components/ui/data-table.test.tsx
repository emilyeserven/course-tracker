import type { ColumnDef, SortingState } from "@tanstack/react-table";

// Pulls in the jest-dom matcher type augmentation for Vitest's `expect`.
// eslint-disable-next-line import/no-unassigned-import
import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { DataTable } from "./data-table";
import { DataTableColumnHeader } from "./data-table-column-header";

interface Item {
  id: string;
  name: string;
  count: number;
}

const columns: ColumnDef<Item>[] = [
  {
    id: "select",
    enableSorting: false,
    header: ({
      table,
    }) => (
      <input
        type="checkbox"
        aria-label="Select all"
        checked={table.getIsAllRowsSelected()}
        ref={(el) => {
          if (el) el.indeterminate = table.getIsSomeRowsSelected();
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({
      row,
    }) => (
      <input
        type="checkbox"
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Name"
      />
    ),
    cell: ({
      row,
    }) => row.original.name,
  },
  {
    accessorKey: "count",
    header: ({
      column,
    }) => (
      <DataTableColumnHeader
        column={column}
        label="Count"
        align="right"
      />
    ),
    cell: ({
      row,
    }) => row.original.count,
    meta: {
      align: "right",
    },
  },
];

// Capitalized, distinct initials so ordering is unambiguous regardless of the
// sort fn's case handling. Initial order is intentionally unsorted.
const data: Item[] = [
  {
    id: "a",
    name: "Banana",
    count: 2,
  },
  {
    id: "b",
    name: "Avocado",
    count: 5,
  },
  {
    id: "c",
    name: "Cherry",
    count: 1,
  },
];

/** Body-row text in DOM order (excludes the header row). */
function bodyRowNames(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map(row => row.textContent ?? "");
}

afterEach(cleanup);

describe("DataTable", () => {
  test("renders headers and rows", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={r => r.id}
        enableSorting
        enableRowSelection
      />,
    );

    expect(
      screen.getByRole("columnheader", {
        name: /name/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", {
        name: /count/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Avocado")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  test("clicking a sortable header toggles order and aria-sort", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={r => r.id}
        enableSorting
      />,
    );

    const nameHeader = screen.getByRole("columnheader", {
      name: /name/i,
    });
    expect(nameHeader).toHaveAttribute("aria-sort", "none");

    const sortButton = screen.getByRole("button", {
      name: /name/i,
    });

    // First click → ascending.
    fireEvent.click(sortButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(bodyRowNames()[0]).toContain("Avocado");

    // Second click → descending.
    fireEvent.click(sortButton);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(bodyRowNames()[0]).toContain("Cherry");
  });

  test("row selection marks rows and drives the header checkbox", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={r => r.id}
        enableRowSelection
      />,
    );

    const rowCheckbox = screen.getByLabelText("Select Avocado");
    fireEvent.click(rowCheckbox);

    expect(rowCheckbox.closest("tr")).toHaveAttribute(
      "data-state",
      "selected",
    );

    // Partial selection → header checkbox is indeterminate, not checked.
    const selectAll = screen.getByLabelText("Select all") as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll.checked).toBe(false);

    // Selecting all flips it to checked.
    fireEvent.click(selectAll);
    expect(selectAll.checked).toBe(true);
    expect(
      screen.getAllByRole("row").slice(1).every(row =>
        row.getAttribute("data-state") === "selected"),
    ).toBe(true);
  });

  test("manualSorting leaves data order untouched", () => {
    const sorting: SortingState = [
      {
        id: "name",
        desc: false,
      },
    ];
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowId={r => r.id}
        manualSorting
        sorting={sorting}
        onSortingChange={vi.fn()}
      />,
    );

    // Despite sorting state saying name-asc, manual mode preserves data order.
    expect(bodyRowNames()[0]).toContain("Banana");
  });
});
