import type { TopicForTopicsPageDomain } from "@emstack/types";
import type { ReactNode } from "react";

import { DomainPill } from "@/components/boxElements/DomainPill";
import { cn } from "@/lib/utils";

interface DomainTagListProps {
  domains?: TopicForTopicsPageDomain[];
  className?: string;
  /** Rendered when there are no domains with a defined id. Defaults to nothing. */
  fallback?: ReactNode;
}

/**
 * Renders a topic's domains as small tag pills, skipping any without a defined
 * id. Returns `fallback` (default: nothing) when no valid domains remain.
 */
export function DomainTagList({
  domains,
  className,
  fallback = null,
}: DomainTagListProps) {
  const valid = domains?.filter(domain => domain.id !== undefined) ?? [];

  if (valid.length === 0) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {valid.map(domain => (
        <DomainPill key={domain.id}>{domain.title}</DomainPill>
      ))}
    </div>
  );
}
