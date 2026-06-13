import type { BaseFieldProps } from "@/components/formFields/fieldProps";

import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Input } from "@/components/input";
import { cn } from "@/lib/utils";
import {
  changedFieldClass,
  useFieldChangeHighlight,
} from "@/utils/fieldChangeHighlight";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface InputFieldProps extends BaseFieldProps {
  fieldClassName?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function InputField({
  label,
  className,
  placeholder,
  fieldClassName,
  disabled,
}: InputFieldProps) {
  // fallow-ignore-next-line code-duplication
  const {
    field, isInvalid,
  } = useIsFieldInvalid<string>();
  const showChanged = useFieldChangeHighlight();

  return (
    <Field
      data-invalid={isInvalid}
      className={cn(showChanged && changedFieldClass)}
    >
      <FieldLabel
        htmlFor={field.name}
        className={className}
      >
        {label}
      </FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        autoComplete="off"
        disabled={disabled}
        className={fieldClassName}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
