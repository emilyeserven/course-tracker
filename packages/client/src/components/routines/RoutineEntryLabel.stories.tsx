import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineEntryLabel } from "./RoutineEntryLabel";

import { RouterStub } from "@/test-utils/RouterStub";
import {
  makeReferenceItem,
  resourceNames,
  taskNames,
} from "@/test-utils/routinesFixtures";

const meta = {
  component: RoutineEntryLabel,
  args: {
    entry: makeReferenceItem(),
    taskNames,
    resourceNames,
  },
  // Task/resource entries render an EntityLink (<Link>), so a router is required.
  decorators: [
    Story => (
      <RouterStub>
        <Story />
      </RouterStub>
    ),
  ],
} satisfies Meta<typeof RoutineEntryLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

// A task entry with a note and a location renders the full presentation: a TYPE
// badge, the resolved task name (as a link), the note, and the location.
export const TaskEntry: Story = {
  args: {
    entry: makeReferenceItem({
      type: "task",
      id: "task-1",
      notes: "Focus on the subjunctive.",
      location: "Library, desk 4",
    }),
  },
  // RouterStub mounts children after its initial load, so assert with findBy*.
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Read a chapter")).toBeInTheDocument();
    await expect(canvas.getByText("Focus on the subjunctive.")).toBeInTheDocument();
    await expect(canvas.getByText("Library, desk 4")).toBeInTheDocument();
  },
};

export const ResourceEntry: Story = {
  args: {
    entry: makeReferenceItem({
      type: "resource",
      id: "resource-1",
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Duolingo Spanish"),
    ).toBeInTheDocument();
  },
};
