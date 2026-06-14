import { expect, userEvent, within } from "storybook/test";

interface PlayContext { canvasElement: HTMLElement }

/**
 * Smoke-test play asserting each named text is present. The first is awaited
 * (findByText) so it waits for async render; the rest are synchronous (getByText).
 */
export function smokeText(...names: (string | RegExp)[]) {
  return async ({
    canvasElement,
  }: PlayContext) => {
    const canvas = within(canvasElement);
    for (const [i, name] of names.entries()) {
      const el = i === 0 ? await canvas.findByText(name) : canvas.getByText(name);
      await expect(el).toBeInTheDocument();
    }
  };
}

/** Like {@link smokeText} but matches by `link` role / accessible name. */
export function smokeLink(...names: (string | RegExp)[]) {
  return async ({
    canvasElement,
  }: PlayContext) => {
    const canvas = within(canvasElement);
    for (const [i, name] of names.entries()) {
      const el
        = i === 0
          ? await canvas.findByRole("link", {
            name,
          })
          : canvas.getByRole("link", {
            name,
          });
      await expect(el).toBeInTheDocument();
    }
  };
}

type Canvas = ReturnType<typeof within>;
type RoleMatcher = Parameters<Canvas["findByRole"]>[0];

/**
 * A single "is this rendered?" assertion, identified by query kind. Mirrors the
 * Testing Library `findBy*` queries the stories already used by hand. Use when a
 * story mixes query kinds (heading + text + button); reach for {@link smokeText}
 * / {@link smokeLink} when every assertion is the same kind.
 */
export type SmokeMatcher
  = | { text: string | RegExp }
    | { role: RoleMatcher;
      name?: string | RegExp; }
      | { displayValue: string | RegExp }
      | { placeholder: string | RegExp };

function resolve(canvas: Canvas, matcher: SmokeMatcher) {
  if ("text" in matcher) return canvas.findByText(matcher.text);
  if ("displayValue" in matcher) {
    return canvas.findByDisplayValue(matcher.displayValue);
  }
  if ("placeholder" in matcher) {
    return canvas.findByPlaceholderText(matcher.placeholder);
  }
  return canvas.findByRole(
    matcher.role,
    matcher.name
      ? {
        name: matcher.name,
      }
      : undefined,
  );
}

/**
 * Builds a CSF3 `play` smoke test that asserts each matcher resolves and is in
 * the document. `findBy*` is used for every matcher so it tolerates async
 * first-render. Use for render-only stories; keep interaction-heavy plays
 * (clicks, multi-step flows, custom assertions) hand-written.
 */
export function smokePlay(matchers: SmokeMatcher[]) {
  return async ({
    canvasElement,
  }: PlayContext) => {
    const canvas = within(canvasElement);
    for (const matcher of matchers) {
      await expect(await resolve(canvas, matcher)).toBeInTheDocument();
    }
  };
}

/**
 * Builds a CSF3 `play` that clicks a button and asserts the story's `onChange`
 * arg fired with the expected value — the shared shape of the view-mode toggle
 * interaction stories.
 */
export function clickButtonExpectChange(
  buttonName: string | RegExp,
  expected: unknown,
) {
  return async ({
    args,
    canvasElement,
  }: PlayContext & {
    args: { onChange: (...callArgs: never[]) => unknown };
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: buttonName,
    }));
    await expect(args.onChange).toHaveBeenCalledWith(expected);
  };
}
