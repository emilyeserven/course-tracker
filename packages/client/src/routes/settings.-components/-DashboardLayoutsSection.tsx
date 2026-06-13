import type { DashboardLayout } from "@emstack/types";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { LayoutNameDialog } from "@/components/LayoutNameDialog";
import { Button } from "@/components/ui/button";
import {
  createDashboardLayout,
  deleteSingleDashboardLayout,
  fetchDashboardLayouts,
  upsertDashboardLayout,
} from "@/utils/api";
import { queryKeys } from "@/utils/queryKeys";

export function DashboardLayoutsSection() {
  const queryClient = useQueryClient();

  const [renamingLayoutId, setRenamingLayoutId] = useState<string | null>(null);
  const [creatingNewLayout, setCreatingNewLayout] = useState(false);

  const layoutsQuery = useQuery({
    queryKey: queryKeys.dashboardLayouts.list(),
    queryFn: () => fetchDashboardLayouts(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.dashboardLayouts.list(),
    });

  const createLayoutMutation = useMutation({
    mutationFn: (name: string) =>
      createDashboardLayout({
        name,
        position: layoutsQuery.data?.length ?? 0,
        tiles: [],
      }),
    onSuccess: () => {
      void invalidate();
      setCreatingNewLayout(false);
      toast.success("Dashboard layout created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const renameLayoutMutation = useMutation({
    mutationFn: ({
      layout, name,
    }: { layout: DashboardLayout;
      name: string; }) =>
      upsertDashboardLayout(layout.id, {
        name,
        position: layout.position ?? null,
        tiles: layout.tiles,
      }),
    onSuccess: () => {
      void invalidate();
      setRenamingLayoutId(null);
      toast.success("Dashboard layout saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteLayoutMutation = useMutation({
    mutationFn: (id: string) => deleteSingleDashboardLayout(id),
    onSuccess: () => {
      void invalidate();
      toast.success("Dashboard layout deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const layouts = layoutsQuery.data ?? [];
  const renamingLayout
    = layouts.find(l => l.id === renamingLayoutId) ?? null;

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">
            Dashboard Layouts
          </h2>
          <Button
            variant="outline"
            onClick={() => setCreatingNewLayout(true)}
          >
            <PlusIcon />
            New Layout
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Saved tile arrangements selectable from the dashboard&apos;s tab bar.
        </p>
        {layoutsQuery.isPending
          ? <p className="text-sm text-muted-foreground">Loading...</p>
          : layouts.length === 0
            ? (
              <p className="text-sm text-muted-foreground">
                No layouts yet. Visit the dashboard to create the default
                one, or add one here.
              </p>
            )
            : (
              <ul className="flex flex-col divide-y rounded-md border">
                {layouts.map(layout => (
                  <li
                    key={layout.id}
                    className="
                      flex flex-wrap items-center justify-between gap-2 p-3
                    "
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{layout.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {layout.tiles.length}
                        {" "}
                        tile(s) shown
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRenamingLayoutId(layout.id)}
                      >
                        <PencilIcon className="size-4" />
                        Rename
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteLayoutMutation.mutate(layout.id)}
                        disabled={deleteLayoutMutation.isPending}
                      >
                        <Trash2Icon className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
      </section>

      <LayoutNameDialog
        open={renamingLayout !== null}
        title="Rename layout"
        initialName={renamingLayout?.name ?? ""}
        isSaving={renameLayoutMutation.isPending}
        onOpenChange={(open) => {
          if (!open) setRenamingLayoutId(null);
        }}
        onSubmit={(name) => {
          if (renamingLayout) {
            renameLayoutMutation.mutate({
              layout: renamingLayout,
              name,
            });
          }
        }}
      />

      <LayoutNameDialog
        open={creatingNewLayout}
        title="New layout"
        submitLabel="Create"
        isSaving={createLayoutMutation.isPending}
        onOpenChange={setCreatingNewLayout}
        onSubmit={name => createLayoutMutation.mutate(name)}
      />
    </>
  );
}
