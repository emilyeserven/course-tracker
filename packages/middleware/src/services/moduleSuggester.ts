import Anthropic from "@anthropic-ai/sdk";

export interface ResourceContext {
  name: string;
  description?: string | null;
  url?: string | null;
  providerName?: string | null;
  topicNames?: string[];
  existingGroupNames?: string[];
  existingUngroupedModuleNames?: string[];
}

export interface SuggestedModule {
  name: string;
  description: string | null;
  url: string | null;
  length: string | null;
}

export interface SuggestedModuleGroup {
  name: string;
  description: string | null;
  url: string | null;
  modules: SuggestedModule[];
}

export interface ModuleSuggestion {
  moduleGroups: SuggestedModuleGroup[];
  ungroupedModules: SuggestedModule[];
  notes: string | null;
}

const SYSTEM_PROMPT = `You are an expert curriculum designer helping a learner organize an online course or learning resource into a structured outline of module groups and modules so they can track their progress.

You will receive metadata about a learning resource (name, description, URL, provider, topics) along with optional notes from the user. Your job is to propose a plausible breakdown of the resource into:
- "moduleGroups": top-level sections, chapters, or units, each containing an ordered list of "modules"
- "ungroupedModules": standalone modules that don't fit a group (use sparingly — most resources benefit from grouping)

Guidelines:
- Match the structure to the resource type. A book has chapters; a video course has sections and lessons; a documentation site has guides.
- If the resource is well-known (e.g. a famous book, a popular course), use the actual outline you know about. If you're not confident, propose a reasonable generic outline based on the topic and acknowledge that in the "notes" field.
- Use concise, descriptive names. Keep descriptions short (one sentence at most), and only include them when they add useful context — leave description as null otherwise.
- For module "length", you may use either an integer string of minutes ("30") or one of the duration buckets: "extra_short" (<5m), "short" (5–15m), "medium" (15–30m), "long" (30m–1h), "extra_long" (1h+). Use null if you genuinely don't know.
- Leave URLs as null unless you're confident the URL is correct and stable.
- Avoid duplicating module groups or modules the user already has — they will be listed in the user prompt.
- Aim for 3–8 module groups with 3–10 modules each for a typical course. For very long resources, you may go higher; for short ones, fewer groups (or all ungrouped) is fine.
- If the resource info is too sparse to make a confident suggestion, return a minimal best-effort outline and explain in "notes".

Always call the "submit_module_outline" tool to return your suggestion. Do not respond with prose.`;

const TOOL_INPUT_SCHEMA: Anthropic.Tool.InputSchema = {
  type: "object",
  properties: {
    moduleGroups: {
      type: "array",
      description: "Top-level sections / chapters / units, each containing an ordered list of modules.",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          description: {
            type: ["string", "null"],
          },
          url: {
            type: ["string", "null"],
          },
          modules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                description: {
                  type: ["string", "null"],
                },
                url: {
                  type: ["string", "null"],
                },
                length: {
                  type: ["string", "null"],
                  description: "Either an integer string of minutes (\"30\") or one of: extra_short, short, medium, long, extra_long. Null if unknown.",
                },
              },
              required: ["name", "description", "url", "length"],
            },
          },
        },
        required: ["name", "description", "url", "modules"],
      },
    },
    ungroupedModules: {
      type: "array",
      description: "Standalone modules that don't fit any group. Prefer grouping when possible.",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          description: {
            type: ["string", "null"],
          },
          url: {
            type: ["string", "null"],
          },
          length: {
            type: ["string", "null"],
          },
        },
        required: ["name", "description", "url", "length"],
      },
    },
    notes: {
      type: ["string", "null"],
      description: "Brief notes for the user — e.g. when the outline is best-effort because the resource is unfamiliar. Null when no caveat applies.",
    },
  },
  required: ["moduleGroups", "ungroupedModules", "notes"],
};

function buildUserPrompt(
  resource: ResourceContext,
  userNotes: string | null,
): string {
  const parts: string[] = [];
  parts.push(`Resource name: ${resource.name}`);
  if (resource.description) {
    parts.push(`Description: ${resource.description}`);
  }
  if (resource.url) {
    parts.push(`URL: ${resource.url}`);
  }
  if (resource.providerName) {
    parts.push(`Provider: ${resource.providerName}`);
  }
  if (resource.topicNames && resource.topicNames.length > 0) {
    parts.push(`Topics: ${resource.topicNames.join(", ")}`);
  }
  if (
    resource.existingGroupNames
    && resource.existingGroupNames.length > 0
  ) {
    parts.push(
      `Existing module groups (do not duplicate): ${resource.existingGroupNames.join(", ")}`,
    );
  }
  if (
    resource.existingUngroupedModuleNames
    && resource.existingUngroupedModuleNames.length > 0
  ) {
    parts.push(
      `Existing ungrouped modules (do not duplicate): ${resource.existingUngroupedModuleNames.join(", ")}`,
    );
  }
  if (userNotes && userNotes.trim().length > 0) {
    parts.push("");
    parts.push("Additional notes from the user:");
    parts.push(userNotes.trim());
  }
  parts.push("");
  parts.push(
    "Propose a structured outline of module groups and modules for this resource via the submit_module_outline tool.",
  );
  return parts.join("\n");
}

export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not configured");
    this.name = "MissingApiKeyError";
  }
}

export async function suggestModulesForResource(
  resource: ResourceContext,
  userNotes: string | null,
  apiKey: string | undefined,
): Promise<ModuleSuggestion> {
  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const client = new Anthropic({
    apiKey,
  });

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: {
          type: "ephemeral",
        },
      },
    ],
    tools: [
      {
        name: "submit_module_outline",
        description:
          "Submit the proposed module group / module outline for the resource.",
        input_schema: TOOL_INPUT_SCHEMA,
      },
    ],
    tool_choice: {
      type: "tool",
      name: "submit_module_outline",
    },
    messages: [
      {
        role: "user",
        content: buildUserPrompt(resource, userNotes),
      },
    ],
  });

  const toolBlock = response.content.find(b => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use block");
  }

  return toolBlock.input as ModuleSuggestion;
}
