import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { EmptyHint } from "./EmptyHint";

describe("EmptyHint", () => {
  test("renders its children", () => {
    render(<EmptyHint>No topic</EmptyHint>);
    expect(screen.getByText("No topic")).toBeInTheDocument();
  });

  test("applies muted italic styling and merges extra classes", () => {
    render(<EmptyHint className="ml-4">No topic</EmptyHint>);
    const hint = screen.getByText("No topic");
    expect(hint).toHaveClass("text-muted-foreground");
    expect(hint).toHaveClass("italic");
    expect(hint).toHaveClass("ml-4");
  });
});
