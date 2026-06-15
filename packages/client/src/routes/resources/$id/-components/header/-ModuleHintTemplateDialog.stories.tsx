import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";

import { ModuleHintTemplateDialog } from "./-ModuleHintTemplateDialog";

import { useResourceModules } from "@/hooks/useResourceModules";
import {
  makeModuleAdminResource,
  makeTagGroups,
} from "@/test-utils/resourceModulesFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { makeAppSettings } from "@/test-utils/settingsFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";
import { queryKeys } from "@/utils/queryKeys";

const RESOURCE_ID = "resource-1";

// Seed the module-admin queries plus a couple of saved hint templates, so the
// dialog's Select renders real options.
function seededClientWithTemplates() {
  return seededQueryClient([
    [queryKeys.resources.moduleGroups(RESOURCE_ID), []],
    [queryKeys.resources.modules(RESOURCE_ID), []],
    [queryKeys.tagGroups.list(), makeTagGroups()],
    [queryKeys.resources.detail(RESOURCE_ID), makeModuleAdminResource()],
    [
      queryKeys.settings.detail(),
      makeAppSettings({
        moduleHintTemplates: [
          {
            id: "ht-1",
            name: "Video Course",
            groupHint: "Section 1: Fundamentals",
            moduleHint: "Variables and types",
          },
          {
            id: "ht-2",
            name: "Book",
            groupHint: "Part I",
            moduleHint: "Chapter 1",
          },
        ],
      }),
    ],
  ]);
}

// The dialog is controlled by its parent's open state; render it open so the
// story shows the template picker form.
function Host() {
  const api = useResourceModules(RESOURCE_ID);
  const [open, setOpen] = useState(true);
  return (
    <ModuleHintTemplateDialog
      api={api}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

const meta: Meta<typeof ModuleHintTemplateDialog> = {
  component: ModuleHintTemplateDialog,
  render: () => <Host />,
  decorators: [queryStubDecorator(() => seededClientWithTemplates())],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Open dialog showing the hint-template picker.
export const Default: Story = {};
