import { useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2, PlusIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { Textarea } from "@/components/forms/textarea";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import {
  createDomain,
  deleteSingleDomain,
  duplicateDomain,
  fetchSingleDomain,
  fetchTopics,
  formHasChanges,
  upsertDomain,
} from "@/utils";

export const Route = createFileRoute("/domains/$id/edit")({
  component: SingleDomainEdit,
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000),
  hasRadar: z.string(),
  topicIds: z.array(z.string()),
});

interface ExcludedTopicRow {
  topicId: string;
  reason: string;
  localKey: string;
}

let exclusionKeyCounter = 0;
function nextExclusionKey() {
  exclusionKeyCounter += 1;
  return `exclusion-${exclusionKeyCounter}`;
}

function SingleDomainEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const {
    data,
    skipBlock,
    invalidateRelated,
    shouldBlockFn,
    makeDeleteHandler,
  } = useEditFormPage({
    id,
    isNew,
    queryKey: ["domain", id],
    queryFn: () => fetchSingleDomain(id),
    relatedQueryKeys: [["domains"]],
  });

  const {
    data: topicsData,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const topicOptions = useMemo(
    () =>
      (topicsData ?? []).map(t => ({
        value: t.id,
        label: t.name,
      })),
    [topicsData],
  );

  const startingValues = useMemo(
    () => ({
      title: data?.title ?? "",
      description: data?.description ?? "",
      hasRadar: data?.hasRadar ? "true" : "false",
      topicIds: data?.topics?.map(t => t.id) ?? [],
    }),
    [data],
  );

  const startingExcluded = useMemo<ExcludedTopicRow[]>(
    () =>
      (data?.excludedTopics ?? []).map(et => ({
        topicId: et.id,
        reason: et.reason ?? "",
        localKey: nextExclusionKey(),
      })),
    [data],
  );

  const [excludedRows, setExcludedRows] = useState<ExcludedTopicRow[]>([]);
  const excludedHydrated = useRef(false);

  useEffect(() => {
    if (excludedHydrated.current) {
      return;
    }
    if (isNew || data) {
      setExcludedRows(startingExcluded);
      excludedHydrated.current = true;
    }
  }, [data, isNew, startingExcluded]);

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const cleanedExcluded = excludedRows
        .filter(r => r.topicId)
        .map(r => ({
          topicId: r.topicId,
          reason: r.reason.trim() || null,
        }));

      const seen = new Set<string>();
      const dedupedExcluded = cleanedExcluded.filter((r) => {
        if (seen.has(r.topicId)) {
          return false;
        }
        seen.add(r.topicId);
        return true;
      });

      const domainData = {
        title: value.title,
        description: value.description || null,
        hasRadar: value.hasRadar === "true",
        topicIds: value.topicIds,
        excludedTopics: dedupedExcluded,
      };

      try {
        let domainId: string;
        if (isNew) {
          const result = await createDomain(domainData);
          domainId = result.id;
        }
        else {
          await upsertDomain(id, domainData);
          domainId = id;
        }
        await invalidateRelated();
        skipBlock();
        await navigate({
          to: "/domains/$id",
          params: {
            id: domainId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create domain. Please try again."
            : "Failed to save domain. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const formHasFieldChanges = formHasChanges(currentValues, startingValues);
  const exclusionsHaveChanges = useMemo(() => {
    if (excludedRows.length !== startingExcluded.length) {
      return true;
    }
    const startingMap = new Map(
      startingExcluded.map(r => [r.topicId, r.reason]),
    );
    return excludedRows.some(r =>
      !startingMap.has(r.topicId) || startingMap.get(r.topicId) !== r.reason);
  }, [excludedRows, startingExcluded]);
  const hasChanges = formHasFieldChanges || exclusionsHaveChanges;

  function addExclusion() {
    setExcludedRows(prev => [
      ...prev,
      {
        topicId: "",
        reason: "",
        localKey: nextExclusionKey(),
      },
    ]);
  }

  function removeExclusion(localKey: string) {
    setExcludedRows(prev => prev.filter(r => r.localKey !== localKey));
  }

  function updateExclusion(localKey: string, patch: Partial<ExcludedTopicRow>) {
    setExcludedRows(prev =>
      prev.map(r =>
        r.localKey === localKey
          ? {
            ...r,
            ...patch,
          }
          : r));
  }

  const usedExclusionTopicIds = useMemo(
    () => new Set(excludedRows.map(r => r.topicId).filter(Boolean)),
    [excludedRows],
  );

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
        to: "/domains/$id",
        params: {
          id: result.id,
        },
      });
    }
    catch {
      toast.error("Failed to duplicate domain. Please try again.");
    }
  }

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Domain" : "Edit Domain"}
        pageSection="domains"
      >
        {!isNew && (
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
        )}
      </PageHeader>
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

          <form.AppField name="hasRadar">
            {field => (
              <field.RadioGroupField
                label="Has Radar?"
                options={[
                  {
                    value: "true",
                    label: "Yes",
                  },
                  {
                    value: "false",
                    label: "No",
                  },
                ]}
                labelClassName=""
              />
            )}
          </form.AppField>

          <form.AppField name="topicIds">
            {field => (
              <field.MultiComboboxField
                label="Topics"
                options={topicOptions}
                placeholder="Search topics..."
              />
            )}
          </form.AppField>

          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl">Topics excluded from Radar</h3>
              <p className="text-sm text-muted-foreground">
                Topics listed here will not be considered by the Radar LLM
                assistant. Each one can include a reason explaining why.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {excludedRows.map(row => (
                <li
                  key={row.localKey}
                  className="flex flex-col gap-2 rounded-sm border p-3"
                >
                  <div
                    className={`
                      grid grid-cols-1 gap-2
                      sm:grid-cols-[minmax(0,1fr)_auto]
                    `}
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground uppercase">
                        Topic
                      </label>
                      <Select
                        value={row.topicId}
                        onValueChange={value =>
                          updateExclusion(row.localKey, {
                            topicId: value,
                          })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {(topicsData ?? [])
                            .filter(
                              t =>
                                t.id === row.topicId
                                || !usedExclusionTopicIds.has(t.id),
                            )
                            .map(t => (
                              <SelectItem
                                key={t.id}
                                value={t.id}
                              >
                                {t.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-row items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExclusion(row.localKey)}
                        aria-label="Remove excluded topic"
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground uppercase">
                      Reason (optional)
                    </label>
                    <Textarea
                      value={row.reason}
                      onChange={e =>
                        updateExclusion(row.localKey, {
                          reason: e.target.value,
                        })}
                      placeholder="Why should the radar ignore this topic?"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={addExclusion}
              >
                <PlusIcon />
                {" "}
                Add Excluded Topic
              </Button>
            </div>
          </section>

          <EditPageFooter
            isNew={isNew}
            onDelete={handleDelete}
            deleteLabel="Delete Domain"
            onDuplicate={handleDuplicate}
            duplicateLabel="Duplicate Domain"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Domain" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/domains",
                  });
                }
                else {
                  navigate({
                    to: "/domains/$id",
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
          shouldBlockFn={shouldBlockFn(hasChanges)}
        />
      </div>
    </div>
  );
}
