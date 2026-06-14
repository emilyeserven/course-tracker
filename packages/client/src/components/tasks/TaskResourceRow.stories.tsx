import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { TaskResourceRow } from "./TaskResourceRow";

import { RouterStub } from "@/test-utils/RouterStub";
import { makeTaskResource } from "@/test-utils/tasksFixtures";

const meta: Meta<typeof TaskResourceRow> = {
  component: TaskResourceRow,
  args: {
    resource: makeTaskResource({
      name: "Reference docs",
      url: "https://example.com/docs",
      resourceId: null,
    }),
    ease: null,
    time: null,
    interactivity: null,
    linkedLabel: null,
    isAnyEditing: false,
    isMutationPending: false,
    isLogging: false,
    onToggleUsed: fn(),
    onStartEdit: fn(),
    onLogInteraction: fn(),
    onCloseLog: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <table>
          <tbody>
            <Story />
          </tbody>
        </table>
      </RouterStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

/** A freeform (unlinked) resource renders its name and a "Not yet" used toggle. */
export const Unlinked: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Reference docs")).toBeInTheDocument();
    await expect(await canvas.findByText("Not yet")).toBeInTheDocument();
  },
};

/** A linked resource renders its breadcrumb label as a link to the resource. */
export const Linked: Story = {
  args: {
    resource: makeTaskResource({
      name: "Intro to TypeScript",
      resourceId: "resource-1",
      resource: {
        id: "resource-1",
        name: "Intro to TypeScript",
      },
    }),
    linkedLabel: "Intro to TypeScript > Part One > Chapter 1",
    ease: "low",
    time: "medium",
    interactivity: "high",
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", {
        name: "Intro to TypeScript > Part One > Chapter 1",
      }),
    ).toBeInTheDocument();
  },
};

/** A used resource shows the toggle checked with a "Used" label. */
export const Used: Story = {
  args: {
    resource: makeTaskResource({
      name: "Starter repo",
      usedYet: true,
      resourceId: null,
    }),
  },
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Used")).toBeInTheDocument();
  },
};
