import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { SelectAllCheckbox } from "./SelectAllCheckbox";

function renderCheckbox(props: Partial<React.ComponentProps<typeof SelectAllCheckbox>> = {}) {
  const onCheckedChange = vi.fn();
  render(
    <SelectAllCheckbox
      aria-label="Select all"
      checked={false}
      indeterminate={false}
      onCheckedChange={onCheckedChange}
      {...props}
    />,
  );
  const checkbox = screen.getByRole("checkbox", {
    name: "Select all",
  }) as HTMLInputElement;
  return {
    checkbox,
    onCheckedChange,
  };
}

describe("SelectAllCheckbox", () => {
  test("reflects the checked prop", () => {
    const {
      checkbox,
    } = renderCheckbox({
      checked: true,
    });
    expect(checkbox.checked).toBe(true);
  });

  test("applies the indeterminate prop to the DOM node", () => {
    const {
      checkbox,
    } = renderCheckbox({
      indeterminate: true,
    });
    expect(checkbox.indeterminate).toBe(true);
  });

  test("is not indeterminate when the prop is false", () => {
    const {
      checkbox,
    } = renderCheckbox({
      indeterminate: false,
    });
    expect(checkbox.indeterminate).toBe(false);
  });

  test("fires onCheckedChange with the next checked value", () => {
    const {
      checkbox, onCheckedChange,
    } = renderCheckbox({
      checked: false,
    });
    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  test("honours the disabled prop", () => {
    const {
      checkbox,
    } = renderCheckbox({
      disabled: true,
    });
    expect(checkbox.disabled).toBe(true);
  });
});
