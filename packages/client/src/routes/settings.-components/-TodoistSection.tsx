import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { fetchSettings, updateSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function TodoistSection() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });

  const saveMutation = useMutation({
    mutationFn: (key: string | null) =>
      updateSettings({
        todoistApiKey: key,
      }),
    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.todoist.tasks(),
      });
      setApiKey("");
      toast.success(key ? "Todoist API key saved" : "Todoist API key removed");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const configured = settingsQuery.data?.todoistConfigured ?? false;
  const hint = settingsQuery.data?.todoistKeyHint ?? null;

  function handleSave() {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    saveMutation.mutate(trimmed);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Todoist</h2>
      <p className="text-sm text-muted-foreground">
        Connect your Todoist account to show tasks due today and overdue on the
        dashboard. Copy your API token from
        {" "}
        <a
          href="https://app.todoist.com/app/settings/integrations/developer"
          target="_blank"
          rel="noreferrer"
          className="
            text-primary underline-offset-2
            hover:underline
          "
        >
          Settings → Integrations → Developer
        </a>
        .
      </p>
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
            : "Paste your Todoist API token"}
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
