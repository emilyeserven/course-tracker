import type { AppSettingsSummary } from "@emstack/types";
import type { Decorator } from "@storybook/react-vite";
import type { QueryClient } from "@tanstack/react-query";

import { expect, userEvent, within } from "storybook/test";

import { QueryStub } from "@/test-utils/QueryStub";
import { RouterStub } from "@/test-utils/RouterStub";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeAppSettings } from "@/test-utils/settingsFixtures";
import { queryKeys } from "@/utils/queryKeys";

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

/**
 * Seeds the settings query (`queryKeys.settings.detail()`) the Readwise/Todoist
 * dialogs read via `useQuery`, so they render the right branch without a
 * network call.
 */
export function seededSettingsClient(
  over: Partial<AppSettingsSummary> = {},
): QueryClient {
  return seededQueryClient([
    [queryKeys.settings.detail(), makeAppSettings(over)],
  ]);
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

/** Asserts the configured branch: title + input field + submit button. */
export function expectConfiguredForm({
  title,
  field,
  submit,
}: {
  title: string;
  field: string;
  submit: string;
}) {
  return async () => {
    const body = within(document.body);
    await expect(await body.findByText(title)).toBeInTheDocument();
    await expect(await body.findByLabelText(field)).toBeInTheDocument();
    await expect(
      await body.findByRole("button", {
        name: submit,
      }),
    ).toBeInTheDocument();
  };
}

/**
 * Asserts the unconfigured branch: title + the "add an API key in Settings"
 * helper text + the Settings link. (The footer's "Close" button shares its
 * accessible name with the dialog's built-in X, so we assert on the link +
 * helper text, which are unique to this branch.)
 */
export function expectSettingsPrompt({
  title,
  provider,
}: {
  title: string;
  provider: string;
}) {
  return async () => {
    const body = within(document.body);
    await expect(await body.findByText(title)).toBeInTheDocument();
    await expect(
      await body.findByText(new RegExp(`Add a ${provider} API key in`)),
    ).toBeInTheDocument();
    await expect(
      await body.findByRole("link", {
        name: "Settings",
      }),
    ).toBeInTheDocument();
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
