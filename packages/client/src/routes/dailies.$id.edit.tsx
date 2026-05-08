import { useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { DailyCompletionsManager } from "@/components/dailies";
import { useAppForm } from "@/components/formFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import {
  createDaily,
  fetchCourses,
  fetchProviders,
  fetchSingleDaily,
  formHasChanges,
  upsertDaily,
} from "@/utils";

interface DailyEditSearch {
  newCourseId?: string;
}

export const Route = createFileRoute("/dailies/$id/edit")({
  component: SingleDailyEdit,
  validateSearch: (search: Record<string, unknown>): DailyEditSearch => ({
    newCourseId:
      typeof search.newCourseId === "string" && search.newCourseId
        ? search.newCourseId
        : undefined,
  }),
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  location: z.string().max(255),
  description: z.string().max(500),
  courseProviderId: z.string(),
  courseId: z.string(),
});

function SingleDailyEdit() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const skipBlocker = useRef(false);

  const {
    data,
  } = useQuery({
    queryKey: ["daily", id],
    queryFn: () => fetchSingleDaily(id),
    enabled: !isNew,
  });

  const {
    data: providers,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const {
    data: courses,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const providerOptions = (providers ?? []).map(p => ({
    value: p.id,
    label: p.name,
  }));

  const courseOptions = (courses ?? []).map(c => ({
    value: c.id,
    label: c.name,
  }));

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      location: data?.location ?? "",
      description: data?.description ?? "",
      courseProviderId: data?.provider?.id ?? "",
      courseId: data?.course?.id ?? (isNew && search.newCourseId
        ? search.newCourseId
        : ""),
    }),
    [data, isNew, search.newCourseId],
  );

  const [informFromCourse, setInformFromCourse] = useState<boolean>(
    !!(isNew && search.newCourseId),
  );

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const dailyData = {
        name: value.name,
        location: value.location || null,
        description: value.description || null,
        completions: data?.completions ?? [],
        courseProviderId: value.courseProviderId || null,
        courseId: value.courseId || null,
      };

      try {
        let dailyId: string;
        if (isNew) {
          const result = await createDaily(dailyData);
          dailyId = result.id;
        }
        else {
          await upsertDaily(id, dailyData);
          dailyId = id;
          await queryClient.invalidateQueries({
            queryKey: ["daily", id],
          });
        }

        await queryClient.invalidateQueries({
          queryKey: ["dailies"],
        });
        skipBlocker.current = true;
        await navigate({
          to: "/dailies/$id",
          params: {
            id: dailyId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create daily. Please try again."
            : "Failed to save daily. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  const selectedCourse = useMemo(
    () =>
      currentValues.courseId
        ? (courses ?? []).find(c => c.id === currentValues.courseId)
        : undefined,
    [currentValues.courseId, courses],
  );

  // When "Inform data from course" is checked, mirror the chosen course's
  // name / url / provider into the daily fields. We rerun whenever either
  // the toggle or the course changes.
  useEffect(() => {
    if (!informFromCourse || !selectedCourse) {
      return;
    }
    if (currentValues.name !== selectedCourse.name) {
      form.setFieldValue("name", selectedCourse.name);
    }
    const courseLocation = selectedCourse.url ?? "";
    if (currentValues.location !== courseLocation) {
      form.setFieldValue("location", courseLocation);
    }
    const courseProviderId = selectedCourse.provider?.id ?? "";
    if (currentValues.courseProviderId !== courseProviderId) {
      form.setFieldValue("courseProviderId", courseProviderId);
    }
  }, [
    informFromCourse,
    selectedCourse,
    currentValues.name,
    currentValues.location,
    currentValues.courseProviderId,
    form,
  ]);

  // If the user clears the course while the toggle is on, turn it off so
  // the disabled fields don't get stuck.
  useEffect(() => {
    if (informFromCourse && !currentValues.courseId) {
      setInformFromCourse(false);
    }
  }, [informFromCourse, currentValues.courseId]);

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Daily" : "Edit Daily"}
        pageSection="dailies"
      >
        {!isNew && (
          <Link
            to="/dailies/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Daily
              {" "}
              <EyeIcon />
            </Button>
          </Link>
        )}
      </PageHeader>
      <div className="container flex-col">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex max-w-2xl flex-col gap-8"
        >
          <form.AppField name="courseId">
            {field => (
              <field.ComboboxField
                label="Course"
                options={courseOptions}
                placeholder="Search courses..."
              />
            )}
          </form.AppField>

          {currentValues.courseId && (
            <label className="flex flex-row items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={informFromCourse}
                onChange={e => setInformFromCourse(e.target.checked)}
                className="size-4"
              />
              <span>Inform data from course</span>
            </label>
          )}

          <form.AppField name="name">
            {field => (
              <field.InputField
                label="Daily Name"
                disabled={informFromCourse}
              />
            )}
          </form.AppField>

          <form.AppField name="location">
            {field => (
              <field.InputField
                label="Location"
                placeholder="e.g. Spanish app, gym, journal"
                disabled={informFromCourse}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What is this daily about?"
              />
            )}
          </form.AppField>

          <form.AppField name="courseProviderId">
            {field => (
              <field.ComboboxField
                label="Provider"
                options={providerOptions}
                placeholder="Search providers..."
                disabled={informFromCourse}
              />
            )}
          </form.AppField>

          <div className="flex flex-row gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Daily" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/dailies",
                  });
                }
                else {
                  navigate({
                    to: "/dailies/$id",
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
        {!isNew && data && (
          <div className="mt-12 flex max-w-2xl flex-col gap-4 border-t pt-8">
            <h2 className="text-2xl">Completions</h2>
            <p className="text-sm text-muted-foreground">
              Pick a date below to retroactively set or change the status for that day.
            </p>
            <DailyCompletionsManager daily={data} />
          </div>
        )}
      </div>
    </div>
  );
}
