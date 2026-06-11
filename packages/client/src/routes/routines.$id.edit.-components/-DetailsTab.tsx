import type { Routine } from "@emstack/types";

import { useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon, Loader2, WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
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
import {
  buildConnectionOptions,
  decodeConnection,
  encodeConnection,
  fetchResources,
  fetchRoutineTemplates,
  fetchTasks,
  fetchTopics,
  formHasChanges,
  toOptions,
  upsertRoutine,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

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
    location: z.string(),
    prependText: z.string(),
    appendText: z.string(),
  })
  .refine(row => row.type === "" || row.id.length > 0, {
    message: "Required",
    path: ["id"],
  });

const detailsSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000),
  connections: z.array(z.string()),
  status: z.enum(["active", "inactive", "complete", "paused"]),
  mode: z.enum(["weekly", "daily"]),
  weekly: z.array(weeklyRowSchema).length(7),
});

interface DetailsTabProps {
  routine: Routine;
  onSaved: () => Promise<void>;
  onChangeStateChange?: (hasChanges: boolean) => void;
}

export function DetailsTab({
  routine,
  onSaved,
  onChangeStateChange,
}: DetailsTabProps) {
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
    queryKey: queryKeys.resources.list(),
    queryFn: () => fetchResources(),
  });

  const {
    data: routineTemplates,
  } = useQuery({
    queryKey: ["routineTemplates"],
    queryFn: () => fetchRoutineTemplates(),
  });

  const taskOptions = useMemo(() => toOptions(tasks), [tasks]);
  const resourceOptions = useMemo(() => toOptions(resources), [resources]);
  const connectionOptions = useMemo(
    () => buildConnectionOptions(topics, tasks, resources),
    [topics, tasks, resources],
  );

  const startingValues = useMemo(
    () => ({
      name: routine.name ?? "",
      description: routine.description ?? "",
      connections: (routine.connections ?? []).map(encodeConnection),
      status: routine.status ?? "active",
      mode: routine.mode ?? "weekly",
      weekly: weeklyToRows(routine.weekly),
    }),
    [routine],
  );

  const lastSavedRef = useRef(startingValues);
  const [isSaving, setIsSaving] = useState(false);

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: detailsSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      setIsSaving(true);
      try {
        const connections = value.connections
          .map(decodeConnection)
          .filter((c): c is NonNullable<typeof c> => c !== null);

        await upsertRoutine(routine.id, {
          name: value.name,
          description: value.description || null,
          connections,
          status: value.status,
          mode: value.mode,
          // Daily mode mirrors the single chosen entry onto all 7 days so
          // "today's item" resolves identically every day.
          weekly:
            value.mode === "daily"
              ? rowsToWeekly(fillAllDays(representativeRow(value.weekly)))
              : rowsToWeekly(value.weekly),
        });
        lastSavedRef.current = value;
        onChangeStateChange?.(false);
        await onSaved();
        toast.success("Details saved.");
      }
      catch {
        toast.error("Failed to save details.");
      }
      finally {
        setIsSaving(false);
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const hasChanges = formHasChanges(currentValues, lastSavedRef.current);
  const isDaily = currentValues.mode === "daily";

  useEffect(() => {
    onChangeStateChange?.(hasChanges);
  }, [hasChanges, onChangeStateChange]);

  return (
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
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="text-2xl">Weekly Schedule</span>
                  <DropdownMenu modal={false}>
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

      <div>
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save Details
        </Button>
      </div>
    </form>
  );
}
