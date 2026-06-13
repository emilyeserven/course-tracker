import { useState } from "react";

import { useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import {
  Button,
  EditForm,
  EditPageFooter,
  PageHeader,
} from "@/components/editPage";
import { useAppForm } from "@/components/formFields";
import { createDomain } from "@/utils";

const newDomainSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000),
});

export function NewDomainForm() {
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
        <EditForm
          onSubmit={form.handleSubmit}
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
        </EditForm>
      </div>
    </div>
  );
}
