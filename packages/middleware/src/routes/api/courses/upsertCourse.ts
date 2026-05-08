import { courses, topicsToCourses } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import {
  courseStatusEnum,
  nullableBoolean,
  nullableInteger,
  nullableString,
} from "@/utils/schemas";

interface CourseBody {
  name: string;
  description?: string | null;
  url?: string | null;
  status?: "active" | "inactive" | "complete";
  progressCurrent?: number | null;
  progressTotal?: number | null;
  cost?: string | null;
  isCostFromPlatform?: boolean;
  dateExpires?: string | null;
  isExpires?: boolean | null;
  topicId?: string | null;
  courseProviderId?: string | null;
}

const updateableColumns = [
  "name",
  "description",
  "url",
  "status",
  "progressCurrent",
  "progressTotal",
  "cost",
  "isCostFromPlatform",
  "dateExpires",
  "isExpires",
  "courseProviderId",
] as const;

export default createUpsertHandler<CourseBody>({
  description: "Create or update a course",
  table: courses,
  bodySchema: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
      },
      description: nullableString,
      url: nullableString,
      status: courseStatusEnum,
      progressCurrent: nullableInteger,
      progressTotal: nullableInteger,
      cost: nullableString,
      isCostFromPlatform: {
        type: "boolean",
      },
      dateExpires: nullableString,
      isExpires: nullableBoolean,
      topicId: nullableString,
      courseProviderId: nullableString,
    },
  },
  buildRow: (body, id) => ({
    id,
    name: body.name,
    description: body.description ?? null,
    url: body.url ?? null,
    status: body.status,
    progressCurrent: body.progressCurrent ?? null,
    progressTotal: body.progressTotal ?? null,
    cost: body.cost ?? null,
    isCostFromPlatform: body.isCostFromPlatform ?? false,
    dateExpires: body.dateExpires ?? null,
    isExpires: body.isExpires ?? null,
    courseProviderId: body.courseProviderId ?? null,
  }),
  updateableColumns,
  generateIdIfMissing: true,
  returnId: true,
  junctions: [
    {
      table: topicsToCourses,
      foreignKey: topicsToCourses.courseId,
      buildRows: (body, id) =>
        body.topicId
          ? [{
            topicId: body.topicId,
            courseId: id,
          }]
          : [],
    },
  ],
});
