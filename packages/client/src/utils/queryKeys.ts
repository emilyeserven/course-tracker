// Central registry of TanStack Query keys. Keys are cache identifiers only —
// renaming one just causes a one-time refetch — but they must be consistent
// for invalidation to work, so always take them from here instead of inlining
// string arrays.
export const queryKeys = {
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
  tagGroups: {
    list: () => ["tagGroups"] as const,
  },
  taskTypes: {
    list: () => ["taskTypes"] as const,
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
  bookmarks: {
    search: (query: string) => ["bookmarks", "search", query] as const,
    sections: (bookmarkId: string) =>
      ["bookmarks", "sections", bookmarkId] as const,
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
