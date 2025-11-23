import type { ReactNode } from "react";

interface TestProps {
  text: string;
  children?: ReactNode;
}

export function Text({
  text,
  children,
}: TestProps) {
  return (
    <div
      className="text-2xl"
      data-testid="test-component-root"
    >
      {text}
      {children && children}
    </div>
  );
}
