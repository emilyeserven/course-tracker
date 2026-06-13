import type { DashboardLayout, DashboardTileId } from "@emstack/types";

import { useState } from "react";

import { DASHBOARD_TILE_IDS } from "@emstack/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookmarkIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LayoutNameDialog } from "@/components/LayoutNameDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TILE_META,
  toggleTile,
} from "@/routes/dashboard.-components/-dashboardTileMeta";
import {
  createDashboardLayout,
  deleteSingleDashboardLayout,
  duplicateDashboardLayout,
  fetchDashboardLayouts,
  upsertDashboardLayout,
} from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

type CreateKind = "tab" | "preset";

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
    <li
      className="flex flex-wrap items-center justify-between gap-2 p-3"
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium">{layout.name}</span>
        <span className="text-xs text-muted-foreground">
          {layout.tiles.length}
          {" "}
          tile(s) shown
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
          {DASHBOARD_TILE_IDS.map(tileId => (
            <DropdownMenuCheckboxItem
              key={tileId}
              checked={layout.tiles.some(t => t.tileId === tileId)}
              onCheckedChange={() => onToggleTile(layout, tileId)}
              onSelect={e => e.preventDefault()}
            >
              {TILE_META[tileId].title}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onRename(layout)}>
            <PencilIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDuplicate(layout)}>
            <CopyIcon />
            Duplicate
          </DropdownMenuItem>
          {!layout.isTemplate && (
            <DropdownMenuItem onSelect={() => onSaveAs(layout)}>
              <BookmarkIcon />
              Save as preset…
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => onDelete(layout)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}

export function DashboardLayoutsSection() {
  const queryClient = useQueryClient();

  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [saveAsTargetId, setSaveAsTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [creatingKind, setCreatingKind] = useState<CreateKind | null>(null);

  const layoutsQuery = useQuery({
    queryKey: queryKeys.dashboardLayouts.list(),
    queryFn: () => fetchDashboardLayouts(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboardLayouts.list(),
    });

  const layouts = layoutsQuery.data ?? [];
  const tabs = layouts.filter(l => !l.isTemplate);
  const presets = layouts.filter(l => l.isTemplate);

  const renameTarget = layouts.find(l => l.id === renameTargetId) ?? null;
  const saveAsTarget = layouts.find(l => l.id === saveAsTargetId) ?? null;
  const deleteTarget = layouts.find(l => l.id === deleteTargetId) ?? null;

  const createMutation = useMutation({
    mutationFn: ({
      name, kind,
    }: { name: string;
      kind: CreateKind; }) =>
      createDashboardLayout({
        name,
        position: kind === "tab" ? tabs.length : null,
        tiles: [],
        isTemplate: kind === "preset",
      }),
    onSuccess: (_res, {
      kind,
    }) => {
      void invalidate();
      setCreatingKind(null);
      toast.success(kind === "preset" ? "Preset created" : "Layout created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({
      layout, name,
    }: { layout: DashboardLayout;
      name: string; }) =>
      upsertDashboardLayout(layout.id, {
        name,
        position: layout.position ?? null,
        tiles: layout.tiles,
        isTemplate: layout.isTemplate ?? false,
      }),
    onSuccess: () => {
      void invalidate();
      setRenameTargetId(null);
      toast.success("Layout renamed");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const saveAsPresetMutation = useMutation({
    mutationFn: ({
      name, layout,
    }: { name: string;
      layout: DashboardLayout; }) =>
      createDashboardLayout({
        name,
        position: null,
        tiles: layout.tiles,
        isTemplate: true,
      }),
    onSuccess: () => {
      void invalidate();
      setSaveAsTargetId(null);
      toast.success("Saved as a layout you can reuse");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateDashboardLayout(id),
    onSuccess: () => {
      void invalidate();
      toast.success("Layout duplicated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSingleDashboardLayout(id),
    onSuccess: () => {
      void invalidate();
      setDeleteTargetId(null);
      toast.success("Layout deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const toggleTileMutation = useMutation({
    mutationFn: ({
      layout, tileId,
    }: { layout: DashboardLayout;
      tileId: DashboardTileId; }) =>
      upsertDashboardLayout(layout.id, {
        name: layout.name,
        position: layout.position ?? null,
        tiles: toggleTile(layout.tiles, tileId),
        isTemplate: layout.isTemplate ?? false,
      }),
    onSuccess: () => {
      void invalidate();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const rowProps = {
    onToggleTile: (layout: DashboardLayout, tileId: DashboardTileId) =>
      toggleTileMutation.mutate({
        layout,
        tileId,
      }),
    onRename: (layout: DashboardLayout) => setRenameTargetId(layout.id),
    onDuplicate: (layout: DashboardLayout) => duplicateMutation.mutate(layout.id),
    onSaveAs: (layout: DashboardLayout) => setSaveAsTargetId(layout.id),
    onDelete: (layout: DashboardLayout) => setDeleteTargetId(layout.id),
  };

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCreatingKind("preset")}
            >
              <BookmarkIcon />
              New Preset
            </Button>
            <Button
              variant="outline"
              onClick={() => setCreatingKind("tab")}
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

        {layoutsQuery.isPending
          ? <p className="text-sm text-muted-foreground">Loading...</p>
          : (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tabs
                </h3>
                {tabs.length === 0
                  ? (
                    <p className="text-sm text-muted-foreground">
                      No layouts yet. Visit the dashboard to create the default
                      one, or add one here.
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
        isSaving={renameMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setRenameTargetId(null);
        }}
        onSubmit={(name) => {
          if (renameTarget) {
            renameMutation.mutate({
              layout: renameTarget,
              name,
            });
          }
        }}
      />

      <LayoutNameDialog
        open={saveAsTarget !== null}
        title="Save as preset"
        submitLabel="Save"
        initialName={saveAsTarget?.name ?? ""}
        isSaving={saveAsPresetMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setSaveAsTargetId(null);
        }}
        onSubmit={(name) => {
          if (saveAsTarget) {
            saveAsPresetMutation.mutate({
              name,
              layout: saveAsTarget,
            });
          }
        }}
      />

      <LayoutNameDialog
        open={creatingKind !== null}
        title={creatingKind === "preset" ? "New preset" : "New layout"}
        submitLabel="Create"
        isSaving={createMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setCreatingKind(null);
        }}
        onSubmit={(name) => {
          if (creatingKind) {
            createMutation.mutate({
              name,
              kind: creatingKind,
            });
          }
        }}
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
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
}
