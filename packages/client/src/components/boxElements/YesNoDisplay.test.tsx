import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { YesNoDisplay } from "./YesNoDisplay";

describe("YesNoDisplay", () => {
  test("renders Yes when value is true", () => {
    render(<YesNoDisplay value={true} />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.queryByText("No")).not.toBeInTheDocument();
  });

  test("renders No when value is false", () => {
    render(<YesNoDisplay value={false} />);
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.queryByText("Yes")).not.toBeInTheDocument();
  });
});
