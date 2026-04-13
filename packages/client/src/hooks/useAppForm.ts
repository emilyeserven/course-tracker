import { createFormHook } from "@tanstack/react-form";

import { ComboboxField } from "@/components/formFields/ComboboxField";
import { DatePickerField } from "@/components/formFields/DatePickerField";
import { InputField } from "@/components/formFields/InputField";
import { NumberField } from "@/components/formFields/NumberField";
import { RadioGroupField } from "@/components/formFields/RadioGroupField";
import { TextareaField } from "@/components/formFields/TextareaField";
import { fieldContext, formContext } from "@/utils/fieldContext";

export const {
  useAppForm,
} = createFormHook({
  fieldComponents: {
    InputField,
    TextareaField,
    NumberField,
    RadioGroupField,
    DatePickerField,
    ComboboxField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
