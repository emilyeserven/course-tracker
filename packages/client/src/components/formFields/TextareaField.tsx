import type { BaseFieldProps } from "@/types/fieldProps";

import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  changedFieldClass,
  useFieldChangeHighlight,
} from "@/utils/fieldChangeHighlight";
import { useIsFieldInvalid } from "@/utils/useIsFieldInvalid";

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  disabled?: boolean;
  labelIcon?: React.ReactNode;
}

export function TextareaField({
  label,
  className,
  placeholder,
  disabled,
  labelIcon,
}: TextareaFieldProps) {
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
        {labelIcon && (
          <span className="inline-flex shrink-0 items-center">{labelIcon}</span>
        )}
        <span>{label}</span>
      </FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        disabled={disabled}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
