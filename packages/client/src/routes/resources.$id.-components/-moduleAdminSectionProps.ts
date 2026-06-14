import type { ModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import type { ResourceModulesController } from "@/hooks/useResourceModules";

/**
 * Context shared by every module-admin section: the resource being edited plus
 * the controller/ui-state pair the sections render from and dispatch into.
 * The header, group/ungrouped sections, list item, and assist dialog all extend
 * this so the threaded-through props stay in lockstep.
 */
export interface ModuleAdminSectionProps {
  resourceId: string;
  api: ResourceModulesController;
  ui: ModuleAdminUiState;
}
