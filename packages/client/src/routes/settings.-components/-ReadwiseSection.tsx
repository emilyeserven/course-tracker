import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { fetchSettings, updateSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

export function ReadwiseSection() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");

  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });

  const saveMutation = useMutation({
    mutationFn: (key: string | null) =>
      updateSettings({
        readwiseApiKey: key,
      }),
    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.readwise.readingList(),
      });
      setApiKey("");
      toast.success(key ? "Readwise API key saved" : "Readwise API key removed");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const configured = settingsQuery.data?.readwiseConfigured ?? false;
  const hint = settingsQuery.data?.readwiseKeyHint ?? null;

  function handleSave() {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    saveMutation.mutate(trimmed);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Readwise</h2>
      <p className="text-sm text-muted-foreground">
        Connect your Readwise Reader account to show your reading list on the
        dashboard. Paste a token from
        {" "}
        <a
          href="https://readwise.io/access_token"
          target="_blank"
          rel="noreferrer"
          className="
            text-primary underline-offset-2
            hover:underline
          "
        >
          readwise.io/access_token
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
            : "Paste your Readwise token"}
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
