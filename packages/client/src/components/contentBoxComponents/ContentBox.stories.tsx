import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import {
  ContentBox,
  ContentBoxBody,
  ContentBoxFooter,
  ContentBoxHeader,
  ContentBoxHeaderBar,
  ContentBoxTitle,
} from "./ContentBox";

const meta: Meta<typeof ContentBox> = {
  component: ContentBox,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Composed: Story = {
  render: () => (
    <ContentBox className="max-w-sm">
      <ContentBoxHeader>
        <ContentBoxHeaderBar>
          <span className="text-xs">Header bar</span>
        </ContentBoxHeaderBar>
        <ContentBoxTitle>
          <h3 className="text-xl">Card title</h3>
        </ContentBoxTitle>
      </ContentBoxHeader>
      <ContentBoxBody>
        <p>Body content goes here.</p>
      </ContentBoxBody>
      <ContentBoxFooter>
        <span className="text-sm">Footer</span>
      </ContentBoxFooter>
    </ContentBox>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Card title")).toBeInTheDocument();
    await expect(
      canvas.getByText("Body content goes here."),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Footer")).toBeInTheDocument();
  },
};
