import * as z from "zod";

import { NAME_MAX_LENGTH } from "@/constants/stringLimits";

/** Submit-time validator for the task edit form. */
export const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(NAME_MAX_LENGTH),
  description: z.string().max(2000),
  topicId: z.string(),
  taskTypeId: z.string(),
  tagIds: z.array(z.string()),
});
