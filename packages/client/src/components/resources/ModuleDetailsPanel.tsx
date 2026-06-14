import type { Module } from "@emstack/types";

import { formatModuleLength } from "@emstack/types";
import { ExternalLinkIcon, PencilIcon } from "lucide-react";

import { GroupMetaChips } from "./GroupEditCard";

import { Button } from "@/components/ui/button";
import { isHttpUrl } from "@/utils";

/**
 * Read-only details for a module, expanded inline when its row is clicked
 * (outside the status circle). Reuses `GroupMetaChips` for the effort levels
 * and tags so module and group metadata render identically. The Edit button
 * hands off to the existing inline edit form.
 */
export function ModuleDetailsPanel({
  module: m,
  onEdit,
}: {
  module: Module;
  onEdit: () => void;
}) {
  const length = formatModuleLength(m.length);

  return (
    <li className="border-t bg-muted/30 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-1 flex-col gap-2">
          {m.description
            ? (
              <p className="text-sm whitespace-pre-wrap">{m.description}</p>
            )
            : (
              <p className="text-sm text-muted-foreground italic">
                No description.
              </p>
            )}
          <div
            className="
              flex flex-wrap items-center gap-x-3 gap-y-1 text-xs
              text-muted-foreground
            "
          >
            {length && <span>Length: {length}</span>}
            {m.url && isHttpUrl(m.url) && (
              <a
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex items-center gap-1
                  hover:text-blue-600
                "
              >
                <ExternalLinkIcon className="size-3" />
                Open link
              </a>
            )}
          </div>
          <GroupMetaChips
            easeOfStarting={m.easeOfStarting ?? null}
            timeNeeded={m.timeNeeded ?? null}
            interactivity={m.interactivity ?? null}
            tags={m.tags ?? []}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          aria-label={`Edit ${m.name}`}
        >
          <PencilIcon className="size-3.5" />
          Edit
        </Button>
      </div>
    </li>
  );
}
