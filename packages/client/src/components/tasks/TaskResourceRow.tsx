import type { TaskResource, TaskResourceLevel } from "@emstack/types";

import { Fragment } from "react";

import { ActivityIcon, ExternalLinkIcon, PencilIcon } from "lucide-react";

import { LevelBadge } from "./LevelBadge";
import { COLUMN_COUNT } from "./TaskResourceEditingRow";

import { EntityLink } from "@/components/boxElements";
import { InteractionQuickLog } from "@/components/resources/InteractionQuickLog";
import { Button } from "@/components/ui/button";
import { isHttpUrl } from "@/utils";

export function TaskResourceRow({
  resource: r,
  ease,
  time,
  interactivity,
  linkedLabel,
  isAnyEditing,
  isMutationPending,
  isLogging,
  onToggleUsed,
  onStartEdit,
  onLogInteraction,
  onCloseLog,
}: {
  resource: TaskResource;
  ease: TaskResourceLevel | null;
  time: TaskResourceLevel | null;
  interactivity: TaskResourceLevel | null;
  linkedLabel: string | null;
  isAnyEditing: boolean;
  isMutationPending: boolean;
  isLogging: boolean;
  onToggleUsed: (resourceId: string, nextUsed: boolean) => void;
  onStartEdit: () => void;
  onLogInteraction: () => void;
  onCloseLog: () => void;
}) {
  const locationIsUrl = !!r.url && isHttpUrl(r.url);
  const canLogInteraction = !!r.resourceId;
  // When linked, the linked label IS the resource name. Show
  // the freeform name only if it adds something different.
  const showFreeformName
    = !!r.name && (!linkedLabel || r.name !== linkedLabel);

  return (
    <Fragment>
      <tr
        className="
          group border-t align-middle
          hover:bg-muted/40
        "
      >
        <td className="p-2">
          <div className="flex flex-col gap-0.5">
            {linkedLabel && r.resourceId
              ? (
                <EntityLink
                  entity="resources"
                  id={r.resourceId}
                  className="
                    font-medium
                    hover:text-blue-600
                  "
                  title={linkedLabel}
                >
                  {linkedLabel}
                </EntityLink>
              )
              : (
                <span className="font-medium">{r.name}</span>
              )}
            {linkedLabel && showFreeformName && (
              <span className="text-xs text-muted-foreground">
                {r.name}
              </span>
            )}
          </div>
        </td>
        <td className="p-2">
          <LevelBadge level={ease} />
        </td>
        <td className="p-2">
          <LevelBadge level={time} />
        </td>
        <td className="p-2">
          <LevelBadge level={interactivity} />
        </td>
        <td className="p-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={r.usedYet}
              disabled={isMutationPending || isAnyEditing}
              onChange={e =>
                onToggleUsed(r.id, e.target.checked)}
              className="size-4"
              aria-label={`Mark ${r.name} as used`}
            />
            <span className="text-xs text-muted-foreground">
              {r.usedYet ? "Used" : "Not yet"}
            </span>
          </label>
        </td>
        <td className="max-w-xs p-2">
          {r.url
            ? (
              locationIsUrl
                ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      Go
                      <ExternalLinkIcon className="size-3.5" />
                    </Button>
                  </a>
                )
                : (
                  <span
                    className="block truncate text-xs"
                    title={r.url}
                  >
                    {r.url}
                  </span>
                )
            )
            : (
              <span className="text-muted-foreground/60">—</span>
            )}
        </td>
        <td className="p-2">
          {canLogInteraction && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Log interaction for ${r.name}`}
              title="Log interaction"
              onClick={onLogInteraction}
              disabled={isAnyEditing}
              className="
                opacity-0 transition
                group-hover:opacity-100
                focus-visible:opacity-100
              "
            >
              <ActivityIcon className="size-3.5" />
            </Button>
          )}
        </td>
        <td className="p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${r.name}`}
            title="Edit resource"
            onClick={onStartEdit}
            disabled={isAnyEditing}
            className="
              opacity-0 transition
              group-hover:opacity-100
              focus-visible:opacity-100
            "
          >
            <PencilIcon className="size-3.5" />
          </Button>
        </td>
      </tr>
      {isLogging && r.resourceId && (
        <tr className="border-t bg-muted/30">
          <td
            colSpan={COLUMN_COUNT}
            className="p-3"
          >
            <InteractionQuickLog
              resourceId={r.resourceId}
              moduleGroupId={r.moduleGroupId ?? null}
              moduleId={r.moduleId ?? null}
              scopeLabel={linkedLabel ?? r.name}
              onCancel={onCloseLog}
              onSaved={onCloseLog}
            />
          </td>
        </tr>
      )}
    </Fragment>
  );
}
