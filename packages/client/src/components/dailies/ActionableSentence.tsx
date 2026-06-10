import type { ReactNode } from "react";

interface ActionableSentenceProps {
  prependText?: string | null;
  appendText?: string | null;
  // The resource/task/freeform name — a plain string on the dashboard, or a
  // clickable <Link> on the single routine page.
  name: ReactNode;
  className?: string;
}

// Renders a routine's actionable sentence (prepend + name + append) with the
// name at a heavier weight than its surrounding affixes, so the meaningful core
// stands out. A routine with no prepend/append simply renders its name.
export function ActionableSentence({
  prependText,
  appendText,
  name,
  className,
}: ActionableSentenceProps) {
  const prepend = typeof prependText === "string" ? prependText.trim() : "";
  const append = typeof appendText === "string" ? appendText.trim() : "";
  return (
    <span className={className}>
      {prepend
        ? (
          <>
            <span className="font-normal">{prepend}</span>
            {" "}
          </>
        )
        : null}
      <span className="font-medium">{name}</span>
      {append
        ? (
          <>
            {" "}
            <span className="font-normal">{append}</span>
          </>
        )
        : null}
    </span>
  );
}
