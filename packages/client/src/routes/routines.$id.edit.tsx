import { useMemo, useRef } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDownIcon, EyeIcon, Loader2, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { rowsToWeekly, weeklyToRows } from "@/components/routines/weekly";
import { WeeklyScheduleField } from "@/components/routines/WeeklyScheduleField";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import {
  createRoutine,
  deleteSingleRoutine,
  fetchResources,
  fetchRoutineTemplates,
  fetchSingleRoutine,
  fetchTasks,
  fetchTopics,
  formHasChanges,
  toOptions,
  upsertRoutine,
} from "@/utils";

interface RoutineEditSearch {
  topicId?: string;
}

export const Route = createFileRoute("/routines/$id/edit")({
  component: SingleRoutineEdit,
  validateSearch: (search: Record<string, unknown>): RoutineEditSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
  }),
});

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "Active",
  },
  {
    value: "inactive",
    label: "Inactive",
  },
  {
    value: "complete",
    label: "Complete",
  },
  {
    value: "paused",
    label: "Paused",
  },
];

const weeklyRowSchema = z
  .object({
    day: z.enum(["0", "1", "2", "3", "4", "5", "6"]),
    type: z.enum(["", "task", "resource"]),
    id: z.string(),
  })
  .refine(row => row.type === "" || row.id.length > 0, {
    message: "Pick an item for this day",
    path: ["id"],
  });

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000),
  topicId: z.string(),
  status: z.enum(["active", "inactive", "complete", "paused"]),
  weekly: z.array(weeklyRowSchema).length(7),
});

function SingleRoutineEdit() {
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
    queryKey: ["routine", id],
    queryFn: () => fetchSingleRoutine(id),
    enabled: !isNew,
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: tasks,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
  });

  const {
    data: resources,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchResources(),
  });

  const {
    data: routineTemplates,
  } = useQuery({
    queryKey: ["routineTemplates"],
    queryFn: () => fetchRoutineTemplates(),
  });

  const topicOptions = toOptions(topics);
  const taskOptions = useMemo(() => toOptions(tasks), [tasks]);
  const resourceOptions = useMemo(() => toOptions(resources), [resources]);

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      topicId: data?.topicId ?? (isNew ? (search.topicId ?? "") : ""),
      status: data?.status ?? "active",
      weekly: weeklyToRows(data?.weekly),
    }),
    [data, isNew, search.topicId],
  );

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const routineData = {
        name: value.name,
        description: value.description || null,
        topicId: value.topicId || null,
        status: value.status,
        weekly: rowsToWeekly(value.weekly),
      };

      try {
        let routineId: string;
        if (isNew) {
          const result = await createRoutine(routineData);
          routineId = result.id;
        }
        else {
          await upsertRoutine(id, routineData);
          routineId = id;
          await queryClient.invalidateQueries({
            queryKey: ["routine", id],
          });
        }
        await queryClient.invalidateQueries({
          queryKey: ["routines"],
        });
        skipBlocker.current = true;
        await navigate({
          to: "/routines/$id",
          params: {
            id: routineId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create routine. Please try again."
            : "Failed to save routine. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  async function handleDelete() {
    try {
      await deleteSingleRoutine(id);
      await queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
      skipBlocker.current = true;
      await navigate({
        to: "/routines",
      });
    }
    catch {
      toast.error("Failed to delete routine. Please try again.");
    }
  }

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Routine" : "Edit Routine"}
        pageSection="routines"
      >
        {!isNew && (
          <Link
            to="/routines/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Routine
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
          className="flex max-w-3xl flex-col gap-8"
        >
          <form.AppField name="name">
            {field => <field.InputField label="Routine Name" />}
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
                options={STATUS_OPTIONS}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What is this routine about?"
              />
            )}
          </form.AppField>

          <form.Field name="weekly">
            {field => (
              <div className="flex flex-col gap-1">
                <div
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="text-2xl">Weekly Schedule</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                      >
                        <WandSparklesIcon className="size-4" />
                        Quick Fill
                        <ChevronDownIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(routineTemplates ?? []).length === 0
                        ? (
                          <DropdownMenuItem disabled>
                            No templates — add one in Settings
                          </DropdownMenuItem>
                        )
                        : (routineTemplates ?? []).map(template => (
                          <DropdownMenuItem
                            key={template.id}
                            onSelect={() => {
                              field.handleChange(weeklyToRows(template.weekly));
                            }}
                          >
                            {template.label}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <WeeklyScheduleField
                  value={field.state.value}
                  onChange={next => field.handleChange(next)}
                  taskOptions={taskOptions}
                  resourceOptions={resourceOptions}
                />
              </div>
            )}
          </form.Field>

          <EditPageFooter
            isNew={isNew}
            onDelete={handleDelete}
            deleteLabel="Delete Routine"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Routine" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/routines",
                  });
                }
                else {
                  navigate({
                    to: "/routines/$id",
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
          shouldBlockFn={() => hasChanges && !skipBlocker.current}
        />
      </div>
    </div>
  );
}
