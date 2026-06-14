import type { Meta, StoryObj } from "@storybook/react-vite";

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
};

export const ResourceEntry: Story = {
  args: {
    entry: makeReferenceItem({
      type: "resource",
      id: "resource-1",
    }),
  },
};

export const Freeform: Story = {
  args: {
    entry: makeReferenceItem({
      type: "freeform",
      id: "Stretch for 10 minutes",
      prependText: "Then",
    }),
  },
};

// Compact form (showMeta: false) renders only the actionable sentence — no TYPE
// badge, notes, or location.
export const Compact: Story = {
  args: {
    entry: makeReferenceItem({
      type: "task",
      id: "task-1",
      notes: "Hidden in compact form.",
      location: "Hidden too",
    }),
    showMeta: false,
  },
};
