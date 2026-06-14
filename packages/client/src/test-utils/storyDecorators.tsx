import type { Decorator } from "@storybook/react-vite";
import type { QueryClient } from "@tanstack/react-query";
import type { ComponentType, ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

/** Bare stub-router wrapper — for stories whose only context need is `<Link>`. */
export const routerDecorator: Decorator = Story => (
  <RouterStub>
    <Story />
  </RouterStub>
);

/**
 * Bare width wrapper for primitive / form-field stories that don't need router
 * or query context — previews the field at the ~sidebar width its form renders
 * it at. Unlike `cardStoryDecorator({ constrained: true })`, it adds no
 * `RouterStub`.
 */
export const constrainedDecorator: Decorator = Story => (
  <div className="max-w-sm">
    <Story />
  </div>
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

/** Wraps the story in a stub router so its `<Link>`s resolve. */
export function routerStoryDecorator(): Decorator {
  return function RouterStoryWrapper(Story) {
    return (
      <RouterStub>
        <Story />
      </RouterStub>
    );
  };
}

/**
 * Wraps the story in a stub router + QueryClientProvider. Pass a
 * `seededQueryClient([...])` when the component reads seeded query data; omit
 * for an empty client.
 */
export function queryStoryDecorator(client?: QueryClient): Decorator {
  return function QueryStoryWrapper(Story) {
    return (
      <RouterStub>
        <QueryStub client={client}>
          <Story />
        </QueryStub>
      </RouterStub>
    );
  };
}

/**
 * Wraps an SVG-child story (e.g. radar blips) in an `<svg>` canvas of the given
 * size, optionally inside a TooltipProvider for blips that show tooltips.
 */
export function svgStoryDecorator(options: {
  width: number;
  height: number;
  tooltip?: boolean;
}): Decorator {
  const {
    width, height, tooltip = false,
  } = options;
  return function SvgStoryWrapper(Story) {
    const svg = (
      <svg
        width={width}
        height={height}
      >
        <Story />
      </svg>
    );
    return tooltip ? <TooltipProvider>{svg}</TooltipProvider> : svg;
  };
}

/** Wraps the story in a width-constrained container (defaults to `max-w-sm`). */
export function constrainedStoryDecorator(className = "max-w-sm"): Decorator {
  return function ConstrainedStoryWrapper(Story) {
    return (
      <div className={className}>
        <Story />
      </div>
    );
  };
}

/** Wraps the story in a single context provider component. */
export function providerStoryDecorator(
  Provider: ComponentType<{ children: ReactNode }>,
): Decorator {
  return function ProviderStoryWrapper(Story) {
    return (
      <Provider>
        <Story />
      </Provider>
    );
  };
}
