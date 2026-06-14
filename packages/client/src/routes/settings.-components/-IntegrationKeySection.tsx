import type { AppSettingsSummary, AppSettingsUpdate } from "@emstack/types";
import type { ReactNode } from "react";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchSettings, updateSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

interface IntegrationKeySectionProps {
  /** Display name (e.g. "Readwise"); drives the heading, button labels, toasts. */
  title: string;
  /** Prose + token link explaining where to find the API key. */
  description: ReactNode;
  /** Placeholder shown in the empty key input. */
  placeholder: string;
  /** Builds the settings patch that stores (or clears) this integration's key. */
  buildUpdate: (key: string | null) => AppSettingsUpdate;
  /** Reads the configured flag + masked hint out of the settings response. */
  selectStatus: (data: AppSettingsSummary | undefined) => {
    configured: boolean;
    hint: string | null;
  };
  /** The integration's dashboard data key, invalidated so it refetches on save. */
  dataQueryKey: readonly unknown[];
}

/**
 * Shared "paste an API key" settings section for the dashboard integrations
 * that authenticate with a single token (Readwise, Todoist). The query,
 * save/remove mutation, and markup are identical across integrations; callers
 * supply only the per-integration copy and the settings field/query key.
 */
export function IntegrationKeySection({
  title,
  description,
  placeholder,
  buildUpdate,
  selectStatus,
  dataQueryKey,
}: IntegrationKeySectionProps) {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });

  const saveMutation = useMutation({
    mutationFn: (key: string | null) => updateSettings(buildUpdate(key)),
    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: dataQueryKey,
      });
      setApiKey("");
      toast.success(key ? `${title} API key saved` : `${title} API key removed`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const {
    configured, hint,
  } = selectStatus(settingsQuery.data);

  function handleSave() {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    saveMutation.mutate(trimmed);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      {configured && (
        <p className="text-sm text-muted-foreground">
          A key is currently saved
          {hint ? ` (ending ${hint})` : ""}
          .
        </p>
      )}
      <div
        className="
          flex flex-col gap-2
          sm:flex-row sm:items-center
        "
      >
        <Input
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder={configured
            ? "Enter a new key to replace the saved one"
            : placeholder}
          className="sm:max-w-md"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim() || saveMutation.isPending}
          >
            {configured ? "Update key" : "Save key"}
          </Button>
          {configured && (
            <Button
              variant="outline"
              onClick={() => saveMutation.mutate(null)}
              disabled={saveMutation.isPending}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
