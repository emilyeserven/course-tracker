// Central registry of TanStack Query keys. Keys are cache identifiers only —
// renaming one just causes a one-time refetch — but they must be consistent
// for invalidation to work, so always take them from here instead of inlining
// string arrays. The `resource` keys replace the legacy "courses"/"course"
// strings.
export const queryKeys = {
  resources: {
    list: () => ["resources"] as const,
    detail: (id: string) => ["resource", id] as const,
    modules: (resourceId: string) => ["resource-modules", resourceId] as const,
    moduleGroups: (resourceId: string) =>
      ["resource-module-groups", resourceId] as const,
    interactions: (resourceId: string) =>
      ["resource-interactions", resourceId] as const,
    routineInteractions: (resourceId: string) =>
      ["resource-routine-interactions", resourceId] as const,
    todoInteractions: (resourceId: string) =>
      ["resource-todo-interactions", resourceId] as const,
  },
  topics: {
    list: () => ["topics"] as const,
    detail: (id: string) => ["topic", id] as const,
  },
  tasks: {
    list: () => ["tasks"] as const,
    detail: (id: string) => ["task", id] as const,
  },
  routines: {
    list: () => ["routines"] as const,
    detail: (id: string) => ["routine", id] as const,
  },
  // The daily tracker's view of routines (/api/routines?projected=true).
  dailies: {
    list: () => ["dailies"] as const,
    detail: (id: string) => ["daily", id] as const,
  },
  providers: {
    list: () => ["providers"] as const,
    detail: (id: string) => ["provider", id] as const,
  },
  domains: {
    list: () => ["domains"] as const,
    detail: (id: string) => ["domain", id] as const,
    radar: (id: string) => ["radar", id] as const,
    explore: () => ["domains-explore"] as const,
  },
  tagGroups: {
    list: () => ["tagGroups"] as const,
  },
  taskTypes: {
    list: () => ["taskTypes"] as const,
  },
  modules: {
    list: () => ["modules-all"] as const,
  },
  moduleGroups: {
    list: () => ["module-groups-all"] as const,
  },
  routineTemplates: {
    list: () => ["routineTemplates"] as const,
  },
  dashboardLayouts: {
    list: () => ["dashboardLayouts"] as const,
  },
  dailyCriteriaTemplates: {
    list: () => ["dailyCriteriaTemplates"] as const,
  },
  settings: {
    detail: () => ["settings"] as const,
  },
  readwise: {
    readingList: () => ["readwise", "reading-list"] as const,
  },
  todoist: {
    tasks: () => ["todoist", "tasks"] as const,
  },
  googleCalendar: {
    events: () => ["googleCalendar", "events"] as const,
    feeds: () => ["googleCalendar", "feeds"] as const,
  },
};
