import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { CourseMetaItem } from "./CourseMetaItem";

describe("CourseMetaItem", () => {
  test("renders nothing when condition is falsy", () => {
    const {
      container,
    } = render(
      <CourseMetaItem
        value="hidden"
        condition={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("renders the value when present", () => {
    render(
      <CourseMetaItem
        value="$49"
        condition
        iconNode={<span>icon</span>}
      />,
    );
    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText("icon")).toBeInTheDocument();
  });

  test("falls back to italic empty text when value is null or empty", () => {
    render(
      <CourseMetaItem
        value={null}
        condition
        emptyText="No cost given"
      />,
    );
    expect(screen.getByText("No cost given")).toBeInTheDocument();
  });
});
