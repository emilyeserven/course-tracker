// Barrel for the resource-edit route's private components so the route imports
// them from one module. These components don't import this index, so there is
// no cycle. The `.-components/` folder is excluded from route generation, so
// this index.ts produces no route.
export { DetailsTab } from "./form";
