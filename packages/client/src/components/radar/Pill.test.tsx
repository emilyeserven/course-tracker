import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Pill } from "./Pill";

describe("Pill", () => {
  test("renders its children", () => {
    render(<Pill>New topic</Pill>);
    expect(screen.getByText("New topic")).toBeInTheDocument();
  });

  test("merges a custom className, letting it override base styles", () => {
    render(
      <Pill className="rounded-sm bg-emerald-100 text-[10px]">New topic</Pill>,
    );
    const pill = screen.getByText("New topic");
    // tailwind-merge keeps the later, conflicting utilities and drops the base.
    expect(pill.className).toContain("rounded-sm");
    expect(pill.className).not.toContain("rounded-full");
    expect(pill.className).toContain("text-[10px]");
    expect(pill.className).not.toContain("text-xs");
  });

  test("forwards native span attributes", () => {
    render(<Pill title="Hidden from radar chart">Side panel</Pill>);
    expect(screen.getByText("Side panel")).toHaveAttribute(
      "title",
      "Hidden from radar chart",
    );
  });
});
