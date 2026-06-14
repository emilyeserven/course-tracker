import { expect, within } from "storybook/test";

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
