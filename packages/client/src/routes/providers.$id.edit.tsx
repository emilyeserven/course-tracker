import { useMemo } from "react";

import { useStore } from "@tanstack/react-form";
// fallow-ignore-next-line code-duplication
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EyeIcon, Loader2 } from "lucide-react";
import * as z from "zod";

import {
  Button,
  EditForm,
  EditPageFooter,
  EntityHeaderButton,
  PageHeader,
  UnsavedChangesDialog,
} from "@/components/editPage";
import { useAppForm } from "@/components/formFields";
import { NAME_MAX_LENGTH, TEXT_MAX_LENGTH } from "@/constants/stringLimits";
import { useEditFormPage } from "@/hooks/useEditFormPage";
import {
  createProvider,
  deleteSingleProvider,
  fetchSingleProvider,
  formHasChanges,
  queryKeys,
  upsertProvider,
} from "@/utils";

// fallow-ignore-next-line code-duplication
export const Route = createFileRoute("/providers/$id/edit")({
  component: SingleProviderEdit,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(NAME_MAX_LENGTH),
  description: z.string().max(TEXT_MAX_LENGTH),
  url: z.string().min(1, "URL is required").max(NAME_MAX_LENGTH),
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

  const {
    data, shouldBlockFn, makeDeleteHandler, makeSubmitHandler,
  }
    = useEditFormPage({
      id,
      isNew,
      queryKey: ["provider", id],
      queryFn: () => fetchSingleProvider(id),
      relatedQueryKeys: [queryKeys.providers.list()],
    });

  const submitProvider = makeSubmitHandler({
    createFn: createProvider,
    upsertFn: upsertProvider,
    entityLabel: "provider",
    navigateToEntity: providerId =>
      navigate({
        to: "/providers/$id",
        params: {
          id: providerId,
        },
      }),
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

  // fallow-ignore-next-line code-duplication
  const form = useAppForm({
    defaultValues: startingValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      // fallow-ignore-next-line code-duplication
      await submitProvider({
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
      });
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

  const handleDelete = makeDeleteHandler({
    deleteFn: deleteSingleProvider,
    entityLabel: "provider",
    navigateToList: () =>
      navigate({
        to: "/providers",
      }),
  });

  return (
    <div>
      <PageHeader
        pageTitle={isNew ? "New Provider" : "Edit Provider"}
        pageSection="providers"
      >
        {!isNew && (
          <EntityHeaderButton
            to="/providers/$id"
            params={{
              id,
            }}
            label="View Provider"
            icon={<EyeIcon />}
          />
        )}
      </PageHeader>
      <div className="m-auto w-full max-w-[1200px] px-4">
        <EditForm
          onSubmit={form.handleSubmit}
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
                label="Resource Fees Shared?"
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
        </EditForm>
        <UnsavedChangesDialog shouldBlockFn={shouldBlockFn(hasChanges)} />
      </div>
    </div>
  );
}
