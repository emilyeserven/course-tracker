import type { Meta, StoryObj } from "@storybook/react-vite";

import { toast } from "sonner";
import { expect, userEvent, within } from "storybook/test";

import { Toaster } from "./sonner";

import { Button } from "@/components/ui/button";

// The Toaster renders toasts in a portal; a trigger button fires one so the
// story has something to assert.
function ToasterDemo() {
  return (
    <>
      <Button onClick={() => toast.success("Saved your changes")}>
        Notify
      </Button>
      <Toaster />
    </>
  );
}

const meta: Meta<typeof ToasterDemo> = {
  component: ToasterDemo,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ShowsToast: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Notify",
    }));
    const body = within(document.body);
    await expect(
      await body.findByText("Saved your changes"),
    ).toBeInTheDocument();
  },
};
