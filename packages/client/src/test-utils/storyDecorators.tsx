import type { Decorator } from "@storybook/react-vite";
import type { QueryClient } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

type ClientSource = QueryClient | (() => QueryClient);

/**
 * Wrap a story in `QueryStub`. Pass a factory (not an instance) to get a fresh
 * seeded client per render; omit `client` for the loading-state stub. `options`
 * nest the story in `RouterStub` and/or a width-constraining wrapper div.
 */
export function queryStubDecorator(
  client?: ClientSource,
  options: { router?: boolean;
    className?: string; } = {},
): Decorator {
  const {
    router = false, className,
  } = options;
  return function QueryStubWrapper(Story) {
    const resolved = typeof client === "function" ? client() : client;
    let content = <Story />;
    if (className) {
      content = <div className={className}>{content}</div>;
    }
    content = <QueryStub client={resolved}>{content}</QueryStub>;
    if (router) {
      content = <RouterStub>{content}</RouterStub>;
    }
    return content;
  };
}

/** RouterStub-only wrapper, for metas whose variants add their own QueryStub. */
export function routerStubDecorator(): Decorator {
  return function RouterStubWrapper(Story) {
    return (
      <RouterStub>
        <Story />
      </RouterStub>
    );
  };
}

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
