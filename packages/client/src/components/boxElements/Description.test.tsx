import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Description } from "./Description";

describe("Description", () => {
  test("renders the provided description", () => {
    render(<Description description="A great course" />);
    expect(screen.getByText("A great course")).toBeInTheDocument();
  });

  test("shows the default empty text when no description", () => {
    render(<Description description={null} />);
    expect(screen.getByText("No description provided.")).toBeInTheDocument();
  });

  test("shows a custom empty text", () => {
    render(
      <Description
        description=""
        emptyText="Nothing here"
      />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
