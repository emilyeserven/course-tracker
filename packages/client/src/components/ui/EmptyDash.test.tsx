import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { EmptyDash } from "./EmptyDash";

describe("EmptyDash", () => {
  test("renders an em dash", () => {
    render(<EmptyDash />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  test("is muted by default and merges extra classes", () => {
    render(<EmptyDash className="text-xs" />);
    const dash = screen.getByText("—");
    expect(dash).toHaveClass("text-muted-foreground");
    expect(dash).toHaveClass("text-xs");
  });
});
