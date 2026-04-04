import type { AnyFieldApi } from "@tanstack/react-form";

import { useMemo, useRef } from "react";

import { useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import * as z from "zod";

import {
  DatePickerField,
  InputField,
  NumberField,
  RadioGroupField,
  TextareaField,
} from "@/components/formFields";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import {
  createCourse,
  fetchSingleCourse,
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
  progressCurrent: z.number().int().min(0),
  progressTotal: z.number().int().min(0),
  cost: z.number().min(0),
  dateExpires: z.date().nullable(),
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

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      url: data?.url ?? "",
      status: data?.status ?? ("active" as const),
      progressCurrent: data?.progressCurrent ?? 0,
      progressTotal: data?.progressTotal ?? 0,
      cost: data?.cost ? Number(data.cost.cost) : 0,
      dateExpires: data?.dateExpires ? new Date(data.dateExpires) : null,
    }),
    [data],
  );

  const form = useForm({
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
        progressCurrent: value.progressCurrent,
        progressTotal: value.progressTotal,
        cost: value.cost ? String(value.cost) : null,
        isCostFromPlatform: data?.cost?.isCostFromPlatform ?? false,
        dateExpires: value.dateExpires
          ? value.dateExpires.toISOString().split("T")[0]
          : null,
        isExpires: !!value.dateExpires,
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

  const currentValues = useStore(form.store, state => state.values);
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
        <InputField
          form={form}
          name="name"
          label="Course Name"
        />

        <TextareaField
          form={form}
          name="description"
          label="Description"
          placeholder="What is this course about?"
        />

        <InputField
          form={form}
          name="url"
          label="Course URL"
        />

        <RadioGroupField
          form={form}
          name="status"
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

        <div className="grid grid-cols-2 gap-4">
          <NumberField
            form={form}
            name="progressCurrent"
            label="Current Progress"
            min={0}
            validators={{
              onSubmit: ({
                value,
                fieldApi,
              }: {
                value: number;
                fieldApi: AnyFieldApi;
              }) => {
                const total = fieldApi.form.getFieldValue("progressTotal");
                if (value > total) {
                  return {
                    message: "Current progress cannot exceed total modules",
                  };
                }
                return undefined;
              },
            }}
          />

          <NumberField
            form={form}
            name="progressTotal"
            label="Total Modules"
            min={0}
          />
        </div>

        <NumberField
          form={form}
          name="cost"
          label="Cost ($)"
          min={0}
          step="0.01"
        />

        <DatePickerField
          form={form}
          name="dateExpires"
          label="Expiry Date"
        />

        <div className="flex flex-row gap-4">
          <Button type="submit">
            {isNew ? "Create Course" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              skipBlocker.current = true;
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
