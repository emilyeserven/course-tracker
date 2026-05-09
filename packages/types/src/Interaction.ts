export type InteractionProgress = "incomplete" | "started" | "complete";

export type InteractionDifficulty = "easy" | "medium" | "hard";

export type InteractionUnderstanding
  = | "none"
    | "basic"
    | "comfortable"
    | "proficient"
    | "mastered";

// A logged touch on a Resource, optionally narrowed to a module group or a
// single module. At most one of moduleGroupId / moduleId is set; both null
// = the interaction is at the whole-resource level.
export interface Interaction {
  id: string;
  resourceId: string;
  moduleGroupId?: string | null;
  moduleId?: string | null;
  date: string; // ISO yyyy-mm-dd
  progress: InteractionProgress;
  note?: string | null;
  difficulty?: InteractionDifficulty | null;
  understanding?: InteractionUnderstanding | null;
}
