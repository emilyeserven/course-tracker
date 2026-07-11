import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";

import { formSchema } from "./-topicFormSchema";

import {
  Button,
  EditForm,
  EditPageFooter,
  EntityHeaderButton,
  PageHeader,
  UnsavedChangesDialog,
} from "@/components/editPage";
import { ResourceLinksPicker, useAppForm } from "@/components/formFields";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import { useFormChangeState } from "@/hooks/useFormChangeState";
import {
  createTopic,
  deleteSingleTopic,
  fetchResources,
  fetchModuleGroups,
  fetchModules,
  fetchSingleTopic,
  fetchTagGroups,
  queryKeys,
  tagGroupsToOptions,
  upsertTopic,
} from "@/utils";

interface TopicFormProps {
  id: string;
  isNew: boolean;
}

export function TopicForm({
  id, isNew,
}: TopicFormProps) {
  const navigate = useNavigate();

  const {
    data, shouldBlockFn, makeDeleteHandler, makeSubmitHandler,
  }
    = useEditFormPage({
      id,
      isNew,
      queryKey: ["topic", id],
      queryFn: () => fetchSingleTopic(id),
      relatedQueryKeys: [queryKeys.topics.list()],
    });

  // fallow-ignore-next-line code-duplication
  const {
    data: tagGroups,
  } = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => fetchTagGroups(),
  });

  const {
    data: courses,
  } = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });

  const {
    data: allModuleGroups,
  } = useQuery({
    queryKey: ["module-groups-all"],
    queryFn: () => fetchModuleGroups(),
  });

  const {
    data: allModules,
  } = useQuery({
    queryKey: ["modules-all"],
    queryFn: () => fetchModules(),
  });

  const tagOptions = useMemo(() => tagGroupsToOptions(tagGroups), [tagGroups]);

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      reason: data?.reason ?? "",
      tagIds: (data?.tags ?? []).map(t => t.id),
      resourceLinks: (data?.resourceLinks ?? []).map((l, i) => ({
        key: l.id ?? `existing-${i}`,
        resourceId: l.resourceId,
        moduleGroupId: l.moduleGroupId ?? null,
        moduleId: l.moduleId ?? null,
      })),
    }),
    [data],
  );

  const submitTopic = makeSubmitHandler({
    createFn: createTopic,
    upsertFn: upsertTopic,
    entityLabel: "topic",
    navigateToEntity: topicId =>
      navigate({
        to: "/topics/$id",
        params: {
          id: topicId,
        },
      }),
  });

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      await submitTopic({
        name: value.name,
        description: value.description || null,
        reason: value.reason || null,
        tagIds: value.tagIds,
        resourceLinks: value.resourceLinks
          .filter(l => l.resourceId)
          .map(l => ({
            resourceId: l.resourceId,
            moduleGroupId: l.moduleGroupId,
            moduleId: l.moduleId,
          })),
      });
    },
  });

  const {
    isSubmitting, hasChanges,
  } = useFormChangeState(form, startingValues);

  const handleDelete = makeDeleteHandler({
    deleteFn: deleteSingleTopic,
    entityLabel: "topic",
    navigateToList: () =>
      navigate({
        to: "/topics",
      }),
  });

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Topic" : "Edit Topic"}
        pageSection="topics"
      >
        {!isNew && (
          <EntityHeaderButton
            to="/topics/$id"
            params={{
              id,
            }}
            label="View Topic"
            icon={<EyeIcon />}
          />
        )}
      </PageHeader>
      <div className="m-auto w-full max-w-[1200px] px-4">
        <EditForm
          onSubmit={form.handleSubmit}
          className="flex max-w-2xl flex-col gap-8"
        >
          <form.AppField name="name">
            {field => <field.InputField label="Topic Name" />}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What is this topic about?"
              />
            )}
          </form.AppField>

          <form.AppField name="reason">
            {field => (
              <field.TextareaField
                label="Reason"
                placeholder="Why are you learning this?"
              />
            )}
          </form.AppField>

          <form.AppField name="tagIds">
            {field => (
              <field.MultiComboboxField
                label="Tags"
                options={tagOptions}
                placeholder="Pick tags..."
                groupByPrefix
              />
            )}
          </form.AppField>

          <form.Field name="resourceLinks">
            {field => (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Resource Links
                </span>
                <ResourceLinksPicker
                  value={field.state.value}
                  onChange={next => field.handleChange(next)}
                  courses={(courses ?? []).map(c => ({
                    id: c.id,
                    name: c.name,
                  }))}
                  moduleGroups={allModuleGroups ?? []}
                  modules={allModules ?? []}
                />
              </div>
            )}
          </form.Field>

          <EditPageFooter
            isNew={isNew}
            onDelete={handleDelete}
            deleteLabel="Delete Topic"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Topic" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/topics",
                  });
                }
                else {
                  navigate({
                    to: "/topics/$id",
                    params: {
                      id,
                    },
                  });
                }
              }}
            >
              Cancel
            </Button>
          </EditPageFooter>
        </EditForm>
        <UnsavedChangesDialog shouldBlockFn={shouldBlockFn(hasChanges)} />
      </div>
    </div>
  );
}
