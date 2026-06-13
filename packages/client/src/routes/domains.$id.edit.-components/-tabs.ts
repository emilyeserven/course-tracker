// Barrel for the domain edit tab components so the editor imports its tabs from
// one module instead of five. The tab files import their own dependencies
// directly (never this index), so this re-export introduces no cycle.
export { BlipsTabContainer } from "./-BlipsTab";
export { ConfigTab } from "./-ConfigTab";
export { DetailsTab } from "./-DetailsTab";
export { LlmTabContainer } from "./-LlmTab";
export { ScopeTab } from "./-ScopeTab";
