import { expect, userEvent, within } from "storybook/test";

/**
 * Reusable Storybook `play` smoke-tests shared by the edit-row / footer story
 * families (EditFormActions, EditModalFooter, TaskResourceEditingRow,
 * TaskTypeEditRow), which all render the same Save / Cancel / Remove controls.
 *
 * Each helper reads only the slice of the story context it needs, and types the
 * callbacks as optional so the full StoryContext — whose `args` declare those
 * callbacks as optional props — stays assignable to these parameter types.
 */

interface CancelArgs { onCancel?: (...args: never[]) => unknown }
interface PlayContext<TArgs = unknown> {
  args: TArgs;
  canvasElement: HTMLElement;
}

/** Clicks the Cancel button and asserts `onCancel` fired. */
export async function clickCancelFiresOnCancel({
  args,
  canvasElement,
}: PlayContext<CancelArgs>) {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole("button", {
      name: "Cancel",
    }),
  );
  await expect(args.onCancel).toHaveBeenCalled();
}

/** Asserts the destructive Remove button is absent (new / unsaved rows). */
export async function expectRemoveHidden({
  canvasElement,
}: Pick<PlayContext, "canvasElement">) {
  const canvas = within(canvasElement);
  await expect(
    canvas.queryByRole("button", {
      name: "Remove",
    }),
  ).not.toBeInTheDocument();
}

/** Asserts the Save button is disabled while saving. */
export async function expectSaveDisabled({
  canvasElement,
}: Pick<PlayContext, "canvasElement">) {
  const canvas = within(canvasElement);
  await expect(
    canvas.getByRole("button", {
      name: "Save",
    }),
  ).toBeDisabled();
}
