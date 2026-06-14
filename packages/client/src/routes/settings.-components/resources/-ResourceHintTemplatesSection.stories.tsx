import type { Meta, StoryObj } from "@storybook/react-vite";

import { ResourceHintTemplatesSection } from "./-ResourceHintTemplatesSection";

import { seededSettingsClient } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

// Reads the singleton settings row for its moduleHintTemplates; seed a client so
// it renders without a network call. Mutations stay inert.
function clientWith(templates = [
  {
    id: "hint-1",
    name: "Course → Chapters → Lessons",
    groupHint: "e.g. Chapter 1",
    moduleHint: "e.g. Lesson 1.1",
  },
]) {
  return seededSettingsClient({
    moduleHintTemplates: templates,
  });
}

const meta = {
  component: ResourceHintTemplatesSection,
  decorators: [queryStubDecorator(clientWith)],
} satisfies Meta<typeof ResourceHintTemplatesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

// One saved template plus the add-template form.
export const Default: Story = {};

// No templates yet — just the add-template form.
export const Empty: Story = {
  decorators: [queryStubDecorator(() => clientWith([]))],
};
