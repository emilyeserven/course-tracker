import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { DomainPill } from "./DomainPill";

describe("DomainPill", () => {
  test("renders its children", () => {
    render(<DomainPill>Frontend</DomainPill>);
    expect(screen.getByText("Frontend")).toBeInTheDocument();
  });

  test("merges a custom className, letting it override base styles", () => {
    render(<DomainPill className="bg-emerald-100 text-[10px]">Frontend</DomainPill>);
    const pill = screen.getByText("Frontend");
    // tailwind-merge keeps the later, conflicting utilities and drops the base.
    expect(pill.className).toContain("bg-emerald-100");
    expect(pill.className).not.toContain("bg-gray-100");
    expect(pill.className).toContain("text-[10px]");
    expect(pill.className).not.toContain("text-xs");
  });

  test("forwards native span attributes", () => {
    render(<DomainPill title="Domain">Frontend</DomainPill>);
    expect(screen.getByText("Frontend")).toHaveAttribute("title", "Domain");
  });
});
