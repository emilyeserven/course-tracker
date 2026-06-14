import type { ResourceSelectOption } from "./resourceMeta";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { ResourceLinksPicker } from "./ResourceLinksPicker";

import { makeModule, makeModuleGroup } from "@/test-utils/tasksFixtures";

const courses: ResourceSelectOption[] = [
  {
    id: "resource-1",
    name: "Intro to TypeScript",
  },
  {
    id: "resource-2",
    name: "Advanced React",
  },
];

const moduleGroups = [makeModuleGroup()];
const modules = [makeModule()];

const meta: Meta<typeof ResourceLinksPicker> = {
  component: ResourceLinksPicker,
  args: {
    value: [],
    onChange: fn(),
    courses,
    moduleGroups,
    modules,
  },
  decorators: [
    Story => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

/** No links yet — the empty hint shows and the add button is enabled. */
export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No resource links yet.")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: "Add Resource Link",
      }),
    ).toBeEnabled();
  },
};

/** A populated row exposes the resource/group/module selects and a remove button. */
export const WithRow: Story = {
  args: {
    value: [
      {
        key: "row-1",
        resourceId: "resource-1",
        moduleGroupId: "module-group-1",
        moduleId: null,
      },
    ],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const resourceSelect = canvas.getByLabelText<HTMLSelectElement>("Resource");
    await expect(resourceSelect.value).toBe("resource-1");
    await expect(
      canvas.getByRole("button", {
        name: "Remove link",
      }),
    ).toBeInTheDocument();
  },
};

/** With no linkable courses the add button is disabled. */
export const NoCourses: Story = {
  args: {
    courses: [],
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", {
        name: "Add Resource Link",
      }),
    ).toBeDisabled();
  },
};
