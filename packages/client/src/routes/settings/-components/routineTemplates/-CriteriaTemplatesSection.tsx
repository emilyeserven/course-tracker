import type { DailyCriteriaTemplate } from "@emstack/types";

import { DailyCriteriaTemplateEditModal } from "./-DailyCriteriaTemplateEditModal";
import { TemplateListSection } from "./-TemplateListSection";
import { useTemplateSectionCrud } from "./-useTemplateSectionCrud";

import { NEW_ROW_ID } from "@/constants/sentinels";
import {
  createDailyCriteriaTemplate,
  deleteSingleDailyCriteriaTemplate,
  fetchDailyCriteriaTemplates,
  queryKeys,
  upsertDailyCriteriaTemplate,
} from "@/utils";

function makeEmptyCriteriaTemplate(): DailyCriteriaTemplate {
  return {
    id: NEW_ROW_ID,
    label: "",
    incomplete: "",
    touched: "",
    goal: "",
    exceeded: "",
    freeze: "",
  };
}

function toCriteriaBody(template: DailyCriteriaTemplate) {
  return {
    label: template.label,
    incomplete: template.incomplete,
    touched: template.touched,
    goal: template.goal,
    exceeded: template.exceeded,
    freeze: template.freeze,
  };
}

export function CriteriaTemplatesSection() {
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
  } = useTemplateSectionCrud<DailyCriteriaTemplate>({
    queryKey: queryKeys.dailyCriteriaTemplates.list(),
    fetchFn: fetchDailyCriteriaTemplates,
    createFn: template => createDailyCriteriaTemplate(toCriteriaBody(template)),
    upsertFn: template =>
      upsertDailyCriteriaTemplate(template.id, toCriteriaBody(template)),
    deleteFn: deleteSingleDailyCriteriaTemplate,
    entityLabel: "Template",
  });

  return (
    <>
      <TemplateListSection
        title="Status Criteria Templates"
        description="Prefill options for the Status Criteria Quick Fill on a daily."
        templates={templates}
        isPending={isPending}
        renderMeta={t =>
          t.goal
            ? (
              <span className="line-clamp-1 text-xs text-muted-foreground">
                Goal: {t.goal}
              </span>
            )
            : null}
        onNew={() => setCreatingNew(true)}
        onEdit={setEditingId}
        onDelete={deleteTemplate}
        isDeleting={isDeleting}
      />

      <DailyCriteriaTemplateEditModal
        open={editingId !== null}
        template={editingTemplate}
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

      <DailyCriteriaTemplateEditModal
        open={creatingNew}
        template={creatingNew ? makeEmptyCriteriaTemplate() : null}
        isNew
        onOpenChange={(open) => {
          if (!open) setCreatingNew(false);
        }}
        onSave={createTemplate}
        isSaving={isCreating}
      />
    </>
  );
}
