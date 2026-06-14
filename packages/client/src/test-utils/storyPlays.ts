import type { StoryContext } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

/**
 * Shared Storybook `play` functions for primitive-component stories that repeat
 * the same smoke-test shell (checkbox toggle/disabled, textbox typing/disabled,
 * portal-dialog confirm). Assign them to a story's `play` so each story keeps
 * only its unique args while the interaction body lives in one place.
 *
 * Typed against the default `StoryContext` (index-signature `args`) so a single
 * helper is assignable to any concrete `StoryObj<typeof meta>["play"]`.
 */
type Play = (context: StoryContext) => Promise<void>;

/** Unchecked → click → `onCheckedChange(true)`. One checkbox per canvas, so no name needed. */
export const playToggleCheckbox: Play = async ({
  canvasElement, args,
}) => {
  const canvas = within(canvasElement);
  const checkbox = canvas.getByRole("checkbox");
  await expect(checkbox).not.toBeChecked();
  await userEvent.click(checkbox);
  await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
};

/** The checkbox renders in its checked state. */
export const playExpectChecked: Play = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("checkbox")).toBeChecked();
};

/** The sole control of `role` renders disabled. */
export function playExpectDisabled(role: "checkbox" | "textbox"): Play {
  return async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole(role)).toBeDisabled();
  };
}

/** Typing `text` into the textbox updates its value. */
export function playTypeIntoTextbox(text: string): Play {
  return async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, text);
    await expect(input).toHaveValue(text);
  };
}

/**
 * Clicks the named button in a dialog that portals to `document.body` and
 * asserts the story's `onConfirm` handler ran.
 */
export function playClickDialogButton(name: string): Play {
  return async ({
    args,
  }) => {
    const body = within(document.body);
    await userEvent.click(
      await body.findByRole("button", {
        name,
      }),
    );
    await expect(args.onConfirm).toHaveBeenCalled();
  };
}
