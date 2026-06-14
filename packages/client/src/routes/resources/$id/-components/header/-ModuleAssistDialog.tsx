import type { ModuleAdminSectionProps } from "../-moduleAdminSectionProps";
import type { Resource } from "@emstack/types";

import { ModuleSuggestDialog } from "@/components/resources/moduleAdminComponents";

type ModuleAssistDialogProps = ModuleAdminSectionProps;

/** Resource detail fields the suggest dialog needs, with safe fallbacks. */
function deriveResourceContext(resource: Resource | undefined) {
  if (!resource) {
    return {
      resourceName: "this resource",
      resourceDescription: null,
      resourceUrl: null,
      providerName: null,
      topicNames: [] as string[],
    };
  }
  return {
    resourceName: resource.name,
    resourceDescription: resource.description ?? null,
    resourceUrl: resource.url ?? null,
    providerName: resource.provider?.name ?? null,
    topicNames: (resource.topics ?? []).map(t => t.name),
  };
}

/**
 * The LLM-assist dialog, fed from the resource detail query and the current
 * group/module names. Kept separate from the toolbar so the resource-field
 * coalescing stays out of the header's render path.
 */
export function ModuleAssistDialog({
  resourceId,
  api,
  ui,
}: ModuleAssistDialogProps) {
  const {
    resourceQuery, groups, ungroupedModules, invalidateAll,
  } = api;
  const {
    llmAssistOpen, setLlmAssistOpen,
  } = ui;

  const context = deriveResourceContext(resourceQuery.data);

  return (
    <ModuleSuggestDialog
      open={llmAssistOpen}
      onOpenChange={setLlmAssistOpen}
      resourceId={resourceId}
      resourceName={context.resourceName}
      resourceDescription={context.resourceDescription}
      resourceUrl={context.resourceUrl}
      providerName={context.providerName}
      topicNames={context.topicNames}
      existingGroupNames={groups.map(g => g.name)}
      existingUngroupedModuleNames={ungroupedModules.map(m => m.name)}
      onApplied={() => invalidateAll()}
    />
  );
}
