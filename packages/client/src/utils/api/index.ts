/* eslint-disable import/max-dependencies -- barrel re-exporting every domain client */
// Typed API clients, split by domain. Each entity gets a createEntityClient
// instance plus named function re-exports; see ./client for the base helpers.
export * from "./admin";
export * from "./client";
export * from "./dailies";
export * from "./dashboardLayouts";
export * from "./domains";
export * from "./interactions";
export * from "./modules";
export * from "./providers";
export * from "./radar";
export * from "./readwise";
export * from "./resources";
export * from "./routines";
export * from "./settings";
export * from "./tags";
export * from "./tasks";
export * from "./templates";
export * from "./topics";
