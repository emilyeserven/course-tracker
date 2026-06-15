import type { LevelValue } from "./-LevelSelectRow";
import type { useResourceEditForm } from "@/hooks/useResourceEditForm";

import { RESOURCE_TYPE_LABELS, RESOURCE_TYPES } from "@emstack/types";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { LevelSelectRow } from "./-LevelSelectRow";
import { ProgressModeField } from "./-ProgressModeField";

import { EditForm, EditPageFooter } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { changedFieldClass, FieldChangeHighlightProvider } from "@/utils";

interface DetailsTabProps {
  isNew: boolean;
  /** The form controller from `useResourceEditForm`, owned by the route. */
  controller: ReturnType<typeof useResourceEditForm>;
  onDelete: () => void | Promise<void>;
  onDuplicate: () => void | Promise<void>;
  onCancel: () => void;
  /** Switch the edit page to the Modules tab (module-tracking mode). */
  onGoToModules: () => void;
}

export function DetailsTab({
  isNew,
  controller,
  onDelete,
  onDuplicate,
  onCancel,
  onGoToModules,
}: DetailsTabProps) {
  const {
    form,
    topicOptions,
    providerOptions,
    tagOptions,
    tagGroupOptions,
    currentValues,
    isSubmitting,
    isCostFromPlatform,
    providerUrlMissing,
    modulesAreExhaustive,
    createTopicOption,
    createProviderOption,
    createTagOption,
    setProgressMode,
  } = controller;

  return (
    <FieldChangeHighlightProvider enabled={!isNew}>
      <EditForm
        onSubmit={form.handleSubmit}
        className="flex max-w-2xl flex-col gap-8"
      >
        <form.AppField name="name">
          {field => <field.InputField label="Resource Name" />}
        </form.AppField>

        <form.AppField name="description">
          {field => (
            <field.TextareaField
              label="Description"
              placeholder="What is this course about?"
            />
          )}
        </form.AppField>

        <form.AppField name="url">
          {field => <field.InputField label="Resource URL" />}
        </form.AppField>

        <form.AppField name="type">
          {field => (
            <field.RadioGroupField
              label="Type"
              options={RESOURCE_TYPES.map(t => ({
                value: t,
                label: RESOURCE_TYPE_LABELS[t],
              }))}
            />
          )}
        </form.AppField>

        <form.AppField name="topicId">
          {field => (
            <field.ComboboxField
              label="Topic"
              options={topicOptions}
              placeholder="Search topics..."
              create={{
                itemLabel: "topic",
                fields: [
                  {
                    name: "name",
                    label: "Name",
                    required: true,
                    isPrimary: true,
                  },
                ],
                onCreate: createTopicOption,
              }}
            />
          )}
        </form.AppField>

        <form.Field name="providerIsSelf">
          {field => (
            <label
              className={cn(
                "flex items-start gap-2 text-sm",
                !isNew && !field.state.meta.isDefaultValue && changedFieldClass,
                providerUrlMissing && "opacity-60",
              )}
            >
              <input
                type="checkbox"
                checked={field.state.value}
                disabled={providerUrlMissing}
                onChange={(e) => {
                  field.handleChange(e.target.checked);
                  if (e.target.checked) {
                    form.setFieldValue("courseProviderId", "");
                  }
                }}
                className="mt-0.5 size-4"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">
                  This resource is its own provider
                </span>
                <span className="text-xs text-muted-foreground">
                  {providerUrlMissing
                    ? "Add a Resource URL to enable this."
                    : "Creates a separate provider that mirrors this resource's "
                      + "name and URL, kept in sync whenever you save."}
                </span>
              </span>
            </label>
          )}
        </form.Field>

        {currentValues.providerIsSelf
          ? (
            <p className="text-sm text-muted-foreground">
              Provider mirrors this resource — its name and URL will match.
            </p>
          )
          : (
            <form.AppField name="courseProviderId">
              {field => (
                <field.ComboboxField
                  label="Provider"
                  options={providerOptions}
                  placeholder="Search providers..."
                  create={{
                    itemLabel: "provider",
                    fields: [
                      {
                        name: "name",
                        label: "Name",
                        required: true,
                        isPrimary: true,
                      },
                      {
                        name: "url",
                        label: "URL",
                        required: true,
                        type: "url",
                        placeholder: "https://...",
                      },
                    ],
                    onCreate: createProviderOption,
                  }}
                />
              )}
            </form.AppField>
          )}

        <form.AppField name="status">
          {field => (
            <field.RadioGroupField
              label="Status"
              options={[
                {
                  value: "active",
                  label: "active",
                },
                {
                  value: "inactive",
                  label: "inactive",
                },
                {
                  value: "complete",
                  label: "complete",
                },
              ]}
            />
          )}
        </form.AppField>

        <ProgressModeField
          form={form}
          modulesAreExhaustive={modulesAreExhaustive}
          tracksProgress={currentValues.tracksProgress}
          isNew={isNew}
          onModeChange={setProgressMode}
          onGoToModules={onGoToModules}
        />

        <form.AppField name="cost">
          {field => (
            <field.NumberField
              label="Cost ($)"
              min={0}
              step="0.01"
              disabled={isCostFromPlatform}
            />
          )}
        </form.AppField>

        <form.AppField name="dateExpires">
          {field => <field.DatePickerField label="Expiry Date" />}
        </form.AppField>

        <fieldset
          className="flex flex-col gap-3 rounded-md border border-border/60 p-3"
        >
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            Effort & Engagement
          </legend>
          <form.Field name="easeOfStarting">
            {field => (
              <LevelSelectRow
                label="Ease of Starting"
                value={field.state.value as LevelValue}
                onChange={v => field.handleChange(v)}
                changed={!isNew && !field.state.meta.isDefaultValue}
              />
            )}
          </form.Field>
          <form.Field name="timeNeeded">
            {field => (
              <LevelSelectRow
                label="Time Needed"
                value={field.state.value as LevelValue}
                onChange={v => field.handleChange(v)}
                changed={!isNew && !field.state.meta.isDefaultValue}
              />
            )}
          </form.Field>
          <form.Field name="interactivity">
            {field => (
              <LevelSelectRow
                label="Interactivity"
                value={field.state.value as LevelValue}
                onChange={v => field.handleChange(v)}
                changed={!isNew && !field.state.meta.isDefaultValue}
              />
            )}
          </form.Field>
        </fieldset>

        <div className="flex flex-col gap-1">
          <form.AppField name="tagIds">
            {field => (
              <field.MultiComboboxField
                label="Tags"
                options={tagOptions}
                placeholder="Pick tags..."
                groupByPrefix
                create={{
                  itemLabel: "tag",
                  fields: [
                    {
                      name: "name",
                      label: "Tag Name",
                      required: true,
                      isPrimary: true,
                    },
                    {
                      name: "groupId",
                      label: "Tag Group",
                      required: true,
                      type: "select",
                      placeholder: "Select a group...",
                      options: tagGroupOptions,
                    },
                  ],
                  onCreate: createTagOption,
                }}
              />
            )}
          </form.AppField>
          <Link
            to="/settings"
            search={{
              tab: "tasks",
            }}
            className="
              self-start text-xs text-muted-foreground underline
              underline-offset-4
              hover:text-foreground
            "
          >
            Manage tags in settings
          </Link>
        </div>

        <EditPageFooter
          isNew={isNew}
          onDelete={onDelete}
          deleteLabel="Delete Resource"
          onDuplicate={onDuplicate}
          duplicateLabel="Duplicate Resource"
        >
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isNew ? "Create Resource" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </EditPageFooter>
      </EditForm>
    </FieldChangeHighlightProvider>
  );
}
