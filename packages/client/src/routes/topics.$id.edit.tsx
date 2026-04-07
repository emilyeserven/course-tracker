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
  createTopic,
  fetchSingleTopic,
  formHasChanges,
  upsertTopic,
} from "@/utils";

export const Route = createFileRoute("/topics/$id/edit")({
  component: SingleTopicEdit,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500),
  reason: z.string().max(500),
});

function SingleTopicEdit() {
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
    queryKey: ["topic", id],
    queryFn: () => fetchSingleTopic(id),
    enabled: !isNew,
  });

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      reason: data?.reason ?? "",
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
      const topicData = {
        name: value.name,
        description: value.description || null,
        reason: value.reason || null,
      };

      try {
        let topicId: string;
        if (isNew) {
          const result = await createTopic(topicData);
          topicId = result.id;
        }
        else {
          await upsertTopic(id, topicData);
          topicId = id;
          await queryClient.invalidateQueries({
            queryKey: ["topic", id],
          });
        }

        await queryClient.invalidateQueries({
          queryKey: ["topics"],
        });
        skipBlocker.current = true;
        await navigate({
          to: "/topics/$id",
          params: {
            id: topicId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create topic. Please try again."
            : "Failed to save topic. Please try again.",
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
        pageTitle={isNew ? "New Topic" : "Edit Topic"}
        pageSection="topics"
      >
        {!isNew && (
          <Link
            to="/topics/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Topic
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
          <form.AppField name="name">
            {field => <field.InputField label="Topic Name" />}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What is this topic about?"
              />
            )}
          </form.AppField>

          <form.AppField name="reason">
            {field => (
              <field.TextareaField
                label="Reason"
                placeholder="Why are you learning this?"
              />
            )}
          </form.AppField>

          <div className="flex flex-row gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Topic" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/topics",
                  });
                }
                else {
                  navigate({
                    to: "/topics/$id",
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
