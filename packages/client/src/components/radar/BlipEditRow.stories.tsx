import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "@storybook/test";

import { BlipEditRow } from "./BlipEditRow";

import { Table, TableBody } from "@/components/ui/table";
import { makeBlip, makeQuadrants, makeRings } from "@/test-utils/radarFixtures";

const meta: Meta<typeof BlipEditRow> = {
  component: BlipEditRow,
  args: {
    blip: makeBlip({
      id: "blip-0",
      topicName: "Kubernetes",
    }),
    topicDescription: "Container orchestration",
    draft: {
      quadrantId: "q1",
      ringId: "r0",
      description: "Standardized across teams",
      isIgnored: false,
    },
    quadrants: makeQuadrants(),
    rings: makeRings(),
    isPending: false,
    colCount: 6,
    onDraftChange: fn(),
    onCommit: fn(),
    onCancel: fn(),
  },
  decorators: [
    Story => (
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", {
        name: "Kubernetes",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", {
        name: /save/i,
      }),
    ).toBeInTheDocument();
  },
};

export const Ignored: Story = {
  args: {
    draft: {
      quadrantId: "",
      ringId: "",
      description: "Out of scope for now",
      isIgnored: true,
    },
  },
};

export const Pending: Story = {
  args: {
    isPending: true,
  },
};
