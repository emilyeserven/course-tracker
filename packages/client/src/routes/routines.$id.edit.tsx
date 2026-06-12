import type { RoutineConnectionType, RoutineMode } from "@emstack/types";

import { useCallback, useMemo, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { CriteriaTab } from "./routines.$id.edit.-components/-CriteriaTab";
import { DetailsTab } from "./routines.$id.edit.-components/-DetailsTab";
import { EntriesTab } from "./routines.$id.edit.-components/-EntriesTab";

import { useAppForm } from "@/components/formFields";
import { EditForm } from "@/components/layout/EditForm";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { fillAllDays, rowsToWeekly } from "@/components/routines/weekly";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import {
  createRoutine,
  deleteSingleRoutine,
  duplicateRoutine,
  fetchSingleRoutine,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

const TAB_VALUES = ["details", "entries", "criteria"] as const;
type EditTab = (typeof TAB_VALUES)[number];

export interface RoutineEditSearch {
  // Legacy alias: a bare `?topicId=` still prefills a topic connection.
  topicId?: string;
  connectedType?: RoutineConnectionType;
  connectedId?: string;
  mode?: RoutineMode;
  entryType?: "task" | "resource";
  entryId?: string;
  tab?: EditTab;
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
    tab:
      typeof search.tab === "string"
      && (TAB_VALUES as readonly string[]).includes(search.tab)
        ? (search.tab as EditTab)
        : undefined,
  }),
});

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

const newRoutineSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  mode: z.enum(["weekly", "daily"]),
});

function SingleRoutineEdit() {
  const {
    id,
  } = Route.useParams();

  if (id === "new") {
    return <NewRoutine />;
  }
  return <ExistingRoutineEdit id={id} />;
}

function NewRoutine() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [isSaving, setIsSaving] = useState(false);

  // New routines can be prefilled via search params: the generic
  // `?connectedType=&connectedId=` or the legacy `?topicId=` alias, plus an
  // optional `?entryType=&entryId=` that seeds the weekly grid.
  const prefilledConnections = useMemo(() => {
    const out: { type: RoutineConnectionType;
      id: string; }[] = [];
    if (search.connectedType && search.connectedId) {
      out.push({
        type: search.connectedType,
        id: search.connectedId,
      });
    }
    if (search.topicId) {
      out.push({
        type: "topic",
        id: search.topicId,
      });
    }
    return out;
  }, [search.connectedType, search.connectedId, search.topicId]);

  const form = useAppForm({
    defaultValues: {
      name: "",
      mode: search.mode ?? "weekly",
    },
    validators: {
      onSubmit: newRoutineSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      setIsSaving(true);
      try {
        const weekly
          = search.entryType && search.entryId
            ? rowsToWeekly(
              fillAllDays({
                type: search.entryType,
                id: search.entryId,
              }),
            )
            : {};
        const result = await createRoutine({
          name: value.name,
          mode: value.mode,
          status: "active",
          connections: prefilledConnections,
          weekly,
        });
        await navigate({
          to: "/routines/$id/edit",
          params: {
            id: result.id,
          },
        });
      }
      catch {
        toast.error("Failed to create routine. Please try again.");
      }
      finally {
        setIsSaving(false);
      }
    },
  });

  const isSubmitting = useStore(form.store, state => state.isSubmitting);

  return (
    <div>
      <PageHeader
        pageTitle="New Routine"
        pageSection="routines"
      />
      <div className="m-auto w-full max-w-[1200px] px-4">
        <EditForm
          onSubmit={form.handleSubmit}
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

          <EditPageFooter isNew>
            <Button
              type="submit"
              disabled={isSubmitting || isSaving}
            >
              {(isSubmitting || isSaving) && (
                <Loader2 className="animate-spin" />
              )}
              Create Routine
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate({
                  to: "/routines",
                })}
            >
              Cancel
            </Button>
          </EditPageFooter>
        </EditForm>
      </div>
    </div>
  );
}

interface ExistingRoutineEditProps {
  id: string;
}

function ExistingRoutineEdit({
  id,
}: ExistingRoutineEditProps) {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const tab: EditTab = search.tab ?? "details";

  const {
    data: routine,
    queryClient,
    skipBlock,
    invalidateRelated,
    shouldBlockFn,
    makeDeleteHandler,
  } = useEditFormPage({
    id,
    isNew: false,
    queryKey: ["routine", id],
    queryFn: () => fetchSingleRoutine(id),
    relatedQueryKeys: [queryKeys.routines.list(), queryKeys.dailies.list()],
  });

  const [detailsHasChanges, setDetailsHasChanges] = useState(false);
  const [criteriaHasChanges, setCriteriaHasChanges] = useState(false);
  // Day Entries autosaves on every change, so it has no "unsaved" state.
  const anyTabHasChanges = detailsHasChanges || criteriaHasChanges;

  const handleSaved = useCallback(async () => {
    await invalidateRelated();
    await queryClient.invalidateQueries({
      queryKey: ["daily", id],
    });
  }, [invalidateRelated, queryClient, id]);

  const handleDelete = makeDeleteHandler({
    deleteFn: deleteSingleRoutine,
    entityLabel: "routine",
    navigateToList: () => navigate({
      to: "/routines",
    }),
  });

  async function handleDuplicate() {
    try {
      const result = await duplicateRoutine(id);
      await invalidateRelated();
      skipBlock();
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

  function changeTab(next: EditTab) {
    navigate({
      to: "/routines/$id/edit",
      params: {
        id,
      },
      search: {
        tab: next,
      },
      replace: true,
    });
  }

  if (!routine) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-3xl">Loading routine...</h1>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        pageTitle="Edit Routine"
        pageSection="routines"
      >
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
      </PageHeader>
      <div className="container flex flex-col gap-6">
        <Tabs
          value={tab}
          onValueChange={value => changeTab(value as EditTab)}
        >
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="entries">Day Entries</TabsTrigger>
            <TabsTrigger value="criteria">Status Criteria</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <DetailsTab
              routine={routine}
              onSaved={handleSaved}
              onChangeStateChange={setDetailsHasChanges}
            />
          </TabsContent>

          <TabsContent value="entries">
            <EntriesTab id={id} />
          </TabsContent>

          <TabsContent value="criteria">
            <CriteriaTab
              routine={routine}
              onSaved={handleSaved}
              onChangeStateChange={setCriteriaHasChanges}
            />
          </TabsContent>
        </Tabs>

        <EditPageFooter
          isNew={false}
          onDelete={handleDelete}
          deleteLabel="Delete Routine"
          onDuplicate={handleDuplicate}
          duplicateLabel="Duplicate Routine"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({
                to: "/routines/$id",
                params: {
                  id,
                },
              })}
          >
            Done
          </Button>
        </EditPageFooter>
      </div>
      <UnsavedChangesDialog
        shouldBlockFn={shouldBlockFn(anyTabHasChanges)}
      />
    </div>
  );
}
