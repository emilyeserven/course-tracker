import type { BaseFieldProps } from "@/types/fieldProps";

import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/calendar";
import { Field, FieldLabel } from "@/components/forms/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  changedFieldClass,
  useFieldChangeHighlight,
} from "@/utils/fieldChangeHighlight";
import { useFieldContext } from "@/utils/fieldContext";

interface DatePickerFieldProps extends BaseFieldProps {
  placeholder?: string;
  clearLabel?: string;
}

export function DatePickerField({
  label,
  placeholder = "No expiry date",
  clearLabel = "Clear date",
  className,
}: DatePickerFieldProps) {
  const field = useFieldContext<Date | null>();
  const showChanged = useFieldChangeHighlight();

  return (
    <Field className={cn(showChanged && changedFieldClass)}>
      <FieldLabel className={className}>{label}</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !field.state.value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {field.state.value
              ? field.state.value.toLocaleDateString()
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={field.state.value ?? undefined}
            onSelect={date => field.handleChange(date ?? null)}
          />
        </PopoverContent>
      </Popover>
      {field.state.value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => field.handleChange(null)}
        >
          {clearLabel}
        </Button>
      )}
    </Field>
  );
}
