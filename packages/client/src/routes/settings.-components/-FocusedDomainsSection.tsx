import type { AppSettingsSummary, Domain } from "@emstack/types";

import { MAX_FOCUSED_DOMAINS } from "@emstack/types";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { EditForm } from "@/components/layout/EditForm";
import { Button } from "@/components/ui/button";
import { fetchDomains, fetchSettings, updateSettings } from "@/utils";
import { queryKeys } from "@/utils/queryKeys";

const formSchema = z.object({
  focusedDomainIds: z
    .array(z.string())
    .max(MAX_FOCUSED_DOMAINS, `Pick at most ${MAX_FOCUSED_DOMAINS} domains.`),
});

export function FocusedDomainsSection() {
  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: () => fetchSettings(),
  });
  const domainsQuery = useQuery({
    queryKey: queryKeys.domains.list(),
    queryFn: () => fetchDomains(),
  });

  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Choose up to
        {" "}
        {MAX_FOCUSED_DOMAINS}
        {" "}
        domains to focus on. Focused domains sort to the top of the Domains page
        and each get their own tab in the dashboard&apos;s Explore Something
        card.
      </p>
      {settingsQuery.data && domainsQuery.data
        ? (
          <FocusedDomainsForm
            settings={settingsQuery.data}
            domains={domainsQuery.data}
          />
        )
        : (
          <p className="text-sm text-muted-foreground">Loading domains...</p>
        )}
    </section>
  );
}

function FocusedDomainsForm({
  settings,
  domains,
}: {
  settings: AppSettingsSummary;
  domains: Domain[];
}) {
  const queryClient = useQueryClient();

  const domainOptions = domains
    .filter((d): d is Domain & { id: string } => Boolean(d.id))
    .map(d => ({
      value: d.id,
      label: d.title,
    }));

  // Drop stale ids (domains deleted since the selection was saved) so chips
  // only show currently-existing domains.
  const existingIds = new Set(domainOptions.map(o => o.value));
  const initialFocused = settings.focusedDomainIds.filter(id =>
    existingIds.has(id));

  const saveMutation = useMutation({
    mutationFn: (focusedDomainIds: string[]) =>
      updateSettings({
        focusedDomainIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.settings.detail(),
      });
      toast.success("Focused domains saved");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const form = useAppForm({
    defaultValues: {
      focusedDomainIds: initialFocused,
    },
    validators: {
      onChange: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      await saveMutation.mutateAsync(value.focusedDomainIds);
    },
  });

  const canSubmit = useStore(form.store, state => state.canSubmit);

  return (
    <EditForm
      onSubmit={form.handleSubmit}
      className="flex max-w-xl flex-col gap-4"
    >
      <form.AppField name="focusedDomainIds">
        {field => (
          <field.MultiComboboxField
            label="Focused domains"
            options={domainOptions}
            placeholder="Search domains..."
          />
        )}
      </form.AppField>
      <div>
        <Button
          type="submit"
          disabled={!canSubmit || saveMutation.isPending}
        >
          {saveMutation.isPending && <Loader2 className="animate-spin" />}
          Save Focused Domains
        </Button>
      </div>
    </EditForm>
  );
}
