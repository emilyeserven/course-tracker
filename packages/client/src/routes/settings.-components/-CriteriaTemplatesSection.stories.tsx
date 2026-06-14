import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { CriteriaTemplatesSection } from "./-CriteriaTemplatesSection";

import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStubDecorator } from "@/test-utils/storyDecorators";
import { makeCriteriaTemplate } from "@/test-utils/templatesFixtures";

function clientWith(templates = [makeCriteriaTemplate()]) {
  return seededQueryClient([[["dailyCriteriaTemplates"], templates]]);
}

const meta = {
  component: CriteriaTemplatesSection,
  decorators: [queryStubDecorator(clientWith)],
} satisfies Meta<typeof CriteriaTemplatesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// A saved criteria template with its goal preview.
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: /status criteria templates/i,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Reading goals")).toBeInTheDocument();
  },
};

// The empty state prompts the user to create one.
export const Empty: Story = {
  decorators: [queryStubDecorator(() => clientWith([]))],
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no templates yet/i)).toBeInTheDocument();
  },
};
