import type { Meta, StoryObj } from "@storybook/react-vite";

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
export const Default: Story = {};

// The empty state prompts the user to create one.
export const Empty: Story = {
  decorators: [queryStubDecorator(() => clientWith([]))],
};
