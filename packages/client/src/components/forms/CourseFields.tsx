import type { useAppForm } from "@/components/formFields";

import { FieldGroup, FieldLegend, FieldSet } from "@/components/forms/field";

interface CourseFieldsProps {
  form: ReturnType<typeof useAppForm>;
  condition: boolean;
  name: string;
  label: string;
}

export function CourseFields({
  form,
  condition,
  name,
  label,
}: CourseFieldsProps) {
  if (!condition) {
    return <></>;
  }

  return (
    <FieldSet className="flex flex-row flex-nowrap">
      <div className="inline-flex w-1/4">
        <FieldLegend className="data-[variant=legend]:text-2xl">
          {label}
        </FieldLegend>
      </div>
      <FieldGroup className="inline-flex w-3/4 flex-col gap-6">
        <form.AppField name={`${name}Name`}>
          {field => (
            <field.InputField
              label="Resource Name"
              placeholder="Memes"
            />
          )}
        </form.AppField>
        <form.AppField name={`${name}Url`}>
          {field => (
            <field.InputField
              label="Resource URL"
              placeholder="Memes"
            />
          )}
        </form.AppField>
      </FieldGroup>
    </FieldSet>
  );
}
