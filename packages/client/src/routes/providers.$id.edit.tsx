import { useMemo, useRef } from "react";

import { useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { EditPageFooter } from "@/components/layout/EditPageFooter";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { UnsavedChangesDialog } from "@/components/UnsavedChangesDialog";
import {
  createProvider,
  deleteSinglePlatform,
  fetchSingleProvider,
  formHasChanges,
  upsertProvider,
} from "@/utils";

export const Route = createFileRoute("/providers/$id/edit")({
  component: SingleProviderEdit,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500),
  url: z.string().min(1, "URL is required").max(255),
  cost: z.number().min(0).nullable(),
  isRecurring: z.string(),
  recurDate: z.date().nullable(),
  recurPeriodUnit: z.enum(["days", "months", "years"]),
  recurPeriod: z.number().int().min(1).nullable(),
  isCourseFeesShared: z.string(),
});

function SingleProviderEdit() {
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
    queryKey: ["provider", id],
    queryFn: () => fetchSingleProvider(id),
    enabled: !isNew,
  });

  const startingValues = useMemo(
    () => ({
      name: data?.name ?? "",
      description: data?.description ?? "",
      url: data?.url ?? "",
      cost: data?.cost != null ? Number(data.cost) : null,
      isRecurring: data?.isRecurring ? "true" : "false",
      recurDate: data?.recurDate ? new Date(data.recurDate) : null,
      recurPeriodUnit: data?.recurPeriodUnit ?? "years",
      recurPeriod: data?.recurPeriod ?? null,
      isCourseFeesShared: data?.isCourseFeesShared ? "true" : "false",
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
      const providerData = {
        name: value.name,
        description: value.description || null,
        url: value.url,
        cost: value.cost != null ? String(value.cost) : null,
        isRecurring: value.isRecurring === "true",
        recurDate: value.recurDate
          ? value.recurDate.toISOString().split("T")[0]
          : null,
        recurPeriodUnit:
          value.isRecurring === "true" ? value.recurPeriodUnit : null,
        recurPeriod: value.isRecurring === "true" ? value.recurPeriod : null,
        isCourseFeesShared: value.isCourseFeesShared === "true",
      };

      try {
        let providerId: string;
        if (isNew) {
          const result = await createProvider(providerData);
          providerId = result.id;
        }
        else {
          await upsertProvider(id, providerData);
          providerId = id;
          await queryClient.invalidateQueries({
            queryKey: ["provider", id],
          });
        }

        await queryClient.invalidateQueries({
          queryKey: ["providers"],
        });
        skipBlocker.current = true;
        await navigate({
          to: "/providers/$id",
          params: {
            id: providerId,
          },
        });
      }
      catch {
        toast.error(
          isNew
            ? "Failed to create provider. Please try again."
            : "Failed to save provider. Please try again.",
        );
      }
    },
  });

  const currentValues = useStore(form.store, state => ({
    ...state.values,
  }));
  const isSubmitting = useStore(form.store, state => state.isSubmitting);
  const hasChanges = formHasChanges(currentValues, startingValues);

  const isRecurring = useStore(
    form.store,
    state => state.values.isRecurring === "true",
  );

  async function handleDelete() {
    try {
      await deleteSinglePlatform(id);
      await queryClient.invalidateQueries({
        queryKey: ["providers"],
      });
      skipBlocker.current = true;
      await navigate({
        to: "/providers",
      });
    }
    catch {
      toast.error("Failed to delete provider. Please try again.");
    }
  }

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Provider" : "Edit Provider"}
        pageSection="providers"
      >
        {!isNew && (
          <Link
            to="/providers/$id"
            params={{
              id,
            }}
          >
            <Button variant="secondary">
              View Provider
              {" "}
              <EyeIcon />
            </Button>
          </Link>
        )}
      </PageHeader>
      <div className="m-auto w-full max-w-[1200px] px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex max-w-2xl flex-col gap-8"
        >
          <form.AppField name="name">
            {field => <field.InputField label="Provider Name" />}
          </form.AppField>

          <form.AppField name="description">
            {field => (
              <field.TextareaField
                label="Description"
                placeholder="What does this provider offer?"
              />
            )}
          </form.AppField>

          <form.AppField name="url">
            {field => <field.InputField label="URL" />}
          </form.AppField>

          <form.AppField name="cost">
            {field => (
              <field.NumberField
                label="Cost ($)"
                min={0}
                step="0.01"
              />
            )}
          </form.AppField>

          <form.AppField name="isCourseFeesShared">
            {field => (
              <field.RadioGroupField
                label="Course Fees Shared?"
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

          <form.AppField name="isRecurring">
            {field => (
              <field.RadioGroupField
                label="Recurring Subscription?"
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

          {isRecurring && (
            <>
              <form.AppField name="recurDate">
                {field => <field.DatePickerField label="Renewal Date" />}
              </form.AppField>

              <form.AppField name="recurPeriodUnit">
                {field => (
                  <field.RadioGroupField
                    label="Recurrence Period"
                    options={[
                      {
                        value: "days",
                        label: "Days",
                      },
                      {
                        value: "months",
                        label: "Months",
                      },
                      {
                        value: "years",
                        label: "Years",
                      },
                    ]}
                    labelClassName=""
                  />
                )}
              </form.AppField>

              <form.AppField name="recurPeriod">
                {field => (
                  <field.NumberField
                    label="Every N Periods"
                    min={1}
                  />
                )}
              </form.AppField>
            </>
          )}

          <EditPageFooter
            isNew={isNew}
            onDelete={handleDelete}
            deleteLabel="Delete Provider"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isNew ? "Create Provider" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isNew) {
                  navigate({
                    to: "/providers",
                  });
                }
                else {
                  navigate({
                    to: "/providers/$id",
                    params: {
                      id,
                    },
                  });
                }
              }}
            >
              Cancel
            </Button>
          </EditPageFooter>
        </form>
        <UnsavedChangesDialog
          shouldBlockFn={() => hasChanges && !skipBlocker.current}
        />
      </div>
    </div>
  );
}
