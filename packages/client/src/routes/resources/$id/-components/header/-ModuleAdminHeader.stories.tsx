import type { Meta, StoryObj } from "@storybook/react-vite";

import { ModuleAdminHeader } from "./-ModuleAdminHeader";

import { useModuleAdminUiState } from "@/hooks/useModuleAdminUiState";
import { useResourceModules } from "@/hooks/useResourceModules";
import {
  makeModule,
  seededModuleAdminClient,
} from "@/test-utils/resourceModulesFixtures";
import { queryStubDecorator } from "@/test-utils/storyDecorators";

const RESOURCE_ID = "resource-1";

// The header reads its progress summary + label config from the live controllers,
// so wire them via the real hooks against a seeded query client.
function Host({
  canEditExhaustive,
}: { canEditExhaustive?: boolean }) {
  const api = useResourceModules(RESOURCE_ID);
  const ui = useModuleAdminUiState();
  return (
    <ModuleAdminHeader
      resourceId={RESOURCE_ID}
      canEditExhaustive={canEditExhaustive}
      api={api}
      ui={ui}
    />
  );
}

const meta: Meta<typeof ModuleAdminHeader> = {
  component: ModuleAdminHeader,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Host />,
  decorators: [
    queryStubDecorator(
      () =>
        seededModuleAdminClient({
          modules: [
            makeModule({
              id: "m1",
              name: "Variables",
              status: "complete",
            }),
            makeModule({
              id: "m2",
              name: "Functions",
            }),
          ],
        }),
      {
        className: "max-w-2xl",
      },
    ),
  ],
};

// Edit-page context: the exhaustive flag drives the "used to calculate progress"
// callout and the `· N%` summary; `canEditExhaustive` adds the Details-tab hint.
export const ExhaustiveEditable: Story = {
  render: () => <Host canEditExhaustive />,
  decorators: [
    queryStubDecorator(
      () =>
        seededModuleAdminClient({
          modules: [
            makeModule({
              id: "m1",
              name: "Variables",
              status: "complete",
            }),
            makeModule({
              id: "m2",
              name: "Functions",
            }),
          ],
          modulesAreExhaustive: true,
        }),
      {
        className: "max-w-2xl",
      },
    ),
  ],
};
