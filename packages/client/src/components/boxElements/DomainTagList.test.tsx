import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { DomainTagList } from "./DomainTagList";

describe("DomainTagList", () => {
  test("renders a tag for each domain title", () => {
    render(
      <DomainTagList
        domains={[
          {
            id: "1",
            title: "Frontend",
          },
          {
            id: "2",
            title: "Design",
          },
        ]}
      />,
    );
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  test("skips domains without a defined id", () => {
    render(
      <DomainTagList
        domains={[
          {
            id: undefined as unknown as string,
            title: "Ghost",
          },
          {
            id: "2",
            title: "Design",
          },
        ]}
      />,
    );
    expect(screen.queryByText("Ghost")).not.toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  test("renders the fallback when there are no valid domains", () => {
    render(
      <DomainTagList
        domains={[]}
        fallback={<span>None</span>}
      />,
    );
    expect(screen.getByText("None")).toBeInTheDocument();
  });

  test("renders nothing by default when empty", () => {
    const {
      container,
    } = render(<DomainTagList domains={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
