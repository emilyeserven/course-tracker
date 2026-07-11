import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, userEvent, within } from "storybook/test";

import { ModuleSuggestDialog } from "./ModuleSuggestDialog";

import { QueryStub } from "@/test-utils/QueryStub";

const meta: Meta<typeof ModuleSuggestDialog> = {
  component: ModuleSuggestDialog,
  args: {
    open: true,
    onOpenChange: fn(),
    resourceId: "resource-1",
    resourceName: "Intro to TypeScript",
    resourceDescription: "A practical introduction.",
    resourceUrl: "https://example.com/course",
    providerName: "Acme Learning",
    existingGroupNames: [],
    existingUngroupedModuleNames: [],
    onApplied: fn(),
  },
  decorators: [
    Story => (
      <QueryStub>
        <Story />
      </QueryStub>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  // The Radix DialogContent portals to document.body, so assert against it
  // rather than the canvas element.
  play: async () => {
    const body = within(document.body);
    await expect(
      await body.findByText("LLM Assist — Modules for \"Intro to TypeScript\""),
    ).toBeInTheDocument();
    await expect(
      body.getByRole("button", {
        name: "Parse and Review",
      }),
    ).toBeInTheDocument();
  },
};

export const ReviewState: Story = {
  // Paste a valid suggestion JSON and parse it to reach the review step.
  play: async () => {
    const body = within(document.body);
    const textarea = await body.findByPlaceholderText(
      "{\"moduleGroups\": [...], \"ungroupedModules\": [...], \"notes\": null}",
    );
    await userEvent.click(textarea);
    await userEvent.paste(
      JSON.stringify({
        moduleGroups: [
          {
            name: "Basics",
            description: "Start here.",
            location: null,
            modules: [
              {
                name: "Hello World",
                description: null,
                location: null,
                length: "short",
              },
            ],
          },
        ],
        ungroupedModules: [],
        notes: null,
      }),
    );
    await userEvent.click(
      body.getByRole("button", {
        name: "Parse and Review",
      }),
    );
    await expect(await body.findByText("Basics")).toBeInTheDocument();
  },
};
