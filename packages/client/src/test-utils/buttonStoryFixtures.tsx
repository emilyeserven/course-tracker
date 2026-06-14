import { fn } from "storybook/test";

/**
 * Shared Storybook scaffold for the Button story file
 * (`components/ui/button.stories.tsx`): the default meta args, the per-variant
 * args, and the `asChild` args, kept here so the story file stays declarative.
 */

/**
 * Default meta args the Button stories share. A function (not a shared object)
 * so each use gets its own `fn()` spy instead of one shared instance.
 */
export function buttonMetaArgs() {
  return {
    children: "Button",
    onClick: fn(),
  };
}

/** Variant arg objects for the Button variant stories. */
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
