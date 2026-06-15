import type { Resource } from "@emstack/types";

import { useMemo } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { useSetModulesExhaustive } from "./useSetModulesExhaustive";

import { useAppForm } from "@/components/formFields";
import {
  buildResourcePayload,
  formSchema,
} from "@/routes/resources/$id/edit/-components/-buildResourcePayload";
import {
  createProvider,
  createTag,
  createTopic,
  fetchProviders,
  fetchTagGroups,
  fetchTopics,
  formHasChanges,
  tagGroupsToOptions,
  toOptions,
  upsertResource,
  uuidv4,
} from "@/utils";

interface UseResourceEditFormOptions {
  id: string;
  isNew: boolean;
  data: Resource | undefined;
  /** `?topicId=` prefill, only honored for new resources. */
  topicIdSearch?: string;
  skipBlock: () => void;
  invalidateRelated: () => Promise<void>;
}

/**
 * Bundles the resource edit form's data layer: the topics/providers/tag-group
 * queries and their derived combobox options, the change-tracked save form
 * (payload assembly delegated to `buildResourcePayload`), and the provider-cost
 * mirroring. Lives in the route component (so the form instance — and any
 * unsaved edits — persists across tab switches) while keeping the Details tab
 * component presentational.
 */
export function useResourceEditForm({
  id,
  isNew,
  data,
  topicIdSearch,
  skipBlock,
  invalidateRelated,
}: UseResourceEditFormOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: topics,
  } = useQuery({
    queryKey: ["topics"],
    queryFn: () => fetchTopics(),
  });

  const {
    data: providers,
  } = useQuery({
    queryKey: ["providers"],
    queryFn: () => fetchProviders(),
  });

  const {
    data: tagGroups,
  } = useQuery({
    queryKey: ["tagGroups"],
    queryFn: () => fetchTagGroups(),
  });

  const topicOptions = useMemo(() => toOptions(topics), [topics]);
  const providerOptions = useMemo(() => toOptions(providers), [providers]);
  const tagOptions = useMemo(() => tagGroupsToOptions(tagGroups), [tagGroups]);
  // Tag groups themselves (not the tags within them) — used as the "Tag Group"
  // choices when creating a new tag inline from the combobox.
  const tagGroupOptions = useMemo(() => toOptions(tagGroups), [tagGroups]);

  // An exhaustive field-by-field mapping of the resource onto the form's
  // default values. Its high cyclomatic score is an artifact of per-field
  // `?? default` coalescing, not branching logic; splitting it fights TanStack
  // Form's value-type inference (the form keys off this object's shape), so it
  // reads clearer kept whole.
  const startingValues = useMemo(
    // fallow-ignore-next-line complexity
    () => ({
      name: data?.name ?? "",
      type: data?.type ?? ("website" as const),
      description: data?.description ?? "",
      url: data?.url ?? "",
      status: data?.status ?? ("active" as const),
      progressCurrent: data?.progressCurrent ?? null,
      progressTotal: data?.progressTotal ?? null,
      tracksProgress: data?.tracksProgress ?? true,
      cost: data?.cost?.cost != null ? Number(data.cost.cost) : null,
      dateExpires: data?.dateExpires ? new Date(data.dateExpires) : null,
      topicId:
        (Array.isArray(data?.topics) && data.topics[0]?.id)
        || (isNew ? (topicIdSearch ?? "") : "")
        || "",
      courseProviderId: data?.provider?.id ?? "",
      providerIsSelf: data?.providerIsSelf ?? false,
      easeOfStarting: data?.easeOfStarting ?? "",
      timeNeeded: data?.timeNeeded ?? "",
      interactivity: data?.interactivity ?? "",
      tagIds: (data?.tags ?? []).map(t => t.id),
    }),
    [data, isNew, topicIdSearch],
  );

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      // `isCostFromPlatform` is the value computed below from the current
      // provider selection; at submit time `value` mirrors `currentValues`.
      const payload = buildResourcePayload(value, {
        isCostFromPlatform,
      });

      try {
        const courseId = isNew ? uuidv4() : id;
        const previousStatus = data?.status;
        await upsertResource(courseId, payload);
        await invalidateRelated();
        skipBlock();
        toast.success(isNew ? "Resource created." : "Resource saved.");

        const becameActive
          = value.status === "active" && (isNew || previousStatus !== "active");
        await navigate({
          to: "/resources/$id",
          params: {
            id: courseId,
          },
          search: becameActive
            ? {
              promptDaily: 1,
            }
            : {},
        });
      }
      catch (err) {
        console.error("Failed to save resource:", err);
        toast.error(
          isNew
            ? "Failed to create resource. Please try again."
            : "Failed to save resource. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  // A self-provider mirrors the resource's url, which a provider requires, so
  // the option is only offered once the resource has a url.
  const providerUrlMissing = !currentValues.url.trim();
  const selectedProvider = (providers ?? []).find(
    p => p.id === currentValues.courseProviderId,
  );
  const isCostFromPlatform = !!selectedProvider?.isCourseFeesShared;

  if (isCostFromPlatform && selectedProvider?.cost != null) {
    const providerCost = Number(selectedProvider.cost);
    if (currentValues.cost !== providerCost) {
      form.setFieldValue("cost", providerCost);
    }
  }

  const createTopicOption = async (
    values: Record<string, unknown>,
  ): Promise<string> => {
    const result = await createTopic(values);
    await queryClient.invalidateQueries({
      queryKey: ["topics"],
    });
    return result.id;
  };

  const createProviderOption = async (
    values: Record<string, unknown>,
  ): Promise<string> => {
    const result = await createProvider(values);
    await queryClient.invalidateQueries({
      queryKey: ["providers"],
    });
    return result.id;
  };

  const createTagOption = async (
    values: Record<string, unknown>,
  ): Promise<string> => {
    const result = await createTag({
      name: values.name,
      groupId: values.groupId,
      color: null,
    });
    await queryClient.invalidateQueries({
      queryKey: ["tagGroups"],
    });
    return result.id;
  };

  // Progress-mode chooser across three modes: manual numbers, module-derived,
  // or "none" (the resource opts out of tracking and shows an infinity icon).
  // The modules dimension reuses the same optimistic mutation the Modules tab
  // uses, so toggling here (Details tab) and the Modules-tab callout stay in
  // sync; it's a no-op for new resources (no id/modules yet). The "tracks
  // progress" dimension is a regular form field, so it persists on save and
  // works for new resources too.
  const modulesAreExhaustive = data?.modulesAreExhaustive ?? false;
  const setModulesExhaustiveMutation = useSetModulesExhaustive(id);
  const setProgressMode = (mode: "manual" | "modules" | "none") => {
    form.setFieldValue("tracksProgress", mode !== "none");
    if (isNew) return;
    // "none" leaves the modules flag untouched — the display ignores it while
    // tracking is off, and it's restored if the user re-enables tracking.
    if (mode !== "none") {
      setModulesExhaustiveMutation.mutate(mode === "modules");
    }
  };

  return {
    form,
    topicOptions,
    providerOptions,
    tagOptions,
    tagGroupOptions,
    currentValues,
    isSubmitting,
    hasChanges,
    isCostFromPlatform,
    providerUrlMissing,
    modulesAreExhaustive,
    createTopicOption,
    createProviderOption,
    createTagOption,
    setProgressMode,
  };
}
