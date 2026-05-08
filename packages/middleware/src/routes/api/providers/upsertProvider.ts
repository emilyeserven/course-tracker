import { courseProviders } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import {
  nullableBoolean,
  nullableInteger,
  nullableString,
} from "@/utils/schemas";

interface ProviderBody {
  name: string;
  url: string;
  description?: string | null;
  cost?: string | null;
  isRecurring?: boolean | null;
  recurDate?: string | null;
  recurPeriodUnit?: "days" | "months" | "years" | null;
  recurPeriod?: number | null;
  isCourseFeesShared?: boolean | null;
}

const updateableColumns = [
  "name",
  "description",
  "url",
  "cost",
  "isRecurring",
  "recurDate",
  "recurPeriodUnit",
  "recurPeriod",
  "isCourseFeesShared",
] as const;

export default createUpsertHandler<ProviderBody>({
  description: "Create or update a provider",
  table: courseProviders,
  bodySchema: {
    type: "object",
    required: ["name", "url"],
    properties: {
      name: {
        type: "string",
      },
      description: nullableString,
      url: {
        type: "string",
      },
      cost: nullableString,
      isRecurring: nullableBoolean,
      recurDate: nullableString,
      recurPeriodUnit: {
        type: ["string", "null"],
        enum: ["days", "months", "years", null],
      },
      recurPeriod: nullableInteger,
      isCourseFeesShared: nullableBoolean,
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    description: body.description ?? null,
    url: body.url,
    cost: body.cost ?? null,
    isRecurring: body.isRecurring ?? null,
    recurDate: body.recurDate ?? null,
    recurPeriodUnit: body.recurPeriodUnit ?? undefined,
    recurPeriod: body.recurPeriod ?? null,
    isCourseFeesShared: body.isCourseFeesShared ?? null,
  }),
  updateableColumns,
});
