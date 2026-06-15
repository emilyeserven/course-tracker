import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutineEntryLabel } from "./RoutineEntryLabel";

import { RouterStub } from "@/test-utils/RouterStub";
import {
  makeReferenceItem,
  moduleGroupNames,
  moduleNames,
  resourceNames,
  taskNames,
} from "@/test-utils/routinesFixtures";

const meta = {
  component: RoutineEntryLabel,
  args: {
    entry: makeReferenceItem(),
    taskNames,
    resourceNames,
    moduleNames,
    moduleGroupNames,
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

// A resource entry narrowed to a specific module shows the module name in place
// of the resource name.
export const ResourceModuleEntry: Story = {
  args: {
    entry: makeReferenceItem({
      type: "resource",
      id: "resource-1",
      moduleId: "module-2",
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
