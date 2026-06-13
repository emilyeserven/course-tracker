import type { AppSettingsSummary, Domain } from "@emstack/types";

import { MAX_FOCUSED_DOMAINS } from "@emstack/types";
import { useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import * as z from "zod";

import { useFocusedDomains } from "./-useFocusedDomains";

import { useAppForm } from "@/components/formFields";
import { EditForm } from "@/components/layout";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  focusedDomainIds: z
    .array(z.string())
    .max(MAX_FOCUSED_DOMAINS, `Pick at most ${MAX_FOCUSED_DOMAINS} domains.`),
});

type SaveMutation = ReturnType<typeof useFocusedDomains>["saveMutation"];

export function FocusedDomainsSection() {
  const {
    settingsQuery,
    domainsQuery,
    saveMutation,
  } = useFocusedDomains();

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
            saveMutation={saveMutation}
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
  saveMutation,
}: {
  settings: AppSettingsSummary;
  domains: Domain[];
  saveMutation: SaveMutation;
}) {
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
