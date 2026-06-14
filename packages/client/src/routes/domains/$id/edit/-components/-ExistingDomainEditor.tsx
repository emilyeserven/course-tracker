import type { EditTab } from "../route";

import { useCallback, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, RadarIcon } from "lucide-react";
import { toast } from "sonner";

import {
  BlipsTabContainer,
  ConfigTab,
  DetailsTab,
  LlmTabContainer,
  ScopeTab,
} from "./-tabs";

import {
  Button,
  EditPageFooter,
  PageHeader,
  PageTabs,
  UnsavedChangesDialog,
} from "@/components/editPage";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import {
  deleteSingleDomain,
  duplicateDomain,
  fetchRadar,
  fetchSingleDomain,
  fetchTopics,
  queryKeys,
} from "@/utils";

interface ExistingDomainEditorProps {
  id: string;
  tab: EditTab;
}

export function ExistingDomainEditor({
  id, tab,
}: ExistingDomainEditorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: domain,
    skipBlock,
    invalidateRelated,
    shouldBlockFn,
    makeDeleteHandler,
  } = useEditFormPage({
    id,
    isNew: false,
    queryKey: ["domain", id],
    queryFn: () => fetchSingleDomain(id),
    relatedQueryKeys: [queryKeys.domains.list()],
  });

  const {
    data: radar,
  } = useQuery({
    queryKey: ["radar", id],
    queryFn: () => fetchRadar(id),
  });

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const [detailsHasChanges, setDetailsHasChanges] = useState(false);
  const [scopeHasChanges, setScopeHasChanges] = useState(false);
  const anyTabHasChanges = detailsHasChanges || scopeHasChanges;

  const handleSaved = useCallback(async () => {
    await invalidateRelated();
    await queryClient.invalidateQueries({
      queryKey: ["radar", id],
    });
    await queryClient.invalidateQueries({
      queryKey: ["topics"],
    });
  }, [invalidateRelated, queryClient, id]);

  const handleDelete = makeDeleteHandler({
    deleteFn: deleteSingleDomain,
    entityLabel: "domain",
    navigateToList: () =>
      navigate({
        to: "/domains",
      }),
  });

  async function handleDuplicate() {
    try {
      const result = await duplicateDomain(id);
      await invalidateRelated();
      skipBlock();
      await navigate({
        to: "/domains/$id/edit",
        params: {
          id: result.id,
        },
      });
    }
    catch {
      toast.error("Failed to duplicate domain. Please try again.");
    }
  }

  function changeTab(next: EditTab) {
    navigate({
      to: "/domains/$id/edit",
      params: {
        id,
      },
      search: {
        tab: next,
      },
      replace: true,
    });
  }

  if (!domain) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-3xl">Loading domain...</h1>
      </div>
    );
  }

  const radarConfigured
    = (domain.radarConfig?.quadrants?.length ?? 0) > 0
      && (domain.radarConfig?.rings?.length ?? 0) > 0;

  return (
    <div>
      <PageHeader
        pageTitle="Edit Domain"
        pageSection="domains"
      >
        <div className="flex flex-row gap-2">
          {radarConfigured && (
            <Link
              to="/domains/$id/radar"
              params={{
                id,
              }}
            >
              <Button variant="outline">
                View Radar
                {" "}
                <RadarIcon />
              </Button>
            </Link>
          )}
          <Link
            to="/domains/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Domain
              {" "}
              <EyeIcon />
            </Button>
          </Link>
        </div>
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
                  domain={domain}
                  topics={topics ?? []}
                  onSaved={handleSaved}
                  onChangeStateChange={setDetailsHasChanges}
                />
              ),
            },
            {
              value: "scope",
              label: "Scope",
              content: (
                <ScopeTab
                  domain={domain}
                  radar={radar}
                  topics={topics ?? []}
                  onSaved={handleSaved}
                  onChangeStateChange={setScopeHasChanges}
                />
              ),
            },
            {
              value: "config",
              label: "Radar Config",
              content: (
                <ConfigTab
                  radar={radar}
                  domainId={id}
                  onSaved={handleSaved}
                />
              ),
            },
            {
              value: "blips",
              label: "Blips",
              content: (
                <BlipsTabContainer
                  radar={radar}
                  topics={topics ?? []}
                  domainId={id}
                  onSaved={handleSaved}
                />
              ),
            },
            {
              value: "llm",
              label: "LLM Edit",
              content: (
                <LlmTabContainer
                  radar={radar}
                  domain={domain}
                  topics={topics ?? []}
                  onComplete={async () => {
                    await handleSaved();
                    changeTab("blips");
                  }}
                />
              ),
            },
          ]}
        />

        <EditPageFooter
          isNew={false}
          onDelete={handleDelete}
          deleteLabel="Delete Domain"
          onDuplicate={handleDuplicate}
          duplicateLabel="Duplicate Domain"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({
                to: "/domains/$id",
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
