// Barrel for the routine-edit route's private tab/form components so the route
// imports them from one module. These components don't import this index, so
// there is no cycle. The `.-components/` folder is excluded from route
// generation, so this index.ts produces no route.
export { CriteriaTab } from "./-CriteriaTab";
export { DetailsTab } from "./-DetailsTab";
export { EntriesTab } from "./-EntriesTab";
export { NewRoutineForm } from "./-NewRoutineForm";
