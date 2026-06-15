import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, screen, userEvent, within } from "storybook/test";

import { ModuleAdminMoreMenu } from "./-ModuleAdminMoreMenu";

import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
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

// Seed the module-admin queries plus a saved hint template, so opening "Hints"
// shows a populated picker.
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
        ],
      }),
    ],
  ]);
}

// The menu reads its label config and dispatches into the shared ui state, so
// wire both via the real hooks against the seeded client.
function Host() {
  const api = useResourceModules(RESOURCE_ID);
  const ui = useModuleAdminUiState();
  return (
    <ModuleAdminMoreMenu
      api={api}
      ui={ui}
    />
  );
}

const meta: Meta<typeof ModuleAdminMoreMenu> = {
  component: ModuleAdminMoreMenu,
  render: () => <Host />,
  decorators: [queryStubDecorator(() => seededClientWithTemplates())],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Open the menu and confirm the three overflow actions are listed (menu content
// portals to the body).
export const Default: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "More",
    }));
    await expect(await screen.findByText("Hints")).toBeInTheDocument();
    await expect(screen.getByText("LLM Assist")).toBeInTheDocument();
    await expect(screen.getByText("Bulk Add Groups")).toBeInTheDocument();
  },
};

// Selecting "Hints" closes the menu and opens the hint-template dialog.
export const OpensHintsDialog: Story = {
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "More",
    }));
    await userEvent.click(await screen.findByText("Hints"));
    await expect(
      await screen.findByRole("button", {
        name: "Save",
      }),
    ).toBeInTheDocument();
  },
};
