import type { SelectOption } from "@/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { weeklyToRows } from "./weekly";
import { WeeklyScheduleField } from "./WeeklyScheduleField";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import {
  moduleGroupsByResource,
  modulesByResource,
  resourceOptions,
  taskOptions,
} from "@/test-utils/routinesFixtures";

// resource-1 carries a link, so a routine entry pointing at it shows that url as
// its location placeholder (and can offer it when the field holds custom text).
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

// A module group of resource-1 that carries its own link (modules left linkless,
// so narrowing to the group falls back to the group's url).
const moduleGroupsByResourceWithLink = new Map([
  [
    "resource-1",
    [
      {
        value: "group-1",
        label: "Unit 1",
        url: "https://example.com/unit-1",
      },
    ],
  ],
]);

const meta: Meta<typeof WeeklyScheduleField> = {
  component: WeeklyScheduleField,
  args: {
    value: weeklyToRows(undefined),
    onChange: fn(),
    taskOptions,
    resourceOptions,
    moduleGroupsByResource: new Map(),
    modulesByResource: new Map(),
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

// Empty grid: every weekday row is blank. The seven Monday-first day labels render.
export const Empty: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Monday")).toBeInTheDocument();
    await expect(canvas.getByText("Sunday")).toBeInTheDocument();
  },
};

// A populated grid: a task on Monday and a freeform entry on Friday. The type
// selects reflect the stored entries.
export const Populated: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "task",
        id: "task-1",
      },
      5: {
        type: "freeform",
        id: "Stretch for 10 minutes",
      },
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const mondayType = await canvas.findByLabelText("Monday type");
    await expect(mondayType).toHaveValue("task");
    await expect(canvas.getByLabelText("Friday type")).toHaveValue("freeform");
  },
};

// A resource entry on a resource that has a module hierarchy: the module-group
// and module narrowing selects appear. A chosen module reflects its parent group
// in the group select (the group is derived from the module).
export const WithModule: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "resource",
        id: "resource-1",
        moduleId: "module-2",
      },
    }),
    moduleGroupsByResource,
    modulesByResource,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const moduleSelect = await canvas.findByLabelText("Monday module");
    await expect(moduleSelect).toHaveValue("module-2");
    await expect(canvas.getByLabelText("Monday module group")).toHaveValue(
      "group-1",
    );
  },
};

// A resource entry narrowed to a whole group (no specific module): the module
// select is enabled and offers "Whole Group" as its empty option.
export const WholeGroup: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "resource",
        id: "resource-1",
        moduleGroupId: "group-1",
      },
    }),
    moduleGroupsByResource,
    modulesByResource,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("Monday module group")).toHaveValue(
      "group-1",
    );
    const moduleSelect = canvas.getByLabelText("Monday module");
    await expect(moduleSelect).toHaveValue("");
    await expect(moduleSelect).toBeEnabled();
    await expect(within(moduleSelect).getByText("Whole Group")).toBeInTheDocument();
  },
};

// A resource entry on a linked resource whose location already holds custom text:
// rather than overwrite it, the row offers a one-click button to apply the link.
export const OffersLinkWhenLocationFilled: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "resource",
        id: "resource-1",
        location: "my own note",
      },
    }),
    resourceOptions: resourceOptionsWithLink,
  },
  play: async ({
    canvasElement,
    args,
  }) => {
    const canvas = within(canvasElement);
    // The typed location is left untouched; an offer button appears instead.
    await expect(canvas.getByLabelText("Monday location")).toHaveValue(
      "my own note",
    );
    const offer = await canvas.findByLabelText("Monday use resource link");
    await userEvent.click(offer);
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          day: "1",
          location: "https://duolingo.com",
        }),
      ]),
    );
  },
};

// A resource entry with a blank location shows the resource's link as the
// location placeholder (the value stays empty; it's persisted as the link on
// save). No "use link" offer appears, since there's no different value to replace.
export const ShowsResourceLinkAsPlaceholder: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "resource",
        id: "resource-1",
      },
    }),
    resourceOptions: resourceOptionsWithLink,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const location = canvas.getByLabelText("Monday location");
    await expect(location).toHaveValue("");
    await expect(location).toHaveAttribute(
      "placeholder",
      "https://duolingo.com",
    );
    await expect(
      canvas.queryByLabelText("Monday use resource link"),
    ).not.toBeInTheDocument();
  },
};

// Narrowing a resource entry to a linked module group surfaces the group's link
// (which wins over the resource's) as the location placeholder.
export const ShowsNarrowedLinkAsPlaceholder: Story = {
  args: {
    value: weeklyToRows({
      1: {
        type: "resource",
        id: "resource-1",
        moduleGroupId: "group-1",
      },
    }),
    resourceOptions: resourceOptionsWithLink,
    moduleGroupsByResource: moduleGroupsByResourceWithLink,
    modulesByResource,
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Monday location")).toHaveAttribute(
      "placeholder",
      "https://example.com/unit-1",
    );
  },
};
