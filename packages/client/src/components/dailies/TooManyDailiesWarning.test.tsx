import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TooManyDailiesWarning } from "./TooManyDailiesWarning";

describe("TooManyDailiesWarning", () => {
  test("renders nothing when under the limit", () => {
    const {
      container,
    } = render(
      <TooManyDailiesWarning
        activeCount={3}
        limit={5}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the count over the limit once reached", () => {
    render(
      <TooManyDailiesWarning
        activeCount={6}
        limit={5}
      />,
    );
    const badge = screen.getByRole("status", {
      name: "Too many active dailies",
    });
    expect(badge).toHaveTextContent("6 / 5");
  });

  test("renders via Pill but overrides rounded-full -> rounded-md", () => {
    render(
      <TooManyDailiesWarning
        activeCount={5}
        limit={5}
      />,
    );
    const badge = screen.getByRole("status");
    expect(badge.className).toContain("rounded-md");
    expect(badge.className).not.toContain("rounded-full");
  });
});
