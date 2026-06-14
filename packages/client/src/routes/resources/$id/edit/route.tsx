import { createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  ResourceInteractionsLog,
  ResourceModulesAdmin,
} from "../-components";
import { DetailsTab } from "./-components";

import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { PageTabs } from "@/components/layout";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import { useResourceEditForm } from "@/hooks/useResourceEditForm";
import {
  deleteSingleResource,
  duplicateResource,
  fetchSingleResource,
} from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

const TAB_VALUES = ["details", "modules", "interactions"] as const;
type ResourceTab = (typeof TAB_VALUES)[number];

export interface ResourceEditSearch {
  topicId?: string;
  tab?: ResourceTab;
}

export const Route = createFileRoute("/resources/$id/edit")({
  component: SingleResourceEdit,
  validateSearch: (search: Record<string, unknown>): ResourceEditSearch => ({
    topicId:
      typeof search.topicId === "string" && search.topicId
        ? search.topicId
        : undefined,
    tab:
      typeof search.tab === "string"
      && (TAB_VALUES as readonly string[]).includes(search.tab)
        ? (search.tab as ResourceTab)
        : undefined,
  }),
});

function SingleResourceEdit() {
  const {
    id,
  } = Route.useParams();
  const search = Route.useSearch();
  const isNew = id === "new";
  const navigate = useNavigate();

  const tab: ResourceTab = search.tab ?? "details";

  const {
    data,
    skipBlock,
    invalidateRelated,
    shouldBlockFn,
    makeDeleteHandler,
    makeDuplicateHandler,
  } = useEditFormPage({
    id,
    isNew,
    queryKey: queryKeys.resources.detail(id),
    queryFn: () => fetchSingleResource(id),
    relatedQueryKeys: [queryKeys.resources.list(), queryKeys.topics.list()],
  });

  // The form lives here (not in DetailsTab) so its state survives tab switches,
  // which unmount the inactive tab panels.
  const controller = useResourceEditForm({
    id,
    isNew,
    data,
    topicIdSearch: search.topicId,
    skipBlock,
    invalidateRelated,
  });

  const handleDelete = makeDeleteHandler({
    deleteFn: deleteSingleResource,
    entityLabel: "resource",
    navigateToList: () =>
      navigate({
        to: "/resources",
      }),
  });

  const handleDuplicate = makeDuplicateHandler({
    duplicateFn: duplicateResource,
    entityLabel: "resource",
    navigateToEntity: newId =>
      navigate({
        to: "/resources/$id",
        params: {
          id: newId,
        },
      }),
  });

  function changeTab(next: ResourceTab) {
    navigate({
      to: "/resources/$id/edit",
      params: {
        id,
      },
      search: prev => ({
        ...prev,
        tab: next,
      }),
      replace: true,
    });
  }

  function handleCancel() {
    if (isNew) {
      navigate({
        to: "/resources",
      });
    }
    else {
      navigate({
        to: "/resources/$id",
        params: {
          id,
        },
      });
    }
  }

  const detailsTab = (
    <DetailsTab
      isNew={isNew}
      controller={controller}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onCancel={handleCancel}
      onGoToModules={() => changeTab("modules")}
    />
  );

  return (
    <div className="m-auto w-full max-w-[1200px] px-4">
      <h2 className="mb-6 text-2xl">
        {isNew ? "New Resource" : "Edit Resource"}
      </h2>
      {isNew
        ? (
          detailsTab
        )
        : (
          <PageTabs
            value={tab}
            onValueChange={changeTab}
            tabs={[
              {
                value: "details",
                label: "Details",
                content: detailsTab,
              },
              {
                value: "modules",
                label: "Modules",
                content: (
                  <ResourceModulesAdmin
                    resourceId={id}
                    canEditExhaustive
                  />
                ),
              },
              {
                value: "interactions",
                label: "Interactions",
                content: <ResourceInteractionsLog resourceId={id} />,
              },
            ]}
          />
        )}
      <UnsavedChangesDialog
        shouldBlockFn={shouldBlockFn(controller.hasChanges)}
      />
    </div>
  );
}
