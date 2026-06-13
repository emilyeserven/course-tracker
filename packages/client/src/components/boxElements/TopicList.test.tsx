import type { Topic } from "@emstack/types";

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { TopicList } from "./TopicList";

import { RouterStub } from "@/test-utils/RouterStub";

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: "1",
    name: "React",
    ...overrides,
  };
}

// `RouterStub` mounts its children once the router finishes its initial load,
// so the first assertion waits via an async `findBy*` query.
describe("TopicList", () => {
  test("renders a pill link per topic in pill mode", async () => {
    render(
      <RouterStub>
        <TopicList
          topics={[makeTopic(), makeTopic({
            id: "2",
            name: "Vue",
          })]}
        />
      </RouterStub>,
    );
    const link = await screen.findByRole("link", {
      name: "React",
    });
    expect(link.className).toContain("rounded-md");
    expect(screen.getByRole("link", {
      name: "Vue",
    })).toBeInTheDocument();
  });

  test("renders inline comma-separated links when isPills is false", async () => {
    render(
      <RouterStub>
        <TopicList
          isPills={false}
          topics={[makeTopic(), makeTopic({
            id: "2",
            name: "Vue",
          })]}
        />
      </RouterStub>,
    );
    const link = await screen.findByRole("link", {
      name: "React",
    });
    expect(link.className).not.toContain("rounded-md");
    // The non-pill branch joins all but the last item with a comma.
    expect(screen.getByText(",", {
      exact: false,
    })).toBeInTheDocument();
  });
});
