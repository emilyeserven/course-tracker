import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { useNavigate, useRouter } from "@tanstack/react-router";
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

export function LoadDialog({
  triggerClassName,
}: { triggerClassName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
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
      localStorage.setItem("courseData", value.data);

      if (router.state.location.pathname === "/courses") {
        location.reload();
      }
      else {
        navigate({
          to: "/courses",
        });
        setIsOpen(false);
      }
    },
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => setIsOpen(!isOpen)}
    >
      <DialogTrigger
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        Load Data
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Load Data</DialogTitle>
          <DialogDescription>
            Paste data below to pick up where you left off.
          </DialogDescription>
        </DialogHeader>
        <div>
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
                      rows={5}
                      className="max-h-[200px] max-w-[475px]"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
