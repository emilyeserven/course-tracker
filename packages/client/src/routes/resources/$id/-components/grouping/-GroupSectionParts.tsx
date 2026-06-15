import type { ModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import type { ResourceModulesController } from "@/hooks/useResourceModules";
import type { Module, ModuleGroup, ModuleStatus } from "@emstack/types";

import { formatPageRange } from "@emstack/types";
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  GripVerticalIcon,
  ListPlusIcon,
  PencilIcon,
  PlusIcon,
} from "lucide-react";

import { GroupMetaChips } from "@/components/resources/moduleAdminComponents";
import { getModuleStatusOption } from "@/components/resources/moduleStatusMeta";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isHttpUrl } from "@/utils";

/** De-emphasized page range shown after a group/module title (book resources). */
function PageRange({
  start,
  end,
}: {
  start?: number | null;
  end?: number | null;
}) {
  const label = formatPageRange(start, end);
  if (!label) return null;
  return (
    <span className="ml-2 text-xs font-normal text-muted-foreground">
      {label}
    </span>
  );
}

/**
 * The group title — plain text (the external link, when present, is its own
 * button in the header controls). A non-http url is surfaced as a tooltip.
 */
export function GroupTitle({
  group: g,
}: { group: ModuleGroup }) {
  const pages = (
    <PageRange
      start={g.pageStart}
      end={g.pageEnd}
    />
  );
  if (g.url && !isHttpUrl(g.url)) {
    return (
      <>
        <span title={g.url}>{g.name}</span>
        {pages}
      </>
    );
  }
  return (
    <>
      {g.name}
      {pages}
    </>
  );
}

/** Read-only status circle shown beside a group name; auto-derived, not clickable. */
export function GroupStatusBadge({
  status,
}: { status: ModuleStatus }) {
  const option = getModuleStatusOption(status);
  return (
    <span
      title={`Status: ${option.label}`}
      aria-label={`Status: ${option.label}`}
      className={cn(
        `
          inline-flex size-5 shrink-0 items-center justify-center rounded-full
          [&_svg]:size-3.5
        `,
        option.circleClass,
      )}
    >
      {option.icon}
    </span>
  );
}

/** Group meta chips, coalescing the group's optional level/tag fields. */
export function GroupMeta({
  group: g,
}: { group: ModuleGroup }) {
  return (
    <GroupMetaChips
      easeOfStarting={g.easeOfStarting ?? null}
      timeNeeded={g.timeNeeded ?? null}
      interactivity={g.interactivity ?? null}
      tags={g.tags ?? []}
    />
  );
}

/** Reorder / add-module / log / edit controls in the group header. */
export function GroupHeaderControls({
  group: g,
  groupIndex: gIndex,
  api,
  ui,
  dragHandleProps,
}: {
  group: ModuleGroup;
  groupIndex: number;
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
  dragHandleProps?: Record<string, unknown>;
}) {
  const {
    groups, moveGroup, isReordering,
  } = api;
  const {
    isAnyEditing,
    reorderMode,
    setCreatingModuleIn,
    setBulkAddingInGroupId,
    setLoggingForGroupId,
    setEditingGroupId,
  } = ui;

  // Only a list with more than one group can be reordered.
  const showReorder = reorderMode && !isAnyEditing && groups.length > 1;

  return (
    <div className="flex flex-row items-center gap-2">
      {showReorder && (
        <>
          <span
            className="
              flex items-center gap-0.5
              md:hidden
            "
          >
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => moveGroup(gIndex, "up")}
              disabled={isReordering || gIndex === 0}
              aria-label="Move group up"
              title="Move group up"
            >
              <ChevronUpIcon className="size-3.5" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => moveGroup(gIndex, "down")}
              disabled={isReordering || gIndex === groups.length - 1}
              aria-label="Move group down"
              title="Move group down"
            >
              <ChevronDownIcon className="size-3.5" />
            </Button>
          </span>
          <button
            type="button"
            {...dragHandleProps}
            onClick={e => e.stopPropagation()}
            aria-label={`Drag to reorder ${g.name}`}
            title="Drag to reorder"
            className="
              hidden size-7 cursor-grab touch-none items-center justify-center
              rounded-md text-muted-foreground
              hover:bg-accent
              active:cursor-grabbing
              md:inline-flex
            "
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        </>
      )}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setCreatingModuleIn(g.id)}
        disabled={isAnyEditing}
      >
        <PlusIcon className="size-3.5" />
        Add
        {" "}
        {api.moduleLabel}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setBulkAddingInGroupId(g.id)}
        disabled={isAnyEditing}
        title={`Add several ${api.moduleLabel.toLowerCase()}s at once`}
      >
        <ListPlusIcon className="size-3.5" />
        Bulk Add
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        onClick={() => setLoggingForGroupId(g.id)}
        disabled={isAnyEditing}
        aria-label={`Log interaction for ${g.name}`}
        title="Log interaction"
      >
        <ActivityIcon className="size-3.5" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setEditingGroupId(g.id)}
        disabled={isAnyEditing}
      >
        <PencilIcon className="size-3.5" />
      </Button>
      {g.url && isHttpUrl(g.url) && (
        <Button
          asChild
          size="icon-sm"
          variant="ghost"
          aria-label={`Open link for ${g.name}`}
          title="Open link"
        >
          <a
            href={g.url}
            target="_blank"
            rel="noreferrer"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLinkIcon className="size-3.5" />
          </a>
        </Button>
      )}
    </div>
  );
}

/**
 * Fallback shown when a group has no enumerated modules and none is being
 * created: either its direct progress counts or a hint to add modules.
 */
export function GroupProgressHint({
  group: g,
  groupModules,
  isCreatingHere,
}: {
  group: ModuleGroup;
  groupModules: Module[];
  isCreatingHere: boolean;
}) {
  if (groupModules.length > 0 || isCreatingHere) return null;

  if (g.totalCount != null || g.completedCount != null) {
    return (
      <p className="text-xs text-muted-foreground">
        {g.completedCount ?? 0}
        {" / "}
        {g.totalCount ?? 0}
        {" complete"}
      </p>
    );
  }

  return (
    <p className="text-xs text-muted-foreground">
      No modules in this group yet — add modules, or edit the group to track
      totals directly.
    </p>
  );
}
