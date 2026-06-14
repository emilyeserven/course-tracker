// One import surface for everything the /dashboard route renders: its
// route-private pieces plus the shared dialogs/chrome it composes. Members
// import their own dependencies directly (never this index), so this re-export
// barrel introduces no cycle.
export {
  AddLayoutDialog,
  DashboardGrid,
  LayoutTab,
  VisibleTilesDialog,
} from "./layout";
export {
  buildDefaultTiles,
  needsNormalization,
  normalizeTiles,
  tilesEqual,
  toggleTile,
} from "@/lib/dashboardTiles";
export { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
export { LayoutNameDialog } from "@/components/dialogs/LayoutNameDialog";
export { PageHeader } from "@/components/layout/PageHeader";
export { Button } from "@/components/ui/button";
export { Tabs, TabsList } from "@/components/ui/tabs";
