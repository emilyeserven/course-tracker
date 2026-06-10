import type { RoutineConnectionType, RoutineMode } from "@emstack/types/src";

import { useMemo, useRef } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDownIcon, EyeIcon, Loader2, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { DAILY_STATUS_OPTIONS } from "@/components/dailies/dailyStatusMeta";
import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  fillAllDays,
  representativeRow,
  rowsToWeekly,
  weeklyToRows,
} from "@/components/routines/weekly";
import { WeeklyEntryEditor } from "@/components/routines/WeeklyEntryEditor";
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
  buildConnectionOptions,
  createRoutine,
  decodeConnection,
  deleteSingleRoutine,
  duplicateRoutine,
  encodeConnection,
  fetchDailyCriteriaTemplates,
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
  // Legacy alias: a bare `?topicId=` still prefills a topic connection.
  topicId?: string;
  connectedType?: RoutineConnectionType;
  connectedId?: string;
  mode?: RoutineMode;
  entryType?: "task" | "resource";
  entryId?: string;
}

export const Route = createFileRoute("/routines/$id/edit")({
  component: SingleRoutineEdit,
  validateSearch: (search: Record<string, unknown>): RoutineEditSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
    connectedType:
      search.connectedType === "topic"
      || search.connectedType === "task"
      || search.connectedType === "resource"
        ? search.connectedType
        : undefined,
    connectedId:
      typeof search.connectedId === "string" && search.connectedId
        ? search.connectedId
        : undefined,
    mode:
      search.mode === "weekly" || search.mode === "daily"
        ? search.mode
        : undefined,
    entryType:
      search.entryType === "task" || search.entryType === "resource"
        ? search.entryType
        : undefined,
    entryId:
      typeof search.entryId === "string" && search.entryId
        ? search.entryId
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

const MODE_OPTIONS = [
  {
    value: "weekly",
    label: "Weekly Schedule",
  },
  {
    value: "daily",
    label: "Daily Task",
  },
];

const weeklyRowSchema = z
  .object({
    day: z.enum(["0", "1", "2", "3", "4", "5", "6"]),
    type: z.enum(["", "task", "resource", "freeform"]),
    id: z.string(),
    notes: z.string(),
    prependText: z.string(),
    appendText: z.string(),
  })
  .refine(row => row.type === "" || row.id.length > 0, {
    message: "Required",
    path: ["id"],
  });

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000),
  connections: z.array(z.string()),
  status: z.enum(["active", "inactive", "complete", "paused"]),
  mode: z.enum(["weekly", "daily"]),
  location: z.string().max(255),
  weekly: z.array(weeklyRowSchema).length(7),
  criteriaIncomplete: z.string().max(500),
  criteriaTouched: z.string().max(500),
  criteriaGoal: z.string().max(500),
  criteriaExceeded: z.string().max(500),
  criteriaFreeze: z.string().max(500),
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

  const {
    data: criteriaTemplates,
  } = useQuery({
    queryKey: ["dailyCriteriaTemplates"],
    queryFn: () => fetchDailyCriteriaTemplates(),
  });

  const taskOptions = useMemo(() => toOptions(tasks), [tasks]);
  const resourceOptions = useMemo(() => toOptions(resources), [resources]);
  const connectionOptions = useMemo(
    () => buildConnectionOptions(topics, tasks, resources),
    [topics, tasks, resources],
  );

  // New routines can be prefilled with a connection via search params: the
  // generic `?connectedType=&connectedId=` or the legacy `?topicId=` alias.
  const prefilledConnections = useMemo(() => {
    const out: string[] = [];
    if (search.connectedType && search.connectedId) {
      out.push(
        encodeConnection({
          type: search.connectedType,
          id: search.connectedId,
        }),
      );
    }
    if (search.topicId) {
      out.push(encodeConnection({
        type: "topic",
        id: search.topicId,
      }));
    }
    return out;
  }, [search.connectedType, search.connectedId, search.topicId]);

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      connections: isNew
        ? prefilledConnections
        : (data?.connections ?? []).map(encodeConnection),
      status: data?.status ?? "active",
      mode: data?.mode ?? (isNew ? (search.mode ?? "weekly") : "weekly"),
      location: data?.location ?? "",
      weekly:
        isNew && search.entryType && search.entryId
          ? fillAllDays({
            type: search.entryType,
            id: search.entryId,
          })
          : weeklyToRows(data?.weekly),
      criteriaIncomplete: data?.criteria?.incomplete ?? "",
      criteriaTouched: data?.criteria?.touched ?? "",
      criteriaGoal: data?.criteria?.goal ?? "",
      criteriaExceeded: data?.criteria?.exceeded ?? "",
      criteriaFreeze: data?.criteria?.freeze ?? "",
    }),
    [data, isNew, prefilledConnections, search.mode, search.entryType, search.entryId],
  );

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const criteria: Record<string, string> = {};
      if (value.criteriaIncomplete) {
        criteria.incomplete = value.criteriaIncomplete;
      }
      if (value.criteriaTouched) {
        criteria.touched = value.criteriaTouched;
      }
      if (value.criteriaGoal) {
        criteria.goal = value.criteriaGoal;
      }
      if (value.criteriaExceeded) {
        criteria.exceeded = value.criteriaExceeded;
      }
      if (value.criteriaFreeze) {
        criteria.freeze = value.criteriaFreeze;
      }

      const connections = value.connections
        .map(decodeConnection)
        .filter((c): c is NonNullable<typeof c> => c !== null);

      const routineData = {
        name: value.name,
        description: value.description || null,
        connections,
        status: value.status,
        mode: value.mode,
        location: value.mode === "daily" ? value.location || null : null,
        // Daily mode mirrors the single chosen entry onto all 7 days so
        // "today's item" resolves identically every day.
        weekly:
          value.mode === "daily"
            ? rowsToWeekly(fillAllDays(representativeRow(value.weekly)))
            : rowsToWeekly(value.weekly),
        criteria,
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
        await queryClient.invalidateQueries({
          queryKey: ["dailies"],
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
  const isDaily = currentValues.mode === "daily";

  async function handleDelete() {
    try {
      await deleteSingleRoutine(id);
      await queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["dailies"],
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

  async function handleDuplicate() {
    try {
      const result = await duplicateRoutine(id);
      await queryClient.invalidateQueries({
        queryKey: ["routines"],
      });
      skipBlocker.current = true;
      await navigate({
        to: "/routines/$id/edit",
        params: {
          id: result.id,
        },
      });
    }
    catch {
      toast.error("Failed to duplicate routine. Please try again.");
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

          <form.AppField name="mode">
            {field => (
              <field.RadioGroupField
                label="Type"
                options={MODE_OPTIONS}
              />
            )}
          </form.AppField>

          <form.AppField name="connections">
            {field => (
              <field.MultiComboboxField
                label="Connected To"
                options={connectionOptions}
                groupByPrefix
                placeholder="Search topics, tasks, resources..."
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

          {isDaily && (
            <form.AppField name="location">
              {field => (
                <field.InputField
                  label="Location"
                  placeholder="e.g. Spanish app, gym, journal"
                />
              )}
            </form.AppField>
          )}

          <form.Field name="weekly">
            {field =>
              isDaily
                ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-2xl">Daily Task</span>
                    <p className="text-sm text-muted-foreground">
                      Pick what to work on each day — the same item applies to
                      every day of the week.
                    </p>
                    <div className="mt-1">
                      <WeeklyEntryEditor
                        {...representativeRow(field.state.value)}
                        onChange={next =>
                          field.handleChange(fillAllDays(next))}
                        taskOptions={taskOptions}
                        resourceOptions={resourceOptions}
                      />
                    </div>
                  </div>
                )
                : (
                  <div className="flex flex-col gap-1">
                    <div
                      className="
                        flex flex-wrap items-center justify-between gap-2
                      "
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
                                  field.handleChange(
                                    weeklyToRows(template.weekly),
                                  );
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

          <div className="flex flex-col gap-4 rounded-md border bg-card p-4">
            <div
              className="
                flex flex-row flex-wrap items-start justify-between gap-2
              "
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl">Status Criteria</h2>
                <p className="text-sm text-muted-foreground">
                  Optional notes describing what each status means for this
                  routine.
                </p>
              </div>
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
                  {(criteriaTemplates ?? []).length === 0
                    ? (
                      <DropdownMenuItem disabled>
                        No templates — add one in Settings
                      </DropdownMenuItem>
                    )
                    : (criteriaTemplates ?? []).map(template => (
                      <DropdownMenuItem
                        key={template.id}
                        onSelect={() => {
                          form.setFieldValue(
                            "criteriaIncomplete",
                            template.incomplete,
                          );
                          form.setFieldValue(
                            "criteriaTouched",
                            template.touched,
                          );
                          form.setFieldValue("criteriaGoal", template.goal);
                          form.setFieldValue(
                            "criteriaExceeded",
                            template.exceeded,
                          );
                          form.setFieldValue(
                            "criteriaFreeze",
                            template.freeze,
                          );
                        }}
                      >
                        {template.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <form.AppField name="criteriaIncomplete">
              {field => (
                <field.TextareaField
                  label="Incomplete"
                  placeholder="What does &quot;Incomplete&quot; mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "incomplete")?.icon}
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaTouched">
              {field => (
                <field.TextareaField
                  label="Touched"
                  placeholder="What does &quot;Touched&quot; mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "touched")?.icon}
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaGoal">
              {field => (
                <field.TextareaField
                  label="Completed (Goal)"
                  placeholder="What does &quot;Completed&quot; (goal) mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "goal")?.icon}
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaExceeded">
              {field => (
                <field.TextareaField
                  label="Exceeded"
                  placeholder="What does &quot;Exceeded&quot; mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "exceeded")?.icon}
                />
              )}
            </form.AppField>
            <form.AppField name="criteriaFreeze">
              {field => (
                <field.TextareaField
                  label="Freeze"
                  placeholder="What does &quot;Freeze&quot; mean here?"
                  labelIcon={DAILY_STATUS_OPTIONS.find(o =>
                    o.value === "freeze")?.icon}
                />
              )}
            </form.AppField>
          </div>

          <EditPageFooter
            isNew={isNew}
            onDelete={handleDelete}
            deleteLabel="Delete Routine"
            onDuplicate={isNew ? undefined : handleDuplicate}
            duplicateLabel="Duplicate Routine"
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
