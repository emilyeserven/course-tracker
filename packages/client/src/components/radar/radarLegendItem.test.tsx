import type { RadarBlip } from "@emstack/types";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { BlipLegendItem, BlipLegendSection } from "./radarLegendItem";

import { RouterStub } from "@/test-utils/RouterStub";

function makeBlip(overrides: Partial<RadarBlip> = {}): RadarBlip {
  return {
    id: "blip-1",
    domainId: "domain-1",
    quadrantId: "q-1",
    ringId: "r-1",
    topicId: "topic-1",
    topicName: "Kubernetes",
    ...overrides,
  };
}

const noopHandlers = {
  registerRef: vi.fn(),
  onHover: vi.fn(),
  onBlipClick: vi.fn(),
  onDescriptionChange: vi.fn(),
};

function renderSection(
  props: Partial<React.ComponentProps<typeof BlipLegendSection>> = {},
) {
  return render(
    <RouterStub>
      <BlipLegendSection
        title="Tools"
        headingClassName="heading"
        items={[]}
        activeBlipId={null}
        selectedBlipId={null}
        {...noopHandlers}
        {...props}
      />
    </RouterStub>,
  );
}

// `RouterStub` mounts its children once the router finishes its initial load
// (in an effect), so every assertion waits via an async `findBy*` query first.
describe("BlipLegendSection", () => {
  test("renders the heading and one row per item", async () => {
    const a = makeBlip({
      id: "a",
      topicName: "Alpha",
    });
    const b = makeBlip({
      id: "b",
      topicName: "Beta",
    });
    renderSection({
      items: [
        {
          blip: a,
          label: <span>Alpha</span>,
        },
        {
          blip: b,
          label: <span>Beta</span>,
        },
      ],
    });
    expect(await screen.findByRole("heading", {
      name: "Tools",
    })).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  test("shows the empty message when there are no items", async () => {
    renderSection({
      items: [],
      emptyMessage: "No blips yet.",
    });
    expect(await screen.findByText("No blips yet.")).toBeInTheDocument();
  });

  test("omits the empty message when none is provided", async () => {
    renderSection({
      items: [],
    });
    await screen.findByRole("heading", {
      name: "Tools",
    });
    expect(screen.queryByText("No blips yet.")).not.toBeInTheDocument();
  });

  test("applies inline heading styles", async () => {
    renderSection({
      title: "Tools",
      headingStyle: {
        color: "rgb(255, 0, 0)",
      },
    });
    expect(await screen.findByRole("heading", {
      name: "Tools",
    })).toHaveStyle({
      color: "rgb(255, 0, 0)",
    });
  });
});

describe("BlipLegendItem", () => {
  test("renders its label and fires onBlipClick", async () => {
    const onBlipClick = vi.fn();
    render(
      <RouterStub>
        <ul>
          <BlipLegendItem
            blip={makeBlip()}
            label={<span>Kubernetes</span>}
            isActive={false}
            isSelected={false}
            {...noopHandlers}
            onBlipClick={onBlipClick}
          />
        </ul>
      </RouterStub>,
    );
    fireEvent.click(await screen.findByText("Kubernetes"));
    expect(onBlipClick).toHaveBeenCalledTimes(1);
  });

  test("renders the description subtext when present", async () => {
    render(
      <RouterStub>
        <ul>
          <BlipLegendItem
            blip={makeBlip({
              description: "A container orchestrator",
            })}
            label={<span>Kubernetes</span>}
            isActive={false}
            isSelected={false}
            {...noopHandlers}
          />
        </ul>
      </RouterStub>,
    );
    expect(
      await screen.findByText("A container orchestrator"),
    ).toBeInTheDocument();
  });
});
