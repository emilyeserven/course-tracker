import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import {
  ClearFiltersButton,
  FilterSelect,
  ListEmptyStates,
  ListSearchInput,
} from "./ListPageControls";

// This file exports several list-filter-bar primitives. `meta.component` is the
// search input; the others are exercised via per-story `render`.
const meta: Meta<typeof ListSearchInput> = {
  component: ListSearchInput,
  args: {
    placeholder: "Search resources...",
    value: "",
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const SearchInput: Story = {
  play: async ({
    args, canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("Search resources...");
    await userEvent.type(input, "react");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

// Radix Select-based filter dropdown. Its options render in a body portal only
// once opened, so the closed-state smoke test asserts the trigger.
export const Filter: Story = {
  render: () => (
    <FilterSelect
      placeholder="Filter by topic"
      value={undefined}
      onChange={fn()}
      allLabel="All topics"
      totalCount={42}
      options={[
        {
          value: "react",
          label: "React",
          count: 12,
        },
        {
          value: "css",
          label: "CSS",
          count: 7,
        },
      ]}
    />
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("combobox")).toBeInTheDocument();
  },
};

export const ClearFilters: Story = {
  render: () => <ClearFiltersButton onClick={fn()} />,
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Clear filters",
      }),
    ).toBeInTheDocument();
  },
};

// No items at all.
export const EmptyNoneYet: Story = {
  render: () => (
    <ListEmptyStates
      entityLabel="resources"
      total={0}
      filteredCount={0}
    />
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/No resources yet/)).toBeInTheDocument();
  },
};

// Items exist, but none match the active filters.
export const EmptyNoMatch: Story = {
  render: () => (
    <ListEmptyStates
      entityLabel="resources"
      total={10}
      filteredCount={0}
    />
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/No resources match your filters/),
    ).toBeInTheDocument();
  },
};
