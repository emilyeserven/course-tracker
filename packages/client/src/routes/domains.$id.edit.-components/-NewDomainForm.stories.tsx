import type { Meta, StoryObj } from "@storybook/react-vite";

import { NewDomainForm } from "./-NewDomainForm";

import { routerStoryDecorator } from "@/test-utils/storyDecorators";
import { smokePlay } from "@/test-utils/storyPlay";

const meta = {
  component: NewDomainForm,
  decorators: [routerStoryDecorator()],
} satisfies Meta<typeof NewDomainForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// The empty create form: title/description fields and the create action. We
// don't submit — that would call createDomain and navigate.
export const Default: Story = {
  play: smokePlay([
    {
      role: "heading",
      name: /new domain/i,
    },
    {
      text: "Domain Title",
    },
    {
      role: "button",
      name: /create domain/i,
    },
  ]),
};
