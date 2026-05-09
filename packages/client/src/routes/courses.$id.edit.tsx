import type { AnyFieldApi } from "@tanstack/react-form";

import { useMemo } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import {
  createProvider,
  createTopic,
  deleteSingleCourse,
  duplicateCourse,
  fetchProviders,
  fetchSingleCourse,
  fetchTopics,
  formHasChanges,
  upsertCourse,
  uuidv4,
} from "@/utils";

export const Route = createFileRoute("/courses/$id/edit")({
  component: SingleCourseEdit,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500),
  url: z.string().max(255),
  status: z.enum(["active", "inactive", "complete"]),
  progressCurrent: z.number().int().min(0).nullable(),
  progressTotal: z.number().int().min(0).nullable(),
  cost: z.number().min(0).nullable(),
  dateExpires: z.date().nullable(),
  topicId: z.string(),
  courseProviderId: z.string(),
  modulesAreExhaustive: z.boolean(),
});

function SingleCourseEdit() {
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
    queryKey: ["course", id],
    queryFn: () => fetchSingleCourse(id),
    relatedQueryKeys: [["courses"], ["topics"]],
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: providers,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const topicOptions = (topics ?? []).map(t => ({
    value: t.id,
    label: t.name,
  }));

  const providerOptions = (providers ?? []).map(p => ({
    value: p.id,
    label: p.name,
  }));

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      url: data?.url ?? "",
      status: data?.status ?? ("active" as const),
      progressCurrent: data?.progressCurrent ?? null,
      progressTotal: data?.progressTotal ?? null,
      cost: data?.cost?.cost != null ? Number(data.cost.cost) : null,
      dateExpires: data?.dateExpires ? new Date(data.dateExpires) : null,
      topicId: (Array.isArray(data?.topics) && data.topics[0]?.id) || "",
      courseProviderId: data?.provider?.id ?? "",
      modulesAreExhaustive: data?.modulesAreExhaustive ?? false,
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
      const courseData = {
        name: value.name,
        description: value.description || null,
        url: value.url || null,
        status: value.status,
        progressCurrent: value.progressCurrent ?? 0,
        progressTotal: value.progressTotal ?? 0,
        cost: isCostFromPlatform
          ? null
          : value.cost != null
            ? String(value.cost)
            : null,
        isCostFromPlatform,
        dateExpires: value.dateExpires
          ? value.dateExpires.toISOString().split("T")[0]
          : null,
        isExpires: !!value.dateExpires,
        topicId: value.topicId || null,
        courseProviderId: value.courseProviderId || null,
        modulesAreExhaustive: value.modulesAreExhaustive,
      };

      try {
        const courseId = isNew ? uuidv4() : id;
        const previousStatus = data?.status;
        await upsertCourse(courseId, courseData);
        await invalidateRelated();
        skipBlock();

        const becameActive
          = value.status === "active"
            && (isNew || previousStatus !== "active");
        await navigate({
          to: "/courses/$id",
          params: {
            id: courseId,
          },
          search: becameActive
            ? {
              promptDaily: 1,
            }
            : {},
        });
      }
      catch (err) {
        console.error("Failed to save resource:", err);
        toast.error(
          isNew
            ? "Failed to create resource. Please try again."
            : "Failed to save resource. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);
  const selectedProvider = (providers ?? []).find(
    p => p.id === currentValues.courseProviderId,
  );
  const isCostFromPlatform = !!selectedProvider?.isCourseFeesShared;

  if (isCostFromPlatform && selectedProvider?.cost != null) {
    const providerCost = Number(selectedProvider.cost);
    if (currentValues.cost !== providerCost) {
      form.setFieldValue("cost", providerCost);
    }
  }

  const handleDelete = makeDeleteHandler({
    deleteFn: deleteSingleCourse,
    entityLabel: "course",
    navigateToList: () => navigate({
      to: "/courses",
    }),
  });

  async function handleDuplicate() {
    try {
      const result = await duplicateCourse(id);
      await invalidateRelated();
      skipBlock();
      await navigate({
        to: "/courses/$id",
        params: {
          id: result.id,
        },
      });
    }
    catch {
      toast.error("Failed to duplicate resource. Please try again.");
    }
  }

  return (
    <div className="m-auto w-full max-w-[1200px] px-4">
      <h2 className="mb-6 text-2xl">{isNew ? "New Resource" : "Edit Resource"}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex max-w-2xl flex-col gap-8"
      >
        <form.AppField name="name">
          {field => <field.InputField label="Resource Name" />}
        </form.AppField>

        <form.AppField name="description">
          {field => (
            <field.TextareaField
              label="Description"
              placeholder="What is this course about?"
            />
          )}
        </form.AppField>

        <form.AppField name="url">
          {field => <field.InputField label="Resource URL" />}
        </form.AppField>

        <form.AppField name="topicId">
          {field => (
            <field.ComboboxField
              label="Topic"
              options={topicOptions}
              placeholder="Search topics..."
              create={{
                itemLabel: "topic",
                fields: [
                  {
                    name: "name",
                    label: "Name",
                    required: true,
                    isPrimary: true,
                  },
                ],
                onCreate: async (values) => {
                  const result = await createTopic(values);
                  await queryClient.invalidateQueries({
                    queryKey: ["topics"],
                  });
                  return result.id;
                },
              }}
            />
          )}
        </form.AppField>

        <form.AppField name="courseProviderId">
          {field => (
            <field.ComboboxField
              label="Provider"
              options={providerOptions}
              placeholder="Search providers..."
              create={{
                itemLabel: "provider",
                fields: [
                  {
                    name: "name",
                    label: "Name",
                    required: true,
                    isPrimary: true,
                  },
                  {
                    name: "url",
                    label: "URL",
                    required: true,
                    type: "url",
                    placeholder: "https://...",
                  },
                ],
                onCreate: async (values) => {
                  const result = await createProvider(values);
                  await queryClient.invalidateQueries({
                    queryKey: ["providers"],
                  });
                  return result.id;
                },
              }}
            />
          )}
        </form.AppField>

        <form.AppField name="status">
          {field => (
            <field.RadioGroupField
              label="Status"
              options={[
                {
                  value: "active",
                  label: "active",
                },
                {
                  value: "inactive",
                  label: "inactive",
                },
                {
                  value: "complete",
                  label: "complete",
                },
              ]}
            />
          )}
        </form.AppField>

        <div className="grid grid-cols-2 gap-4">
          <form.AppField
            name="progressCurrent"
            validators={{
              onSubmit: ({
                value,
                fieldApi,
              }: {
                value: number | null;
                fieldApi: AnyFieldApi;
              }) => {
                const total = fieldApi.form.getFieldValue("progressTotal");
                if (value != null && total != null && value > total) {
                  return {
                    message: "Current progress cannot exceed total modules",
                  };
                }
                return undefined;
              },
            }}
          >
            {field => (
              <field.NumberField
                label="Current Progress"
                min={0}
              />
            )}
          </form.AppField>

          <form.AppField name="progressTotal">
            {field => (
              <field.NumberField
                label="Total Modules"
                min={0}
              />
            )}
          </form.AppField>
        </div>

        <form.Field name="modulesAreExhaustive">
          {field => (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={e => field.handleChange(e.target.checked)}
                className="mt-0.5 size-4"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">
                  Module list is exhaustive
                </span>
                <span className="text-xs text-muted-foreground">
                  When checked, course progress is computed from the count of
                  completed modules below rather than the manual fields above.
                </span>
              </span>
            </label>
          )}
        </form.Field>

        <form.AppField name="cost">
          {field => (
            <field.NumberField
              label="Cost ($)"
              min={0}
              step="0.01"
              disabled={isCostFromPlatform}
            />
          )}
        </form.AppField>

        <form.AppField name="dateExpires">
          {field => <field.DatePickerField label="Expiry Date" />}
        </form.AppField>

        <EditPageFooter
          isNew={isNew}
          onDelete={handleDelete}
          deleteLabel="Delete Resource"
          onDuplicate={handleDuplicate}
          duplicateLabel="Duplicate Resource"
        >
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isNew ? "Create Resource" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (isNew) {
                navigate({
                  to: "/courses",
                });
              }
              else {
                navigate({
                  to: "/courses/$id",
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
  );
}
