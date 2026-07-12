import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { RoutineTemplateEditModal } from "./-RoutineTemplateEditModal";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import {
  makeRoutineTemplate,
  taskOptions,
} from "@/test-utils/routinesFixtures";

const meta: Meta<typeof RoutineTemplateEditModal> = {
  component: RoutineTemplateEditModal,
  args: {
    open: true,
    template: makeRoutineTemplate(),
    onOpenChange: fn(),
    onSave: fn(),
    onDelete: fn(),
    taskOptions,
  },
  // The embedded WeeklyScheduleField renders a bookmark picker (useQuery via
  // useNavigate + useQueryClient), so both a router and a query client are required.
  decorators: [
    Story => (
      <RouterStub>
        <QueryStub>
          <Story />
        </QueryStub>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Editing an existing template: "Edit" title, the label prefilled, and a Remove
// button (onDelete provided, not new). Dialog content portals to document.body.
export const EditExisting: Story = {};

// Adding a new template: "Add" title and no Remove button (isNew suppresses it).
export const AddNew: Story = {
  args: {
    isNew: true,
    template: makeRoutineTemplate({
      label: "",
      weekly: {},
    }),
  },
};
