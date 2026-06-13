import { render, screen } from "@testing-library/react";
import { CheckSquareIcon } from "lucide-react";
import { describe, expect, test } from "vitest";

import { DailyEntityLink } from "./DailyEntityLink";

import { RouterStub } from "@/test-utils/RouterStub";
import { dailyLinkTooltip } from "@/utils";

describe("dailyLinkTooltip", () => {
  test("returns the go-label when the names match (case/space-insensitive)", () => {
    expect(dailyLinkTooltip("  Read SICP ", "read sicp", "Go to Task")).toBe(
      "Go to Task",
    );
  });

  test("returns the entity name when it differs from the daily", () => {
    expect(dailyLinkTooltip("SICP", "Evening study", "Go to Course")).toBe(
      "SICP",
    );
  });
});

describe("DailyEntityLink", () => {
  // RouterStub mounts children after the router's initial load, so wait via findBy*.
  test("renders a link carrying the aria-label and the icon", async () => {
    const icon = (
      <CheckSquareIcon
        data-testid="icon"
        className="size-4"
      />
    );
    render(
      <RouterStub>
        <DailyEntityLink
          entity="tasks"
          id="t1"
          icon={icon}
          tooltip="Go to Task"
          ariaLabel="Go to task Read SICP"
        />
      </RouterStub>,
    );
    const link = await screen.findByRole("link", {
      name: "Go to task Read SICP",
    });
    expect(link).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
