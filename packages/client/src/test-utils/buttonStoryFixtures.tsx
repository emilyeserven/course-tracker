import { expect, fn, userEvent, within } from "storybook/test";

/**
 * Shared Storybook scaffold for the two near-identical Button story files
 * (`components/button.stories.tsx` and `components/ui/button.stories.tsx`).
 * They document genuinely different Button components, so both files remain —
 * this module just removes the duplicated args, variant args, and play bodies.
 */

interface PlayContext<TArgs = unknown> {
  args: TArgs;
  canvasElement: HTMLElement;
}

/**
 * Default meta args both Button story files share. A function (not a shared
 * object) so each file gets its own `fn()` spy instead of one shared instance.
 */
export function buttonMetaArgs() {
  return {
    children: "Button",
    onClick: fn(),
  };
}

/** Variant arg objects identical across both Button story files. */
export const buttonVariantArgs = {
  secondary: {
    variant: "secondary",
    children: "Secondary",
  },
  destructive: {
    variant: "destructive",
    children: "Delete",
  },
  outline: {
    variant: "outline",
    children: "Outline",
  },
  ghost: {
    variant: "ghost",
    children: "Ghost",
  },
} as const;

// `asChild` renders the child element with the button styling, so the rendered
// node is a link rather than a <button>.
export const asChildArgs = {
  asChild: true,
  children: <a href="/somewhere">Link button</a>,
} as const;

/** Default story play: clicks the button and asserts `onClick` fired. */
export async function clickButtonFiresOnClick({
  args,
  canvasElement,
}: PlayContext<{ onClick?: (...args: never[]) => unknown }>) {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole("button", {
      name: "Button",
    }),
  );
  await expect(args.onClick).toHaveBeenCalled();
}

/** AsChild story play: asserts the child anchor renders as a link. */
export async function expectAsChildRendersLink({
  canvasElement,
}: Pick<PlayContext, "canvasElement">) {
  const canvas = within(canvasElement);
  await expect(
    canvas.getByRole("link", {
      name: "Link button",
    }),
  ).toBeInTheDocument();
}
