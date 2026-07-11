import type { RoutineConnectionType, RoutineMode } from "@emstack/types";

import { useCallback, useState } from "react";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon } from "lucide-react";

import {
  CriteriaTab,
  DetailsTab,
  EntriesTab,
  NewRoutineForm,
} from "./-components";

import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { EditPageFooter, PageHeader, PageTabs } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import {
  deleteSingleRoutine,
  duplicateRoutine,
  fetchSingleRoutine,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

const TAB_VALUES = ["details", "entries", "criteria"] as const;
type EditTab = (typeof TAB_VALUES)[number];

export interface RoutineEditSearch {
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
    connectedType:
      search.connectedType === "task" || search.connectedType === "resource"
        ? search.connectedType
        : undefined,
    connectedId:
      typeof search.connectedId === "string" && search.connectedId
        ? search.connectedId
        : undefined,
    mode:
      search.mode === "weekly"
      || search.mode === "daily"
      || search.mode === "curated"
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

function SingleRoutineEdit() {
  const {
    id,
  } = Route.useParams();
  const navigate = useNavigate();
  const search = Route.useSearch();

  if (id === "new") {
    return (
      <NewRoutineForm
        search={search}
        onCreated={newId =>
          navigate({
            to: "/routines/$id/edit",
            params: {
              id: newId,
            },
          })}
        onCancel={() =>
          navigate({
            to: "/routines",
          })}
      />
    );
  }
  return <ExistingRoutineEdit id={id} />;
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
    invalidateRelated,
    shouldBlockFn,
    makeDeleteHandler,
    makeDuplicateHandler,
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
    navigateToList: () =>
      navigate({
        to: "/routines",
      }),
  });

  const handleDuplicate = makeDuplicateHandler({
    duplicateFn: duplicateRoutine,
    entityLabel: "routine",
    navigateToEntity: newId =>
      navigate({
        to: "/routines/$id/edit",
        params: {
          id: newId,
        },
      }),
  });

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
        <PageTabs
          value={tab}
          onValueChange={changeTab}
          tabs={[
            {
              value: "details",
              label: "Details",
              content: (
                <DetailsTab
                  routine={routine}
                  onSaved={handleSaved}
                  onChangeStateChange={setDetailsHasChanges}
                />
              ),
            },
            {
              value: "entries",
              label: "Day Entries",
              content: <EntriesTab id={id} />,
            },
            {
              value: "criteria",
              label: "Status Criteria",
              content: (
                <CriteriaTab
                  routine={routine}
                  onSaved={handleSaved}
                  onChangeStateChange={setCriteriaHasChanges}
                />
              ),
            },
          ]}
        />

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
      <UnsavedChangesDialog shouldBlockFn={shouldBlockFn(anyTabHasChanges)} />
    </div>
  );
}
