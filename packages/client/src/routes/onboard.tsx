import { useState } from "react";

import { useStore } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import * as z from "zod";

import { useAppForm } from "@/components/formFields";
import { CourseFields } from "@/components/forms/CourseFields";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { postOnboardForm } from "@/utils";

export const Route = createFileRoute("/onboard")({
  component: Onboard,
});

const FIELD_COUNT = 5;
const FIELD_INDICES = Array.from({
  length: FIELD_COUNT,
}, (_, i) => i);

const fieldSchema = (label: string, max: number) =>
  z.string().max(max, `${label} must be at most ${max} characters.`);

const formSchema = z.object({
  name: fieldSchema("Name", 32),
  ...Object.fromEntries(
    FIELD_INDICES.map(i => [`topic${i}`, fieldSchema("Topic", 32)]),
  ),
  ...Object.fromEntries(
    FIELD_INDICES.flatMap(i => [
      [`course${i}Name`, fieldSchema("Course name", 200)],
      [`course${i}Url`, fieldSchema("Course URL", 200)],
    ]),
  ),
});

const defaultValues: Record<string, string> = Object.fromEntries(
  Object.keys(formSchema.shape).map(key => [key, ""]),
);

function NextButton({
  onClick,
}: { onClick: () => void }) {
  return (
    <Button
      className="inline-flex grow-0"
      onClick={onClick}
    >
      Next
      <ArrowRight />
    </Button>
  );
}

function Onboard() {
  const [isStep2Revealed, setIsStep2Revealed] = useState(false);
  const [isStep3Revealed, setIsStep3Revealed] = useState(false);
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      const topicValues = FIELD_INDICES.map(i => value[`topic${i}`]);
      const rawCourses = FIELD_INDICES.map(i => ({
        name: value[`course${i}Name`],
        topic: topicValues[i],
        url: value[`course${i}Url`],
        id: i,
      }));
      const filteredCourses = rawCourses.filter(item => item.name !== "");
      const filteredTopics = topicValues.filter(topic => topic !== "");

      const cleanedValue = {
        name: value.name,
        topics: filteredTopics,
        courses: filteredCourses,
      };

      await postOnboardForm(cleanedValue);

      await navigate({
        to: "/courses",
      });
    },
  });

  const formValues = useStore(form.store, state => state.values);
  const name = formValues.name;
  const topics = FIELD_INDICES.map(i => formValues[`topic${i}`]);

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
            <NextButton onClick={() => setIsStep2Revealed(true)} />
          )}
        </div>

        {isStep2Revealed && (
          <div className="flex flex-col gap-4">
            <FieldSet>
              <FieldLegend className="data-[variant=legend]:text-3xl">
                Nice to meet you{name ? `, ${name}` : ""}! What are you learning
                about?
              </FieldLegend>
              <FieldDescription className="text-xl">
                This will create some categories for you.
              </FieldDescription>
              <FieldGroup className="grid grid-cols-2">
                {FIELD_INDICES.map(
                  i =>
                    (i === 0 || !!topics[i - 1]) && (
                      <form.AppField
                        key={`topic${i}`}
                        name={`topic${i}`}
                      >
                        {field => (
                          <field.InputField
                            label={`Topic ${i + 1}`}
                            placeholder="Memes"
                          />
                        )}
                      </form.AppField>
                    ),
                )}
                {!!topics[FIELD_COUNT - 1] && (
                  <div
                    className={`
                      flex flex-col justify-center text-xl text-primary italic
                    `}
                  >
                    You may add more topics later!
                  </div>
                )}
              </FieldGroup>
            </FieldSet>

            {!isStep3Revealed && topics[0] && (
              <NextButton onClick={() => setIsStep3Revealed(true)} />
            )}
          </div>
        )}

        {isStep2Revealed && isStep3Revealed && (
          <div className="flex flex-col gap-6">
            <span className="text-3xl">Let&#39;s add a course per topic.</span>
            <div className="flex flex-col gap-12">
              {FIELD_INDICES.map(i => (
                <CourseFields
                  key={`course${i}`}
                  form={form}
                  condition={i === 0 || !!topics[i]}
                  name={`course${i}`}
                  label={topics[i]}
                />
              ))}
            </div>
          </div>
        )}

        {isStep2Revealed
          && isStep3Revealed
          && formValues.course0Name
          && formValues.course0Url && (
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
