import { useCallback, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2, RadarIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { BlipsTabContainer } from "./domains.$id.edit.-components/-BlipsTab";
import { ConfigTab } from "./domains.$id.edit.-components/-ConfigTab";
import { DetailsTab } from "./domains.$id.edit.-components/-DetailsTab";
import { LlmTabContainer } from "./domains.$id.edit.-components/-LlmTab";
import { ScopeTab } from "./domains.$id.edit.-components/-ScopeTab";

import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Textarea } from "@/components/textarea";
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
  createDomain,
  deleteSingleDomain,
  duplicateDomain,
  fetchRadar,
  fetchSingleDomain,
  fetchTopics,
} from "@/utils";

const TAB_VALUES = ["details", "scope", "config", "blips", "llm"] as const;
type EditTab = (typeof TAB_VALUES)[number];

interface EditSearch {
  tab?: EditTab;
}

export const Route = createFileRoute("/domains/$id/edit")({
  component: SingleDomainEdit,
  validateSearch: (search: Record<string, unknown>): EditSearch => {
    const value = search.tab;
    if (typeof value === "string" && (TAB_VALUES as readonly string[]).includes(value)) {
      return {
        tab: value as EditTab,
      };
    }
    return {};
  },
});

const newDomainSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000),
});

function SingleDomainEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";

  if (isNew) {
    return <NewDomain />;
  }
  return <ExistingDomainEdit id={id} />;
}

function NewDomain() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const form = useAppForm({
    defaultValues: {
      title: "",
      description: "",
    },
    validators: {
      onSubmit: newDomainSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      setIsSaving(true);
      try {
        const result = await createDomain({
          title: value.title,
          description: value.description || null,
        });
        await navigate({
          to: "/domains/$id/edit",
          params: {
            id: result.id,
          },
        });
      }
      catch {
        toast.error("Failed to create domain. Please try again.");
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
        pageTitle="New Domain"
        pageSection="domains"
      />
      <div className="m-auto w-full max-w-[1200px] px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex max-w-2xl flex-col gap-8"
        >
          <form.AppField name="title">
            {field => <field.InputField label="Domain Title" />}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What is this domain about?"
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
              Create Domain
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate({
                  to: "/domains",
                })}
            >
              Cancel
            </Button>
          </EditPageFooter>
        </form>
      </div>
    </div>
  );
}

interface ExistingDomainEditProps {
  id: string;
}

function ExistingDomainEdit({
  id,
}: ExistingDomainEditProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = Route.useSearch();
  const tab: EditTab = search.tab ?? "details";

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
    relatedQueryKeys: [["domains"]],
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
    navigateToList: () => navigate({
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
        <Tabs
          value={tab}
          onValueChange={value => changeTab(value as EditTab)}
        >
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="scope">Scope</TabsTrigger>
            <TabsTrigger value="config">Radar Config</TabsTrigger>
            <TabsTrigger value="blips">Blips</TabsTrigger>
            <TabsTrigger value="llm">LLM Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <DetailsTab
              domain={domain}
              topics={topics ?? []}
              onSaved={handleSaved}
              onChangeStateChange={setDetailsHasChanges}
            />
          </TabsContent>

          <TabsContent value="scope">
            <ScopeTab
              domain={domain}
              topics={topics ?? []}
              onSaved={handleSaved}
              onChangeStateChange={setScopeHasChanges}
            />
          </TabsContent>

          <TabsContent value="config">
            <ConfigTab
              radar={radar}
              domainId={id}
              onSaved={handleSaved}
            />
          </TabsContent>

          <TabsContent value="blips">
            <BlipsTabContainer
              radar={radar}
              topics={topics ?? []}
              domainId={id}
              onSaved={handleSaved}
            />
          </TabsContent>

          <TabsContent value="llm">
            <LlmTabContainer
              radar={radar}
              domain={domain}
              topics={topics ?? []}
              onComplete={async () => {
                await handleSaved();
                changeTab("blips");
              }}
            />
          </TabsContent>
        </Tabs>

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
      <UnsavedChangesDialog
        shouldBlockFn={shouldBlockFn(anyTabHasChanges)}
      />
    </div>
  );
}
