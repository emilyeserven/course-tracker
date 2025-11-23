import type { ReactFormExtendedApi } from "@tanstack/react-form";

import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/field";
import { Input } from "@/components/input";

interface TopicFieldProps {
  form: ReactFormExtendedApi<any, any, any, any, any, any, any, any, any, any, any, any>;
  condition: boolean;
  name: string;
  label: string;
}
export function CourseFields({
  form,
  condition,
  name,
  label,
}: TopicFieldProps) {
  if (!condition) {
    return <></>;
  }
  return (
    <FieldSet className="flex flex-row flex-nowrap">
      <div
        className="inline-flex w-1/4"
      >
        <FieldLegend
          className="data-[variant=legend]:text-2xl"
        >{label}
        </FieldLegend>

      </div>
      <FieldGroup className="inline-flex w-3/4 flex-col gap-4">
        <form.Field
          name={name + "Name"}
          children={(field) => {
            const isInvalid
              = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-lg"
                >Course Name
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Memes"
                  autoComplete="off"
                  className={`
                    h-11
                    md:text-xl
                  `}
                />
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            );
          }}
        />
        <form.Field
          name={name + "Url"}
          children={(field) => {
            const isInvalid
              = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-lg"
                >Course URL
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Memes"
                  autoComplete="off"
                  className={`
                    h-11
                    md:text-xl
                  `}
                />
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </FieldSet>
  );
}
