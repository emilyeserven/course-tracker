import type { CreateConfig } from "@/components/formFields/ComboboxCreatePanel";
import type { SelectOption } from "@/utils";

const DEFAULT_OPTIONS: SelectOption[] = [
  {
    value: "book",
    label: "Book",
  },
  {
    value: "course",
    label: "Course",
  },
  {
    value: "article",
    label: "Article",
  },
  {
    value: "video",
    label: "Video",
  },
];

/** Mock `SelectOption[]` for radio/combobox stories (defaults to 3). */
export function makeSelectOptions(count = 3): SelectOption[] {
  return DEFAULT_OPTIONS.slice(0, count);
}

/**
 * Mock `SelectOption[]` whose values carry a `prefix:` so a grouped combobox
 * (`groupByPrefix`) buckets them under group headers.
 */
export function makeGroupedSelectOptions(): SelectOption[] {
  return [
    {
      value: "lang:typescript",
      label: "lang:TypeScript",
    },
    {
      value: "lang:rust",
      label: "lang:Rust",
    },
    {
      value: "tool:vite",
      label: "tool:Vite",
    },
  ];
}

/** Mock inline-create config for the combobox "create new option" flow. */
export function makeCreateConfig(
  overrides: Partial<CreateConfig> = {},
): CreateConfig {
  return {
    itemLabel: "provider",
    fields: [
      {
        name: "name",
        label: "Name",
        required: true,
        isPrimary: true,
      },
      {
        name: "url",
        label: "URL",
        type: "url",
      },
    ],
    onCreate: () => Promise.resolve("new-id"),
    ...overrides,
  };
}
