import type { useResourceEditForm } from "@/hooks/useResourceEditForm";
import type { AnyFieldApi } from "@tanstack/react-form";

import { InfinityIcon, ListChecks } from "lucide-react";

import { Field, FieldLabel } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ProgressMode = "manual" | "modules" | "none";

interface ProgressModeFieldProps {
  /** The edit form, for the manual progress number fields. */
  form: ReturnType<typeof useResourceEditForm>["form"];
  /** Whether progress is currently computed from finished modules. */
  modulesAreExhaustive: boolean;
  /** Whether the resource tracks progress at all; false = "No Progress". */
  tracksProgress: boolean;
  /** True for the new-resource form (module tracking not yet available). */
  isNew: boolean;
  onModeChange: (mode: ProgressMode) => void;
  /** Switch the edit page to the Modules tab. */
  onGoToModules: () => void;
}

/**
 * "How to calculate progress" chooser: a Manual / Module Tracking / No Progress
 * radio. Manual reveals the current/total number fields; Module Tracking drives
 * the resource's `modulesAreExhaustive` flag (via `onModeChange`) and offers a
 * shortcut to the Modules tab; No Progress opts the resource out of tracking
 * entirely (it renders an infinity icon wherever progress would show). Module
 * Tracking is disabled for new resources, which have no modules yet.
 */
export function ProgressModeField({
  form,
  modulesAreExhaustive,
  tracksProgress,
  isNew,
  onModeChange,
  onGoToModules,
}: ProgressModeFieldProps) {
  const mode: ProgressMode = !tracksProgress
    ? "none"
    : modulesAreExhaustive
      ? "modules"
      : "manual";
  return (
    <Field>
      <FieldLabel>How to calculate progress</FieldLabel>
      <RadioGroup
        value={mode}
        onValueChange={val => onModeChange(val as ProgressMode)}
      >
        <div className="flex items-start gap-2">
          <RadioGroupItem
            value="manual"
            id="progress-mode-manual"
            className="mt-0.5"
          />
          <Label
            htmlFor="progress-mode-manual"
            className="flex flex-col items-start gap-0.5 font-normal"
          >
            <span className="font-medium">Manual</span>
            <span className="text-xs text-muted-foreground">
              Enter your current progress and total units below.
            </span>
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <RadioGroupItem
            value="modules"
            id="progress-mode-modules"
            className="mt-0.5"
            disabled={isNew}
          />
          <Label
            htmlFor="progress-mode-modules"
            className="flex flex-col items-start gap-0.5 font-normal"
          >
            <span className="font-medium">Module Tracking</span>
            <span className="text-xs text-muted-foreground">
              {isNew
                ? "Create the resource and add modules first, then switch to "
                + "module tracking."
                : "Progress and % complete are calculated from how many "
                  + "modules are marked done."}
            </span>
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <RadioGroupItem
            value="none"
            id="progress-mode-none"
            className="mt-0.5"
          />
          <Label
            htmlFor="progress-mode-none"
            className="flex flex-col items-start gap-0.5 font-normal"
          >
            <span className="font-medium">No Progress</span>
            <span className="text-xs text-muted-foreground">
              Don&apos;t track progress — show an infinity icon instead of a
              progress bar.
            </span>
          </Label>
        </div>
      </RadioGroup>

      {mode === "none" && (
        <p
          className="
            mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground
          "
        >
          <InfinityIcon className="size-4" />
          This resource won&apos;t show a progress bar or percentage.
        </p>
      )}

      {mode === "modules" && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onGoToModules}
          className="mt-2 self-start"
        >
          <ListChecks className="size-4" />
          Go to Modules
        </Button>
      )}

      {mode === "manual" && (
        <div className="mt-2 grid grid-cols-2 gap-4">
          <form.AppField
            name="progressCurrent"
            validators={{
              onSubmit: ({
                value,
                fieldApi,
              }: {
                value: number | null;
                fieldApi: AnyFieldApi;
              }) => {
                const total = fieldApi.form.getFieldValue("progressTotal");
                if (value != null && total != null && value > total) {
                  return {
                    message: "Current progress cannot exceed total modules",
                  };
                }
                return undefined;
              },
            }}
          >
            {field => (
              <field.NumberField
                label="Current Progress"
                min={0}
              />
            )}
          </form.AppField>

          <form.AppField name="progressTotal">
            {field => (
              <field.NumberField
                label="Total Modules"
                min={0}
              />
            )}
          </form.AppField>
        </div>
      )}
    </Field>
  );
}
