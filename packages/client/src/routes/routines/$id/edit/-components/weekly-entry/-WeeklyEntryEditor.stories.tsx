import type { SelectOption } from "@/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { WeeklyEntryEditor } from "./-WeeklyEntryEditor";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import {
  resourceOptions,
  taskOptions,
} from "@/test-utils/routinesFixtures";

// resource-1 carries a link, so a daily entry pointing at it can offer/autofill
// that url into its location field.
const resourceOptionsWithLink: SelectOption[] = [
  {
    value: "resource-1",
    label: "Duolingo Spanish",
    url: "https://duolingo.com",
  },
  {
    value: "resource-2",
    label: "SICP",
  },
];

const meta: Meta<typeof WeeklyEntryEditor> = {
  component: WeeklyEntryEditor,
  args: {
    type: "task",
    id: "task-1",
    notes: "",
    location: "",
    prependText: "",
    appendText: "",
    onChange: fn(),
    taskOptions,
    resourceOptions,
  },
  // Always renders QuickAddResourceDialog (useNavigate + useQueryClient +
  // useMutation), so both a router and a query client are required.
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

export const TaskEntry: Story = {};

export const ResourceEntry: Story = {
  args: {
    type: "resource",
    id: "resource-1",
  },
};

export const Freeform: Story = {
  args: {
    type: "freeform",
    id: "Stretch for 10 minutes",
  },
};

// Prepend/append text around a resolved item name renders the actionable-sentence
// preview.
export const WithPreview: Story = {
  args: {
    type: "task",
    id: "task-1",
    prependText: "Review",
    appendText: "for 10 minutes",
  },
};

// type "" (None): the meta/notes inputs collapse to just the type select.
export const None: Story = {
  args: {
    type: "",
    id: "",
  },
};

// A resource entry on a linked resource whose location already holds custom text:
// the editor offers a one-click button to apply the resource's link rather than
// overwriting what the user typed.
export const OffersLinkWhenLocationFilled: Story = {
  args: {
    type: "resource",
    id: "resource-1",
    location: "my own note",
    resourceOptions: resourceOptionsWithLink,
  },
  play: async ({
    canvasElement,
    args,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Daily task location")).toHaveValue(
      "my own note",
    );
    const offer = await canvas.findByLabelText("Daily task use resource link");
    await userEvent.click(offer);
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "https://duolingo.com",
      }),
    );
  },
};
