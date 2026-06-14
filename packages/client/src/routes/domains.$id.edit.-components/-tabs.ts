// Barrel for the domain edit tab components so the editor imports its tabs from
// one module instead of five. Each tab now lives in its own themed subfolder
// (details/, scope/, config/, blips/, llm/) with its own index.ts; this
// re-export aggregates their public surface for -ExistingDomainEditor.
export { BlipsTabContainer } from "./blips";
export { ConfigTab } from "./config";
export { DetailsTab } from "./details";
export { LlmTabContainer } from "./llm";
export { ScopeTab } from "./scope";
