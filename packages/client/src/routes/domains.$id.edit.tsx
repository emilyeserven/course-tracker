import { useMemo, useRef } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import {
  createDomain,
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
  description: z.string().max(500),
  hasRadar: z.string(),
  topicIds: z.array(z.string()),
});

function SingleDomainEdit() {
  const {
    id,
  } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const skipBlocker = useRef(false);

  const {
    data,
  } = useQuery({
    queryKey: ["domain", id],
    queryFn: () => fetchSingleDomain(id),
    enabled: !isNew,
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

  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const domainData = {
        title: value.title,
        description: value.description || null,
        hasRadar: value.hasRadar === "true",
        topicIds: value.topicIds,
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
          await queryClient.invalidateQueries({
            queryKey: ["domain", id],
          });
        }

        await queryClient.invalidateQueries({
          queryKey: ["domains"],
        });
        skipBlocker.current = true;
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
  const hasChanges = formHasChanges(currentValues, startingValues);

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
      <div className="container flex-col">
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

          <div className="flex flex-row gap-4">
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
          </div>
        </form>
        <UnsavedChangesDialog
          shouldBlockFn={() => hasChanges && !skipBlocker.current}
        />
      </div>
    </div>
  );
}
