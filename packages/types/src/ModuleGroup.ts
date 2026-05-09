import type { Module } from "./Module";

export interface ModuleGroup {
  id: string;
  resourceId: string;
  name: string;
  description?: string | null;
  url?: string | null;
  position?: number | null;
  modules?: Module[];
}
