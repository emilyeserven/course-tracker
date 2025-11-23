import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/field";
import { Input } from "@/components/input";

export const Route = createFileRoute("/about")({
  component: About,
});

const formSchema = z.object({
  name: z
    .string()
    .min(0, "Name must be at least 0 characters.")
    .max(32, "Name must be at most 32 characters."),
  topic1: z
    .string()
    .min(1, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  topic2: z
    .string()
    .min(1, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  topic3: z
    .string()
    .min(1, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  topic4: z
    .string()
    .min(1, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  topic5: z
    .string()
    .min(1, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
});

export function About() {
  const form = useForm({
    defaultValues: {
      name: "",
      topic1: "",
      topic2: "",
      topic3: "",
      topic4: "",
      topic5: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      console.log(value);
    },
  });
  const name = useStore(form.store, state => state.values.name);

  return (
    <div className="flex flex-col gap-20 p-4">
      <form
        id="onboarding"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Field>
          <FieldLabel
            htmlFor="name"
            className="text-2xl"
          >What&#39;s your first name?
          </FieldLabel>
          <Input
            id="name"
            autoComplete="off"
            placeholder="First Name"
            className={`
              h-12 w-full
              md:text-2xl
            `}
          />
        </Field>
        <FieldSet>
          <FieldLegend
            className="data-[variant=legend]:text-2xl"
          >Nice to meet you{name ? `, ${name}` : ""}! What are you learning about?
          </FieldLegend>
          <FieldDescription className="text-primary text-xl">This will create some categories for you.</FieldDescription>
          <FieldGroup className="grid grid-cols-2">
            <Field>
              <FieldLabel htmlFor="topic1">Topic 1</FieldLabel>
              <Input
                id="topic1"
                autoComplete="off"
                placeholder="Memes"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="topic2">Topic 2</FieldLabel>
              <Input
                id="topic2"
                autoComplete="off"
                placeholder="Internet"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="topic3">Topic 3</FieldLabel>
              <Input
                id="topic3"
                autoComplete="off"
                placeholder="Internet"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="topic4">Topic 4</FieldLabel>
              <Input
                id="topic4"
                autoComplete="off"
                placeholder="Internet"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="topic5">Topic 5</FieldLabel>
              <Input
                id="topic5"
                autoComplete="off"
                placeholder="Internet"
              />
            </Field>
            <div className="flex flex-col justify-center">
              <i>You may add more topics later!</i>
            </div>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  );
}
