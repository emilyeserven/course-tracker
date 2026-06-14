import * as z from "zod";

import { NAME_MAX_LENGTH, TEXT_MAX_LENGTH } from "@/constants/stringLimits";

/** Submit-time validator for the topic edit form. */
export const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(NAME_MAX_LENGTH),
  description: z.string().max(TEXT_MAX_LENGTH),
  reason: z.string().max(TEXT_MAX_LENGTH),
  domainIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  resourceLinks: z.array(
    z.object({
      key: z.string(),
      resourceId: z.string(),
      moduleGroupId: z.string().nullable(),
      moduleId: z.string().nullable(),
    }),
  ),
});
