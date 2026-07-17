import type { RoutineTemplate } from "@emstack/types";

import { useQuery } from "@tanstack/react-query";

import { RoutineTemplateEditModal } from "./-RoutineTemplateEditModal";
import { TemplateListSection } from "./-TemplateListSection";
import { useTemplateSectionCrud } from "./-useTemplateSectionCrud";

import { NEW_ROW_ID } from "@/constants/sentinels";
import {
  createRoutineTemplate,
  deleteSingleRoutineTemplate,
  fetchRoutineTemplates,
  fetchTasks,
  queryKeys,
  toOptions,
  upsertRoutineTemplate,
} from "@/utils";

function makeEmptyRoutineTemplate(): RoutineTemplate {
  return {
    id: NEW_ROW_ID,
    label: "",
    weekly: {},
  };
}

export function RoutineTemplatesSection() {
  const {
    templates,
    isPending,
    editingId,
    setEditingId,
    creatingNew,
    setCreatingNew,
    editingTemplate,
    saveTemplate,
    createTemplate,
    deleteTemplate,
    isSaving,
    isCreating,
    isDeleting,
  } = useTemplateSectionCrud<RoutineTemplate>({
    queryKey: queryKeys.routineTemplates.list(),
    fetchFn: fetchRoutineTemplates,
    createFn: template =>
      createRoutineTemplate({
        label: template.label,
        weekly: template.weekly,
      }),
    upsertFn: template =>
      upsertRoutineTemplate(template.id, {
        label: template.label,
        weekly: template.weekly,
      }),
    deleteFn: deleteSingleRoutineTemplate,
    entityLabel: "Routine template",
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: () => fetchTasks(),
  });
  const taskOptions = toOptions(tasksQuery.data);

  return (
    <>
      <TemplateListSection
        title="Routine Templates"
        description="Prefill options for the Weekly Schedule Quick Fill on a routine."
        templates={templates}
        isPending={isPending}
        renderMeta={t => (
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {Object.keys(t.weekly ?? {}).length} day(s) scheduled
          </span>
        )}
        onNew={() => setCreatingNew(true)}
        onEdit={setEditingId}
        onDelete={deleteTemplate}
        isDeleting={isDeleting}
      />

      <RoutineTemplateEditModal
        open={editingId !== null}
        template={editingTemplate}
        taskOptions={taskOptions}
        onOpenChange={(open) => {
          if (!open) setEditingId(null);
        }}
        onSave={saveTemplate}
        onDelete={
          editingTemplate
            ? () => deleteTemplate(editingTemplate.id)
            : undefined
        }
        isSaving={isSaving}
      />

      <RoutineTemplateEditModal
        open={creatingNew}
        template={creatingNew ? makeEmptyRoutineTemplate() : null}
        isNew
        taskOptions={taskOptions}
        onOpenChange={(open) => {
          if (!open) setCreatingNew(false);
        }}
        onSave={createTemplate}
        isSaving={isCreating}
      />
    </>
  );
}
