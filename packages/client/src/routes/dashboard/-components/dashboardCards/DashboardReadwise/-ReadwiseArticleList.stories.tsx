import type { ReadwiseDocument } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReadwiseArticleList } from "./-ReadwiseArticleList";

const docs: ReadwiseDocument[] = [
  {
    id: "d1",
    title: "The cost of context switching",
    author: "Jane Doe",
    siteName: "example.com",
    url: "https://example.com/context-switching",
    wordCount: 1800,
    summary: null,
    imageUrl: null,
    readingProgress: 0.42,
  },
  {
    id: "d2",
    title: "An untitled draft with no metadata",
    author: null,
    siteName: null,
    url: "",
    wordCount: null,
    summary: null,
    imageUrl: null,
    readingProgress: 0,
  },
];

const meta: Meta<typeof ReadwiseArticleList> = {
  component: ReadwiseArticleList,
  args: {
    docs,
    showProgress: true,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WithProgress: Story = {};

export const WithoutProgress: Story = {
  args: {
    showProgress: false,
  },
};
