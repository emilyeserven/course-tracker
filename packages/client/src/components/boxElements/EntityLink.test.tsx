import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { EntityLink } from "./EntityLink";

import { RouterStub } from "@/test-utils/RouterStub";

// `RouterStub` mounts its children once the router finishes its initial load
// (in an effect), so every assertion waits via an async `findBy*` query first.
describe("EntityLink", () => {
  test("renders a link with its children", async () => {
    render(
      <RouterStub>
        <EntityLink
          entity="topics"
          id={1}
        >React
        </EntityLink>
      </RouterStub>,
    );
    expect(
      await screen.findByRole("link", {
        name: "React",
      }),
    ).toBeInTheDocument();
  });

  test("forwards a custom className and the title attribute", async () => {
    render(
      <RouterStub>
        <EntityLink
          entity="resources"
          id={7}
          className="rounded-sm"
          title="Open"
        >
          Course
        </EntityLink>
      </RouterStub>,
    );
    const link = await screen.findByRole("link", {
      name: "Course",
    });
    expect(link.className).toContain("rounded-sm");
    expect(link).toHaveAttribute("title", "Open");
  });
});
