import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";

import { Calendar } from "@/components/calendar";
import { Field, FieldError, FieldLabel } from "@/components/forms/field";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/input";
import { Textarea } from "@/components/forms/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fetchSingleCourse, upsertCourse } from "@/utils/fetchFunctions";

export const Route = createFileRoute("/courses/$id/edit")({
  component: SingleCourseEdit,
});

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(500),
  url: z.string().max(255),
  status: z.enum(["active", "inactive", "complete"]),
  progressCurrent: z.number().int().min(0),
  progressTotal: z.number().int().min(0),
  cost: z.number().min(0),
  dateExpires: z.date().nullable(),
});

function SingleCourseEdit() {
  const {
    id,
  } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data,
  } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchSingleCourse(id),
  });

  const form = useForm({
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      url: data?.url ?? "",
      status: data?.status ?? "active",
      progressCurrent: data?.progressCurrent ?? 0,
      progressTotal: data?.progressTotal ?? 0,
      cost: data?.cost ? Number(data.cost.cost) : 0,
      dateExpires: data?.dateExpires ? new Date(data.dateExpires) : null,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({
      value,
    }) => {
      try {
        await upsertCourse(id, {
          name: value.name,
          description: value.description || null,
          url: value.url || null,
          status: value.status,
          progressCurrent: value.progressCurrent,
          progressTotal: value.progressTotal,
          cost: value.cost ? String(value.cost) : null,
          isCostFromPlatform: data?.cost?.isCostFromPlatform ?? false,
          dateExpires: value.dateExpires
            ? value.dateExpires.toISOString().split("T")[0]
            : null,
          isExpires: !!value.dateExpires,
        });

        await queryClient.invalidateQueries({
          queryKey: ["course", id],
        });
        await navigate({
          to: "/courses/$id",
          params: {
            id,
          },
        });
      }
      catch {
        toast.error("Failed to save course. Please try again.");
      }
    },
  });

  return (
    <div className="container">
      <h2 className="mb-6 text-2xl">Edit Course</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex max-w-2xl flex-col gap-8"
      >
        <FormField
          form={form}
          name="name"
          label="Course Name"
        />

        <form.Field
          name="description"
          children={(field) => {
            const isInvalid
              = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-2xl"
                >
                  Description
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={e => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="What is this course about?"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <FormField
          form={form}
          name="url"
          label="Course URL"
        />

        <form.Field
          name="status"
          children={field => (
            <Field>
              <FieldLabel className="text-2xl">Status</FieldLabel>
              <RadioGroup
                value={field.state.value}
                onValueChange={val =>
                  field.handleChange(val as "active" | "inactive" | "complete")}
                className="flex flex-row gap-4"
              >
                {(["active", "inactive", "complete"] as const).map(status => (
                  <div
                    key={status}
                    className="flex items-center gap-2"
                  >
                    <RadioGroupItem
                      value={status}
                      id={`status-${status}`}
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="capitalize"
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="progressCurrent"
            validators={{
              onSubmit: ({
                value, fieldApi,
              }) => {
                const total = fieldApi.form.getFieldValue("progressTotal");
                if (value > total) {
                  return {
                    message: "Current progress cannot exceed total modules",
                  };
                }
                return undefined;
              },
            }}
            children={(field) => {
              const isInvalid
                = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-2xl"
                  >
                    Current Progress
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(Number(e.target.value))}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="progressTotal"
            children={(field) => {
              const isInvalid
                = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-2xl"
                  >
                    Total Modules
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(Number(e.target.value))}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <form.Field
          name="cost"
          children={(field) => {
            const isInvalid
              = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="text-2xl"
                >
                  Cost ($)
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={e =>
                    field.handleChange(
                      e.target.value ? Number(e.target.value) : 0,
                    )}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="dateExpires"
          children={field => (
            <Field>
              <FieldLabel className="text-2xl">Expiry Date</FieldLabel>
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
                      : "No expiry date"}
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
                  Clear date
                </Button>
              )}
            </Field>
          )}
        />

        <div className="flex flex-row gap-4">
          <Button type="submit">Save Changes</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({
              to: "/courses/$id",
              params: {
                id,
              },
            })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
