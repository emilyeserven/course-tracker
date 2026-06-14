import type { Decorator } from "@storybook/react-vite";
import type { QueryClient } from "@tanstack/react-query";

import { expect, userEvent, within } from "storybook/test";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";

/**
 * Shared scaffold for the QuickAdd dialog stories. Each dialog renders inside a
 * stub router (its Settings link is a TanStack `<Link>`) and a query context
 * (the dialogs use `useMutation`/`useQuery`), so they all repeat the same
 * decorator and a small set of portal-aware `play` smoke tests. These helpers
 * collapse that boilerplate; keep each story's unique args/assertions inline.
 */

/**
 * `RouterStub > QueryStub > Story` decorator. Pass a seeded `client` for the
 * settings-aware dialogs (Readwise/Todoist); omit it for the plain
 * mutation+navigate dialogs.
 */
export function routerQueryDecorator(client?: QueryClient): Decorator {
  return function RouterQueryWrapper(Story) {
    return (
      <RouterStub>
        <QueryStub client={client}>
          <Story />
        </QueryStub>
      </RouterStub>
    );
  };
}

// The Radix dialog content portals to document.body, so the play helpers query
// against it rather than the canvas.

/** Asserts the dialog title and each named field render. */
export function expectDialogFields({
  title,
  fields,
}: {
  title: string;
  fields: string[];
}) {
  return async () => {
    const body = within(document.body);
    await expect(await body.findByText(title)).toBeInTheDocument();
    for (const field of fields) {
      await expect(await body.findByLabelText(field)).toBeInTheDocument();
    }
  };
}

/** Clicking Cancel closes the dialog via `onOpenChange(false)`. */
export async function expectCancelClosesDialog({
  args,
}: {
  args: { onOpenChange: (open: boolean) => void };
}) {
  const body = within(document.body);
  await userEvent.click(await body.findByRole("button", {
    name: "Cancel",
  }));
  await expect(args.onOpenChange).toHaveBeenCalledWith(false);
}
