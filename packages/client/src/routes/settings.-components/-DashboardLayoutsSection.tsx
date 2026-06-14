import type { DashboardLayout, DashboardTileId } from "@emstack/types";

import { BookmarkIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";

import { useDashboardLayouts } from "./-useDashboardLayouts";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LayoutMenuActions } from "@/components/LayoutMenuActions";
import { LayoutNameDialog } from "@/components/LayoutNameDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { tileVisibilityItems } from "@/lib/dashboardTiles";

interface LayoutRowProps {
  layout: DashboardLayout;
  onToggleTile: (layout: DashboardLayout, tileId: DashboardTileId) => void;
  onRename: (layout: DashboardLayout) => void;
  onDuplicate: (layout: DashboardLayout) => void;
  onSaveAs: (layout: DashboardLayout) => void;
  onDelete: (layout: DashboardLayout) => void;
}

/** One layout/preset row with the same actions as the dashboard's tab menu. */
function LayoutRow({
  layout,
  onToggleTile,
  onRename,
  onDuplicate,
  onSaveAs,
  onDelete,
}: LayoutRowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 p-3">
      <div className="flex flex-col gap-1">
        <span className="font-medium">{layout.name}</span>
        <span className="text-xs text-muted-foreground">
          {layout.tiles.length} tile(s) shown
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            aria-label={`${layout.name} options`}
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Visible tiles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tileVisibilityItems(layout).map(({
            tileId, title, checked,
          }) => (
            <DropdownMenuCheckboxItem
              key={tileId}
              checked={checked}
              onCheckedChange={() => onToggleTile(layout, tileId)}
              onSelect={e => e.preventDefault()}
            >
              {title}
            </DropdownMenuCheckboxItem>
          ))}
          <LayoutMenuActions
            layout={layout}
            onRename={onRename}
            onDuplicate={onDuplicate}
            onSaveAs={onSaveAs}
            onDelete={onDelete}
            saveAsLabel="Save as preset…"
            showSaveAs={!layout.isTemplate}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

export function DashboardLayoutsSection() {
  const {
    isPending,
    tabs,
    presets,
    rowProps,
    creatingKind,
    startCreate,
    closeCreate,
    submitCreate,
    isCreating,
    renameTarget,
    closeRename,
    submitRename,
    isRenaming,
    saveAsTarget,
    closeSaveAs,
    submitSaveAs,
    isSavingPreset,
    deleteTarget,
    closeDelete,
    confirmDelete,
  } = useDashboardLayouts();

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => startCreate("preset")}
            >
              <BookmarkIcon />
              New Preset
            </Button>
            <Button
              variant="outline"
              onClick={() => startCreate("tab")}
            >
              <PlusIcon />
              New Layout
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Tabs shown on the dashboard, plus saved presets you can start a new
          tab from.
        </p>

        {isPending
          ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )
          : (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tabs
                </h3>
                {tabs.length === 0
                  ? (
                    <p className="text-sm text-muted-foreground">
                      No layouts yet. Visit the dashboard to create the default one,
                      or add one here.
                    </p>
                  )
                  : (
                    <ul className="flex flex-col divide-y rounded-md border">
                      {tabs.map(layout => (
                        <LayoutRow
                          key={layout.id}
                          layout={layout}
                          {...rowProps}
                        />
                      ))}
                    </ul>
                  )}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Saved presets
                </h3>
                {presets.length === 0
                  ? (
                    <p className="text-sm text-muted-foreground">
                      No saved presets yet. Use “Save as preset” on a layout to
                      reuse its tiles later.
                    </p>
                  )
                  : (
                    <ul className="flex flex-col divide-y rounded-md border">
                      {presets.map(layout => (
                        <LayoutRow
                          key={layout.id}
                          layout={layout}
                          {...rowProps}
                        />
                      ))}
                    </ul>
                  )}
              </div>
            </>
          )}
      </section>

      <LayoutNameDialog
        open={renameTarget !== null}
        title="Rename layout"
        initialName={renameTarget?.name ?? ""}
        isSaving={isRenaming}
        onOpenChange={(open) => {
          if (!open) closeRename();
        }}
        onSubmit={submitRename}
      />

      <LayoutNameDialog
        open={saveAsTarget !== null}
        title="Save as preset"
        submitLabel="Save"
        initialName={saveAsTarget?.name ?? ""}
        isSaving={isSavingPreset}
        onOpenChange={(open) => {
          if (!open) closeSaveAs();
        }}
        onSubmit={submitSaveAs}
      />

      <LayoutNameDialog
        open={creatingKind !== null}
        title={creatingKind === "preset" ? "New preset" : "New layout"}
        submitLabel="Create"
        isSaving={isCreating}
        onOpenChange={(open) => {
          if (!open) closeCreate();
        }}
        onSubmit={submitCreate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete layout?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDelete}
      />
    </>
  );
}
