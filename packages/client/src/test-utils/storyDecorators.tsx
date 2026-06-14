import type { Decorator } from "@storybook/react-vite";

import { TooltipProvider } from "@/components/ui/tooltip";
import { RouterStub } from "@/test-utils/RouterStub";

/** Bare stub-router wrapper — for stories whose only context need is `<Link>`. */
export const routerDecorator: Decorator = Story => (
  <RouterStub>
    <Story />
  </RouterStub>
);

/**
 * Shared Storybook decorator for the card / table library stories, which all
 * render inside a stub router so their `<Link>`s resolve. Set `tooltip` for
 * cards that use tooltips and `constrained` to preview a card at the ~sidebar
 * width its list renders it at.
 */
export function cardStoryDecorator(
  options: { tooltip?: boolean;
    constrained?: boolean; } = {},
): Decorator {
  const {
    tooltip = false, constrained = false,
  } = options;
  return function CardStoryWrapper(Story) {
    let content = <Story />;
    if (constrained) {
      content = <div className="max-w-sm">{content}</div>;
    }
    if (tooltip) {
      content = <TooltipProvider>{content}</TooltipProvider>;
    }
    return <RouterStub>{content}</RouterStub>;
  };
}
