import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  test("renders its children", () => {
    render(<Badge>New topic</Badge>);
    expect(screen.getByText("New topic")).toBeInTheDocument();
  });

  test("merges a custom className, letting it override base styles", () => {
    render(
      <Badge className="rounded-sm bg-emerald-100 text-[10px]">New topic</Badge>,
    );
    const badge = screen.getByText("New topic");
    // tailwind-merge keeps the later, conflicting utilities and drops the base.
    expect(badge.className).toContain("rounded-sm");
    expect(badge.className).not.toContain("rounded-md");
    expect(badge.className).toContain("text-[10px]");
    expect(badge.className).not.toContain("text-xs");
  });

  test("forwards native span attributes", () => {
    render(<Badge title="Hidden from radar chart">Side panel</Badge>);
    expect(screen.getByText("Side panel")).toHaveAttribute(
      "title",
      "Hidden from radar chart",
    );
  });

  test("renders as the child element when asChild is set", () => {
    render(
      <Badge asChild>
        <a href="/topics">Topic link</a>
      </Badge>,
    );
    const link = screen.getByRole("link", {
      name: "Topic link",
    });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link.className).toContain("rounded-md");
  });
});
