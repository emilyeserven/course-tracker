import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { RoutineTemplatesSection } from "./-RoutineTemplatesSection";

import { QueryStub } from "@/test-utils/QueryStub";
import { makeRoutineTemplate } from "@/test-utils/routinesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";

function clientWith(templates = [makeRoutineTemplate()]) {
  return seededQueryClient([
    [["routineTemplates"], templates],
    // The edit modal's option lists; empty is fine for the section render.
    [["tasks"], []],
    [["resources"], []],
  ]);
}

const meta = {
  component: RoutineTemplatesSection,
  decorators: [
    Story => (
      <QueryStub client={clientWith()}>
        <Story />
      </QueryStub>
    ),
  ],
} satisfies Meta<typeof RoutineTemplatesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// A saved routine template with its scheduled-day count.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: /routine templates/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Summer Japanese")).toBeInTheDocument();
  },
};

// The empty state prompts the user to create one.
export const Empty: Story = {
  decorators: [
    Story => (
      <QueryStub client={clientWith([])}>
        <Story />
      </QueryStub>
    ),
  ],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no templates yet/i)).toBeInTheDocument();
  },
};
