import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { Button } from "@/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/dialog";
import { Field, FieldError, FieldLabel } from "@/components/field";
import { Textarea } from "@/components/textarea";

const formSchema = z.object({
  data: z
    .string()
    .min(0, "Name must be at least 0 characters."),
});

export function LoadDialog() {
  const form = useForm({
    defaultValues: {
      data: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      console.log(value);

      localStorage.setItem("courseData", value.data);
      location.reload();
    },
  });

  return (
    <Dialog>
      <DialogTrigger>
        Load Data
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Load Data</DialogTitle>
          <DialogDescription>
            Paste data below to pick up where you left off.
          </DialogDescription>
        </DialogHeader>
        <form
          id="loadData"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="data"
            children={(field) => {
              const isInvalid
                = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                  >Paste the data here.
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Noodles"
                    autoComplete="off"
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          />
          <Button
            type="submit"
            form="loadData"
          >
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
