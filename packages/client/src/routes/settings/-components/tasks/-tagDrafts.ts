// Draft shapes and factories shared by the tag-group edit rows and the
// -useTagGroupsAdmin hook. Kept type-only + pure so the row components can import
// the draft types without creating a runtime cycle with their parent.

export const NEW_GROUP_ID = "__new_group__";
export const NEW_TAG_ID = "__new_tag__";

export interface TagGroupDraft {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface TagDraft {
  id: string;
  groupId: string;
  name: string;
  color: string;
}

export function makeEmptyGroupDraft(): TagGroupDraft {
  return {
    id: NEW_GROUP_ID,
    name: "",
    description: "",
    color: "",
  };
}

export function makeEmptyTagDraft(groupId: string): TagDraft {
  return {
    id: NEW_TAG_ID,
    groupId,
    name: "",
    color: "",
  };
}
