import type { DailyCriteriaTemplate } from "@emstack/types";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { DailyCriteriaTemplateEditModal } from "./-DailyCriteriaTemplateEditModal";

import { Button } from "@/components/ui/button";
import {
  createDailyCriteriaTemplate,
  deleteSingleDailyCriteriaTemplate,
  fetchDailyCriteriaTemplates,
  upsertDailyCriteriaTemplate,
} from "@/utils";

const NEW_CRITERIA_TEMPLATE_ID = "__new__";

function makeEmptyCriteriaTemplate(): DailyCriteriaTemplate {
  return {
    id: NEW_CRITERIA_TEMPLATE_ID,
    label: "",
    incomplete: "",
    touched: "",
    goal: "",
    exceeded: "",
    freeze: "",
  };
}

export function CriteriaTemplatesSection() {
  const queryClient = useQueryClient();

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const [creatingNewTemplate, setCreatingNewTemplate] = useState(false);

  const criteriaTemplatesQuery = useQuery({
    queryKey: ["dailyCriteriaTemplates"],
    queryFn: () => fetchDailyCriteriaTemplates(),
  });

  const upsertTemplateMutation = useMutation({
    mutationFn: (template: DailyCriteriaTemplate) =>
      upsertDailyCriteriaTemplate(template.id, {
        label: template.label,
        incomplete: template.incomplete,
        touched: template.touched,
        goal: template.goal,
        exceeded: template.exceeded,
        freeze: template.freeze,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyCriteriaTemplates"],
      });
      setEditingTemplateId(null);
      toast.success("Template saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: (template: DailyCriteriaTemplate) =>
      createDailyCriteriaTemplate({
        label: template.label,
        incomplete: template.incomplete,
        touched: template.touched,
        goal: template.goal,
        exceeded: template.exceeded,
        freeze: template.freeze,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyCriteriaTemplates"],
      });
      setCreatingNewTemplate(false);
      toast.success("Template created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => deleteSingleDailyCriteriaTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailyCriteriaTemplates"],
      });
      setEditingTemplateId(null);
      toast.success("Template deleted");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const criteriaTemplates = criteriaTemplatesQuery.data ?? [];
  const editingCriteriaTemplate = editingTemplateId
    ? (criteriaTemplates.find(t => t.id === editingTemplateId) ?? null)
    : null;

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Status Criteria Templates</h2>
          <Button
            variant="outline"
            onClick={() => setCreatingNewTemplate(true)}
          >
            <PlusIcon />
            New Template
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Prefill options for the Status Criteria Quick Fill on a daily.
        </p>
        {criteriaTemplatesQuery.isPending
          ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )
          : criteriaTemplates.length === 0
            ? (
              <p className="text-sm text-muted-foreground">
                No templates yet. Create one to use it as a Quick Fill option.
              </p>
            )
            : (
              <ul className="flex flex-col divide-y rounded-md border">
                {criteriaTemplates.map(t => (
                  <li
                    key={t.id}
                    className="
                      flex flex-wrap items-center justify-between gap-2 p-3
                    "
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{t.label}</span>
                      {t.goal && (
                        <span
                          className="line-clamp-1 text-xs text-muted-foreground"
                        >
                          Goal: {t.goal}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTemplateId(t.id)}
                      >
                        <PencilIcon className="size-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTemplateMutation.mutate(t.id)}
                        disabled={deleteTemplateMutation.isPending}
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

      <DailyCriteriaTemplateEditModal
        open={editingTemplateId !== null}
        template={editingCriteriaTemplate}
        onOpenChange={(open) => {
          if (!open) setEditingTemplateId(null);
        }}
        onSave={t => upsertTemplateMutation.mutate(t)}
        onDelete={
          editingCriteriaTemplate
            ? () => deleteTemplateMutation.mutate(editingCriteriaTemplate.id)
            : undefined
        }
        isSaving={
          upsertTemplateMutation.isPending || deleteTemplateMutation.isPending
        }
      />

      <DailyCriteriaTemplateEditModal
        open={creatingNewTemplate}
        template={creatingNewTemplate ? makeEmptyCriteriaTemplate() : null}
        isNew
        onOpenChange={(open) => {
          if (!open) setCreatingNewTemplate(false);
        }}
        onSave={t => createTemplateMutation.mutate(t)}
        isSaving={createTemplateMutation.isPending}
      />
    </>
  );
}
