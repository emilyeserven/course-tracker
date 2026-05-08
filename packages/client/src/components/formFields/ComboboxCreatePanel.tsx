import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { Input } from "@/components/forms/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface CreateFieldConfig {
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "url" | "email";
  placeholder?: string;
  /** When true, this field is pre-filled with the user's typed input */
  isPrimary?: boolean;
}

export interface CreateConfig {
  /** Singular display label used in messages, e.g. "provider" */
  itemLabel: string;
  /** Fields to render in the inline create form. The field marked isPrimary
   * (or the first field) is pre-filled from the combobox input. */
  fields: CreateFieldConfig[];
  /** Called with the form values; resolves with the new entity's id. */
  onCreate: (values: Record<string, unknown>) => Promise<string>;
}

interface ComboboxCreatePanelProps {
  config: CreateConfig;
  initialPrimaryValue: string;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}

function getPrimaryFieldName(config: CreateConfig): string {
  return (
    config.fields.find(f => f.isPrimary)?.name
    ?? config.fields[0]?.name
    ?? "name"
  );
}

export function ComboboxCreatePanel({
  config,
  initialPrimaryValue,
  submitting,
  onCancel,
  onSubmit,
}: ComboboxCreatePanelProps) {
  const primaryFieldName = getPrimaryFieldName(config);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of config.fields) {
      initial[f.name] = f.name === primaryFieldName ? initialPrimaryValue : "";
    }
    return initial;
  });

  useEffect(() => {
    setValues(prev => ({
      ...prev,
      [primaryFieldName]: initialPrimaryValue,
    }));
  }, [initialPrimaryValue, primaryFieldName]);

  const canSubmit = config.fields.every(
    f => !f.required || (values[f.name] ?? "").trim().length > 0,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    const trimmed: Record<string, unknown> = {};
    for (const f of config.fields) {
      const v = (values[f.name] ?? "").trim();
      trimmed[f.name] = v === "" ? null : v;
    }
    onSubmit(trimmed);
  }

  return (
    <div
      className="
        mt-2 flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-4
      "
    >
      <div className="text-sm font-medium">
        New
        {" "}
        {config.itemLabel}
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
      >
        {config.fields.map(f => (
          <div
            key={f.name}
            className="flex flex-col gap-1"
          >
            <Label
              htmlFor={`combobox-create-${f.name}`}
              className="text-sm"
            >
              {f.label}
              {f.required && <span className="text-destructive"> *</span>}
            </Label>
            <Input
              id={`combobox-create-${f.name}`}
              type={f.type ?? "text"}
              value={values[f.name] ?? ""}
              placeholder={f.placeholder}
              onChange={e =>
                setValues(prev => ({
                  ...prev,
                  [f.name]: e.target.value,
                }))}
              disabled={submitting}
              autoFocus={f.name === primaryFieldName}
            />
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={!canSubmit || submitting}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Create
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
