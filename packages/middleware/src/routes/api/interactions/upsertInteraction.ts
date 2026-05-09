import { interactions } from "@/db/schema";
import { createUpsertHandler } from "@/utils/createUpsertHandler";
import { nullableString } from "@/utils/schemas";

const interactionProgressEnumSchema = {
  type: "string",
  enum: ["incomplete", "started", "complete"],
} as const;

const nullableInteractionDifficultyEnum = {
  type: ["string", "null"],
  enum: ["easy", "medium", "hard", null],
} as const;

const nullableInteractionUnderstandingEnum = {
  type: ["string", "null"],
  enum: ["none", "basic", "comfortable", "proficient", "mastered", null],
} as const;

interface InteractionBody {
  courseId: string;
  moduleGroupId?: string | null;
  moduleId?: string | null;
  date: string;
  progress: "incomplete" | "started" | "complete";
  note?: string | null;
  difficulty?: "easy" | "medium" | "hard" | null;
  understanding?:
    | "none"
    | "basic"
    | "comfortable"
    | "proficient"
    | "mastered"
    | null;
}

const updateableColumns = [
  "courseId",
  "moduleGroupId",
  "moduleId",
  "date",
  "progress",
  "note",
  "difficulty",
  "understanding",
] as const;

export default createUpsertHandler<InteractionBody>({
  description: "Create or update an interaction",
  table: interactions,
  bodySchema: {
    type: "object",
    required: ["courseId", "date", "progress"],
    properties: {
      courseId: {
        type: "string",
        minLength: 1,
      },
      moduleGroupId: nullableString,
      moduleId: nullableString,
      date: {
        type: "string",
      },
      progress: interactionProgressEnumSchema,
      note: nullableString,
      difficulty: nullableInteractionDifficultyEnum,
      understanding: nullableInteractionUnderstandingEnum,
    },
  },
  buildRow: (body, id) => ({
    id,
    courseId: body.courseId,
    moduleGroupId: body.moduleGroupId ?? null,
    moduleId: body.moduleId ?? null,
    date: body.date,
    progress: body.progress,
    note: body.note ?? null,
    difficulty: body.difficulty ?? null,
    understanding: body.understanding ?? null,
  }),
  updateableColumns,
});
