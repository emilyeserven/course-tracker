import type { Tag, TagGroup } from "@emstack/types";

import { createEntityClient } from "./client";

export const tagGroupsApi = createEntityClient<TagGroup>(
  "tag-groups",
  "tag group",
);
export const tagsApi = createEntityClient<Tag>("tags", "tag");

export const fetchTagGroups = tagGroupsApi.list;
export const upsertTagGroup = tagGroupsApi.upsert;
export const createTagGroup = tagGroupsApi.create;
export const deleteSingleTagGroup = tagGroupsApi.delete;

export const fetchTags = tagsApi.list;
export const upsertTag = tagsApi.upsert;
export const createTag = tagsApi.create;
export const deleteSingleTag = tagsApi.delete;
