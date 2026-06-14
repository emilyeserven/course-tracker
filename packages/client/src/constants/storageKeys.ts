/** App-wide `localStorage` keys, in one place so they can't silently collide. */
export const STORAGE_KEYS = {
  settings: "emstack-settings",
  theme: "vite-ui-theme",
  dashboardLayoutId: "emstack-dashboard-layout-id",
  exploreRing: "emstack-explore-ring",
} as const;
