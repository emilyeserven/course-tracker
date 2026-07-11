import { useState } from "react";

import { useStore } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { CourseFields } from "@/components/forms/CourseFields";
import { Button } from "@/components/ui/button";
import { postOnboardForm } from "@/utils";

export const Route = createFileRoute("/onboard")({
  component: Onboard,
});

const FIELD_COUNT = 5;
const FIELD_INDICES = Array.from(
  {
    length: FIELD_COUNT,
  },
  (_, i) => i,
);

const fieldSchema = (label: string, max: number) =>
  z.string().max(max, `${label} must be at most ${max} characters.`);

const formSchema = z.object({
  name: fieldSchema("Name", 32),
  ...Object.fromEntries(
    FIELD_INDICES.flatMap(i => [
      [`course${i}Name`, fieldSchema("Resource name", 200)],
      [`course${i}Url`, fieldSchema("Resource URL", 200)],
    ]),
  ),
});

const defaultValues: Record<string, string> = Object.fromEntries(
  Object.keys(formSchema.shape).map(key => [key, ""]),
);

function Onboard() {
  const [isStep2Revealed, setIsStep2Revealed] = useState(false);
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const rawCourses = FIELD_INDICES.map(i => ({
        name: value[`course${i}Name`],
        url: value[`course${i}Url`],
        id: i,
      }));
      const filteredCourses = rawCourses.filter(item => item.name !== "");

      const cleanedValue = {
        name: value.name,
        courses: filteredCourses,
      };

      await postOnboardForm(cleanedValue);

      await navigate({
        to: "/resources",
      });
    },
  });

  const formValues = useStore(form.store, state => state.values);
  const name = formValues.name;

  return (
    <div className="container mt-4 mb-20 flex flex-col gap-20">
      <form
        id="onboarding"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-20"
      >
        <div className="flex flex-col gap-4">
          <form.AppField name="name">
            {field => (
              <field.InputField
                label="What's your first name?"
                className="text-3xl"
                placeholder="Noodles"
                fieldClassName="h-12 md:text-2xl"
              />
            )}
          </form.AppField>
          {!isStep2Revealed && (
            <Button
              className="inline-flex grow-0"
              onClick={() => setIsStep2Revealed(true)}
            >
              Next
            </Button>
          )}
        </div>

        {isStep2Revealed && (
          <div className="flex flex-col gap-6">
            <span className="text-3xl">
              Nice to meet you{name ? `, ${name}` : ""}! Let&#39;s add the
              resources you&#39;re learning from.
            </span>
            <div className="flex flex-col gap-12">
              {FIELD_INDICES.map(i => (
                <CourseFields
                  key={`course${i}`}
                  // CourseFields is form-data-agnostic (it only renders
                  // dynamically-named string fields). Bridge TanStack Form's
                  // invariant generics: this form's data is Record<string,string>
                  // while the prop defaults to the unknown-data form type.
                  form={form as unknown as ReturnType<typeof useAppForm>}
                  condition={i === 0 || !!formValues[`course${i - 1}Name`]}
                  name={`course${i}`}
                  label={`Resource ${i + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {isStep2Revealed && formValues.course0Name && formValues.course0Url && (
          <div className="flex flex-row gap-4">
            <Button
              type="submit"
              form="onboarding"
            >
              Submit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
