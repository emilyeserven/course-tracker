import type { Domain, TopicForTopicsPage } from "@emstack/types/src";

import { useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { Button } from "@/components/ui/button";
import { upsertDomain, formHasChanges } from "@/utils";

interface DetailsTabProps {
  domain: Domain;
  topics: TopicForTopicsPage[];
  onSaved: () => Promise<void>;
  onChangeStateChange?: (hasChanges: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000),
  topicIds: z.array(z.string()),
});

export function DetailsTab({
  domain,
  topics,
  onSaved,
  onChangeStateChange,
}: DetailsTabProps) {
  const topicOptions = useMemo(
    () =>
      (topics ?? []).map(t => ({
        value: t.id,
        label: t.name,
      })),
    [topics],
  );

  const startingValues = useMemo(
    () => ({
      title: domain.title,
      description: domain.description ?? "",
      topicIds: domain.topics?.map(t => t.id) ?? [],
    }),
    [domain],
  );

  const lastSavedRef = useRef(startingValues);
  const [isSaving, setIsSaving] = useState(false);

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      setIsSaving(true);
      try {
        await upsertDomain(domain.id, {
          title: value.title,
          description: value.description || null,
          topicIds: value.topicIds,
        });
        lastSavedRef.current = value;
        onChangeStateChange?.(false);
        await onSaved();
        toast.success("Details saved.");
      }
      catch {
        toast.error("Failed to save details.");
      }
      finally {
        setIsSaving(false);
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const hasChanges = formHasChanges(currentValues, lastSavedRef.current);

  useEffect(() => {
    onChangeStateChange?.(hasChanges);
  }, [hasChanges, onChangeStateChange]);

  return (
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

      <form.AppField name="topicIds">
        {field => (
          <field.MultiComboboxField
            label="Topics in domain"
            options={topicOptions}
            placeholder="Search topics..."
          />
        )}
      </form.AppField>

      <div>
        <Button
          type="submit"
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="animate-spin" />}
          Save Details
        </Button>
      </div>
    </form>
  );
}
