import { useMemo } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResourceLinksPicker } from "@/components/tasks/ResourceLinksPicker";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import {
  createDomain,
  createTopic,
  deleteSingleTopic,
  fetchResources,
  fetchDomains,
  fetchModuleGroups,
  fetchModules,
  fetchSingleTopic,
  fetchTagGroups,
  formHasChanges,
  upsertTopic,
} from "@/utils";

export const Route = createFileRoute("/topics/$id/edit")({
  component: SingleTopicEdit,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500),
  reason: z.string().max(500),
  domainIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  resourceLinks: z.array(
    z.object({
      resourceId: z.string(),
      moduleGroupId: z.string().nullable(),
      moduleId: z.string().nullable(),
    }),
  ),
});

function SingleTopicEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data,
    skipBlock,
    invalidateRelated,
    shouldBlockFn,
    makeDeleteHandler,
  } = useEditFormPage({
    id,
    isNew,
    queryKey: ["topic", id],
    queryFn: () => fetchSingleTopic(id),
    relatedQueryKeys: [["topics"], ["domains"]],
  });

  const {
    data: domainsData,
  } = useQuery({
    queryKey: ["domains"],
    queryFn: () => fetchDomains(),
  });

  const {
    data: tagGroups,
  } = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => fetchTagGroups(),
  });

  const {
    data: courses,
  } = useQuery({
    queryKey: ["courses"],
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

  const domainOptions = useMemo(
    () =>
      (domainsData ?? [])
        .filter(d => d.title)
        .map(d => ({
          value: d.id,
          label: d.title,
        })),
    [domainsData],
  );

  const tagOptions = useMemo(
    () =>
      (tagGroups ?? []).flatMap(group =>
        (group.tags ?? []).map(tag => ({
          value: tag.id,
          label: tag.name,
        }))),
    [tagGroups],
  );

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      reason: data?.reason ?? "",
      domainIds: data?.domains?.map(d => d.id) ?? [],
      tagIds: (data?.tags ?? []).map(t => t.id),
      resourceLinks: (data?.resourceLinks ?? []).map(l => ({
        resourceId: l.resourceId,
        moduleGroupId: l.moduleGroupId ?? null,
        moduleId: l.moduleId ?? null,
      })),
    }),
    [data],
  );

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const topicData = {
        name: value.name,
        description: value.description || null,
        reason: value.reason || null,
        domainIds: value.domainIds,
        tagIds: value.tagIds,
        resourceLinks: value.resourceLinks,
      };

      try {
        let topicId: string;
        if (isNew) {
          const result = await createTopic(topicData);
          topicId = result.id;
        }
        else {
          await upsertTopic(id, topicData);
          topicId = id;
        }
        await invalidateRelated();
        skipBlock();
        await navigate({
          to: "/topics/$id",
          params: {
            id: topicId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create topic. Please try again."
            : "Failed to save topic. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  const handleDelete = makeDeleteHandler({
    deleteFn: deleteSingleTopic,
    entityLabel: "topic",
    navigateToList: () => navigate({
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
          <Link
            to="/topics/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Topic
              {" "}
              <EyeIcon />
            </Button>
          </Link>
        )}
      </PageHeader>
      <div className="m-auto w-full max-w-[1200px] px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
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

          <form.AppField name="domainIds">
            {field => (
              <field.MultiComboboxField
                label="Domains"
                options={domainOptions}
                placeholder="Search domains..."
                create={{
                  itemLabel: "domain",
                  fields: [
                    {
                      name: "title",
                      label: "Title",
                      required: true,
                      isPrimary: true,
                    },
                  ],
                  onCreate: async (values) => {
                    const result = await createDomain(values);
                    await queryClient.invalidateQueries({
                      queryKey: ["domains"],
                    });
                    return result.id;
                  },
                }}
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
        </form>
        <UnsavedChangesDialog
          shouldBlockFn={shouldBlockFn(hasChanges)}
        />
      </div>
    </div>
  );
}
