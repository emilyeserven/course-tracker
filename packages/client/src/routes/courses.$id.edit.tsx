import type { AnyFieldApi } from "@tanstack/react-form";

import { useMemo, useRef } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import {
  createCourse,
  fetchSingleCourse,
  fetchTopics,
  formHasChanges,
  upsertCourse,
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
});

function SingleCourseEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const skipBlocker = useRef(false);

  const {
    data,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchSingleCourse(id),
    enabled: !isNew,
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const topicOptions = (topics ?? []).map(t => ({
    value: t.id,
    label: t.name,
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
        cost: data?.cost?.isCostFromPlatform
          ? null
          : value.cost != null
            ? String(value.cost)
            : null,
        isCostFromPlatform: data?.cost?.isCostFromPlatform ?? false,
        dateExpires: value.dateExpires
          ? value.dateExpires.toISOString().split("T")[0]
          : null,
        isExpires: !!value.dateExpires,
        topicId: value.topicId || null,
      };

      try {
        let courseId: string;
        if (isNew) {
          const result = await createCourse(courseData);
          courseId = result.id;
        }
        else {
          await upsertCourse(id, courseData);
          courseId = id;
          await queryClient.invalidateQueries({
            queryKey: ["course", id],
          });
        }

        await queryClient.invalidateQueries({
          queryKey: ["courses"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["topics"],
        });
        skipBlocker.current = true;
        await navigate({
          to: "/courses/$id",
          params: {
            id: courseId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create course. Please try again."
            : "Failed to save course. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  return (
    <div className="container flex-col">
      <h2 className="mb-6 text-2xl">{isNew ? "New Course" : "Edit Course"}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex max-w-2xl flex-col gap-8"
      >
        <form.AppField name="name">
          {field => <field.InputField label="Course Name" />}
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
          {field => <field.InputField label="Course URL" />}
        </form.AppField>

        <form.AppField name="topicId">
          {field => (
            <field.ComboboxField
              label="Topic"
              options={topicOptions}
              placeholder="Search topics..."
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

        <form.AppField name="cost">
          {field => (
            <field.NumberField
              label="Cost ($)"
              min={0}
              step="0.01"
              disabled={data?.cost?.isCostFromPlatform ?? false}
            />
          )}
        </form.AppField>

        <form.AppField name="dateExpires">
          {field => <field.DatePickerField label="Expiry Date" />}
        </form.AppField>

        <div className="flex flex-row gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isNew ? "Create Course" : "Save Changes"}
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
        </div>
      </form>
      <UnsavedChangesDialog
        shouldBlockFn={() => hasChanges && !skipBlocker.current}
      />
    </div>
  );
}
