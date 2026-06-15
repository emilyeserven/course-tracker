import type { RoutineTemplate } from "@emstack/types";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { RoutineTemplateEditModal } from "./-RoutineTemplateEditModal";

import { Button } from "@/components/ui/button";
import { NEW_ROW_ID } from "@/constants/sentinels";
import {
  createRoutineTemplate,
  deleteSingleRoutineTemplate,
  fetchModuleGroups,
  fetchModules,
  fetchResources,
  fetchRoutineTemplates,
  fetchTasks,
  groupOptionsByResource,
  toOptions,
  upsertRoutineTemplate,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

function makeEmptyRoutineTemplate(): RoutineTemplate {
  return {
    id: NEW_ROW_ID,
    label: "",
    weekly: {},
  };
}

export function RoutineTemplatesSection() {
  const queryClient = useQueryClient();

  const [editingRoutineTemplateId, setEditingRoutineTemplateId] = useState<
    string | null
  >(null);
  const [creatingNewRoutineTemplate, setCreatingNewRoutineTemplate]
    = useState(false);

  const routineTemplatesQuery = useQuery({
    queryKey: ["routineTemplates"],
    queryFn: () => fetchRoutineTemplates(),
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const resourcesQuery = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });

  const modulesQuery = useQuery({
    queryKey: queryKeys.modules.list(),
    queryFn: () => fetchModules(),
  });

  const moduleGroupsQuery = useQuery({
    queryKey: queryKeys.moduleGroups.list(),
    queryFn: () => fetchModuleGroups(),
  });

  const upsertRoutineTemplateMutation = useMutation({
    mutationFn: (template: RoutineTemplate) =>
      upsertRoutineTemplate(template.id, {
        label: template.label,
        weekly: template.weekly,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routineTemplates"],
      });
      setEditingRoutineTemplateId(null);
      toast.success("Routine template saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const createRoutineTemplateMutation = useMutation({
    mutationFn: (template: RoutineTemplate) =>
      createRoutineTemplate({
        label: template.label,
        weekly: template.weekly,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routineTemplates"],
      });
      setCreatingNewRoutineTemplate(false);
      toast.success("Routine template created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteRoutineTemplateMutation = useMutation({
    mutationFn: (id: string) => deleteSingleRoutineTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["routineTemplates"],
      });
      setEditingRoutineTemplateId(null);
      toast.success("Routine template deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const routineTemplates = routineTemplatesQuery.data ?? [];
  const editingRoutineTemplate = editingRoutineTemplateId
    ? (routineTemplates.find(t => t.id === editingRoutineTemplateId) ?? null)
    : null;
  const taskOptions = toOptions(tasksQuery.data);
  const resourceOptions = toOptions(resourcesQuery.data);
  const moduleGroupsByResource = groupOptionsByResource(moduleGroupsQuery.data);
  const modulesByResource = groupOptionsByResource(modulesQuery.data);

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Routine Templates</h2>
          <Button
            variant="outline"
            onClick={() => setCreatingNewRoutineTemplate(true)}
          >
            <PlusIcon />
            New Template
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Prefill options for the Weekly Schedule Quick Fill on a routine.
        </p>
        {routineTemplatesQuery.isPending
          ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )
          : routineTemplates.length === 0
            ? (
              <p className="text-sm text-muted-foreground">
                No templates yet. Create one to use it as a Quick Fill option.
              </p>
            )
            : (
              <ul className="flex flex-col divide-y rounded-md border">
                {routineTemplates.map(t => (
                  <li
                    key={t.id}
                    className="
                      flex flex-wrap items-center justify-between gap-2 p-3
                    "
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{t.label}</span>
                      <span
                        className="line-clamp-1 text-xs text-muted-foreground"
                      >
                        {Object.keys(t.weekly ?? {}).length} day(s) scheduled
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingRoutineTemplateId(t.id)}
                      >
                        <PencilIcon className="size-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteRoutineTemplateMutation.mutate(t.id)}
                        disabled={deleteRoutineTemplateMutation.isPending}
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

      <RoutineTemplateEditModal
        open={editingRoutineTemplateId !== null}
        template={editingRoutineTemplate}
        taskOptions={taskOptions}
        resourceOptions={resourceOptions}
        moduleGroupsByResource={moduleGroupsByResource}
        modulesByResource={modulesByResource}
        onOpenChange={(open) => {
          if (!open) setEditingRoutineTemplateId(null);
        }}
        onSave={t => upsertRoutineTemplateMutation.mutate(t)}
        onDelete={
          editingRoutineTemplate
            ? () =>
              deleteRoutineTemplateMutation.mutate(editingRoutineTemplate.id)
            : undefined
        }
        isSaving={
          upsertRoutineTemplateMutation.isPending
          || deleteRoutineTemplateMutation.isPending
        }
      />

      <RoutineTemplateEditModal
        open={creatingNewRoutineTemplate}
        template={
          creatingNewRoutineTemplate ? makeEmptyRoutineTemplate() : null
        }
        isNew
        taskOptions={taskOptions}
        resourceOptions={resourceOptions}
        moduleGroupsByResource={moduleGroupsByResource}
        modulesByResource={modulesByResource}
        onOpenChange={(open) => {
          if (!open) setCreatingNewRoutineTemplate(false);
        }}
        onSave={t => createRoutineTemplateMutation.mutate(t)}
        isSaving={createRoutineTemplateMutation.isPending}
      />
    </>
  );
}
