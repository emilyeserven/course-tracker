import { useState } from "react";

import { useForm, useStore } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/button";
import { CourseFields } from "@/components/CourseFields";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/field";
import { Input } from "@/components/input";
import { TopicField } from "@/components/TopicField";

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
    .min(0, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  topic2: z
    .string()
    .min(0, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  topic3: z
    .string()
    .min(0, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  topic4: z
    .string()
    .min(0, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  topic5: z
    .string()
    .min(0, "Topic must be at least 1 characters")
    .max(32, "Topic must be at most 32 characters."),
  course1Name: z
    .string()
    .min(0, "Course name must be at least 1 characters")
    .max(200, "Course name must be at most 32 characters."),
  course1Url: z
    .string()
    .min(0, "Course URL must be at least 1 characters")
    .max(200, "Course URL must be at most 32 characters."),
  course2Name: z
    .string()
    .min(0, "Course name must be at least 1 characters")
    .max(200, "Course name must be at most 32 characters."),
  course2Url: z
    .string()
    .min(0, "Course URL must be at least 1 characters")
    .max(200, "Course URL must be at most 32 characters."),
  course3Name: z
    .string()
    .min(0, "Course name must be at least 1 characters")
    .max(200, "Course name must be at most 32 characters."),
  course3Url: z
    .string()
    .min(0, "Course URL must be at least 1 characters")
    .max(200, "Course URL must be at most 32 characters."),
  course4Name: z
    .string()
    .min(0, "Course name must be at least 1 characters")
    .max(200, "Course name must be at most 32 characters."),
  course4Url: z
    .string()
    .min(0, "Course URL must be at least 1 characters")
    .max(200, "Course URL must be at most 32 characters."),
  course5Name: z
    .string()
    .min(0, "Course name must be at least 1 characters")
    .max(200, "Course name must be at most 32 characters."),
  course5Url: z
    .string()
    .min(0, "Course URL must be at least 1 characters")
    .max(200, "Course URL must be at most 32 characters."),
});

export function About() {
  const [isStep2Revealed, setIsStep2Revealed] = useState(false);
  const [isStep3Revealed, setIsStep3Revealed] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      name: "",
      topic1: "",
      topic2: "",
      topic3: "",
      topic4: "",
      topic5: "",
      course1Name: "",
      course1Url: "",
      course2Name: "",
      course2Url: "",
      course3Name: "",
      course3Url: "",
      course4Name: "",
      course4Url: "",
      course5Name: "",
      course5Url: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      console.log(value);
      const cleanedValue = {
        name: value.name,
        topics: [topic1, topic2, topic3, topic4, topic5],
        courses: [
          {
            name: value.course1Name,
            topic: topic1,
            url: value.course1Url,
            key: 1,
          },
          {
            name: value.course2Name,
            topic: topic2,
            url: value.course2Url,
            key: 2,
          },
          {
            name: value.course3Name,
            topic: topic3,
            url: value.course3Url,
            key: 3,
          },
          {
            name: value.course4Name,
            topic: topic4,
            url: value.course4Url,
            key: 4,
          },
          {
            name: value.course5Name,
            topic: topic5,
            url: value.course5Url,
            key: 5,
          },
        ],
      };
      console.log(cleanedValue);

      localStorage.setItem("courseData", JSON.stringify(cleanedValue));
      await navigate({
        to: "/courses",
      });
    },
  });
  const name = useStore(form.store, state => state.values.name);
  const topic1 = useStore(form.store, state => state.values.topic1);
  const topic2 = useStore(form.store, state => state.values.topic2);
  const topic3 = useStore(form.store, state => state.values.topic3);
  const topic4 = useStore(form.store, state => state.values.topic4);
  const topic5 = useStore(form.store, state => state.values.topic5);
  const course1Name = useStore(form.store, state => state.values.course1Name);
  const course1Url = useStore(form.store, state => state.values.course1Url);

  return (
    <div className="mt-4 mb-20 flex flex-col gap-20 p-4">
      <form
        id="onboarding"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-20"
      >
        <div className="flex flex-col gap-4">
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid
                = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-3xl"
                  >What&#39;s your first name?
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Noodles"
                    autoComplete="off"
                    className={`
                      h-12
                      md:text-2xl
                    `}
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              );
            }}
          />
          {!isStep2Revealed && (
            <div>
              <Button
                className="inline-flex grow-0"
                onClick={() => { setIsStep2Revealed(true); }}
              >
                Next
                <ArrowRight />
              </Button>
            </div>
          )}
        </div>

        {isStep2Revealed && (
          <div className="flex flex-col gap-4">
            <FieldSet>
              <FieldLegend
                className="data-[variant=legend]:text-3xl"
              >Nice to meet you{name ? `, ${name}` : ""}! What are you learning about?
              </FieldLegend>
              <FieldDescription className="text-xl">This will create some categories for you.</FieldDescription>
              <FieldGroup className="grid grid-cols-2">
                <TopicField
                  form={form}
                  condition={true}
                  name="topic1"
                  label="Topic 1"
                />
                <TopicField
                  form={form}
                  condition={!!topic1 && topic1 !== ""}
                  name="topic2"
                  label="Topic 2"
                />
                <TopicField
                  form={form}
                  condition={!!topic2 && topic2 !== ""}
                  name="topic3"
                  label="Topic 3"
                />
                <TopicField
                  form={form}
                  condition={!!topic3 && topic3 !== ""}
                  name="topic4"
                  label="Topic 4"
                />
                <TopicField
                  form={form}
                  condition={!!topic4 && topic4 !== ""}
                  name="topic5"
                  label="Topic 5"
                />
                { !!topic5 && topic5 !== "" && (
                  <div
                    className={`
                      text-primary flex flex-col justify-center text-xl italic
                    `}
                  >
                    You may add more topics later!
                  </div>
                )}
              </FieldGroup>
            </FieldSet>

            {!isStep3Revealed && topic1 && (
              <div>
                <Button
                  className="inline-flex grow-0"
                  onClick={() => { setIsStep3Revealed(true); }}
                >
                  Next
                  <ArrowRight />
                </Button>
              </div>
            )}
          </div>
        )}

        { isStep2Revealed && isStep3Revealed && (
          <div className="flex flex-col gap-6">
            <span className="text-3xl">Let&#39;s add a course per topic.</span>
            <div className="flex flex-col gap-12">
              <CourseFields
                form={form}
                condition={true}
                name="course1"
                label={topic1}
              />
              <CourseFields
                form={form}
                condition={!!topic2 && topic2 !== ""}
                name="course2"
                label={topic2}
              />
              <CourseFields
                form={form}
                condition={!!topic3 && topic3 !== ""}
                name="course3"
                label={topic3}
              />
              <CourseFields
                form={form}
                condition={!!topic4 && topic4 !== ""}
                name="course4"
                label={topic4}
              />
              <CourseFields
                form={form}
                condition={!!topic5 && topic5 !== ""}
                name="course5"
                label={topic5}
              />
            </div>

            {!isStep3Revealed && topic1 && (
              <div>
                <Button
                  className="inline-flex grow-0"
                  onClick={() => { setIsStep3Revealed(true); }}
                >
                  Next
                  <ArrowRight />
                </Button>
              </div>
            )}
          </div>
        )}

        { isStep2Revealed && isStep3Revealed && course1Name && course1Url && (
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
