import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, within } from "storybook/test";

import { BlipDisplayRow } from "./BlipDisplayRow";

import { Table, TableBody } from "@/components/ui/table";
import {
  byId,
  makeBlip,
  makeQuadrants,
  makeRings,
  makeTopics,
} from "@/test-utils/radarFixtures";
import { RouterStub } from "@/test-utils/RouterStub";

const meta: Meta<typeof BlipDisplayRow> = {
  component: BlipDisplayRow,
  args: {
    blip: makeBlip({
      id: "blip-0",
      topicId: "topic-0",
      topicName: "Kubernetes",
      quadrantId: "q1",
      ringId: "r0",
      description: "Standardized across teams",
    }),
    topic: makeTopics()[0],
    quadrantById: byId(makeQuadrants()),
    ringById: byId(makeRings()),
    isSelected: false,
    isPending: false,
    editingLocked: false,
    showItemsColumn: true,
    onToggleSelected: fn(),
    onStartEdit: fn(),
    onToggleIgnore: fn(),
    onRemove: fn(),
  },
  decorators: [
    Story => (
      <RouterStub>
        <Table>
          <TableBody>
            <Story />
          </TableBody>
        </Table>
      </RouterStub>
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
    await expect(await canvas.findByText("Kubernetes")).toBeInTheDocument();
  },
};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const Ignored: Story = {
  args: {
    blip: makeBlip({
      id: "blip-0",
      topicId: "topic-0",
      topicName: "Kubernetes",
      quadrantId: "q1",
      ringId: "r0",
      isIgnored: true,
    }),
  },
};
