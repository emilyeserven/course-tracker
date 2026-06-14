import type { DashboardTileProps } from "@/lib/dashboardTiles";
import type { DashboardTileId } from "@emstack/types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { QueryKey } from "@tanstack/react-query";
import type { ComponentType } from "react";

import { fn } from "storybook/test";

import { makeTile } from "@/test-utils/dashboardFixtures";
import { seededQueryClient } from "@/test-utils/seededQueryClient";
import { queryStoryDecorator } from "@/test-utils/storyDecorators";
import { smokeText } from "@/test-utils/storyPlay";

/** A dashboard integration tile renders the shared `DashboardTileProps` card. */
type IntegrationTile = ComponentType<DashboardTileProps>;

interface IntegrationTileStoriesConfig {
  /** The integration tile component under story. */
  component: IntegrationTile;
  /** Tile id passed to `makeTile` for the story args. */
  tileId: DashboardTileId;
  /** Query key the tile reads — seeded with `{ configured, ...emptyData }`. */
  queryKey: QueryKey;
  /** Empty collections the tile reads besides `configured` (e.g. `{ events: [] }`). */
  emptyData?: Record<string, unknown>;
  /** Copy asserted by the not-configured connect prompt. */
  connectText: string | RegExp;
  /** Copy asserted by the configured-but-empty state. */
  emptyText: string | RegExp;
}

interface IntegrationTileStories {
  meta: Meta<IntegrationTile>;
  ConnectPrompt: StoryObj<IntegrationTile>;
  ConfiguredEmpty: StoryObj<IntegrationTile>;
}

/**
 * Builds the shared Storybook shell for a dashboard integration tile. The three
 * integration tiles (Google Calendar, Readwise, Todoist) all render the same
 * not-configured `ConnectPrompt` and configured-but-empty `ConfiguredEmpty` pair
 * off a single seeded query — only the component, tile id, query key/shape, and
 * smoke-text copy differ. This returns their identical `meta` + `ConnectPrompt` +
 * `ConfiguredEmpty` stories so each `*.stories.tsx` only declares those specifics.
 * Built on the shared `seededQueryClient` / `queryStoryDecorator` / `smokeText`
 * fixtures (see #410) rather than re-inventing the seeded QueryClient.
 *
 * Spread the returned `meta` into the file's default export
 * (`export default { ...stories.meta }`) so the Storybook CSF indexer still sees
 * a literal object, and re-export `ConnectPrompt` / `ConfiguredEmpty` directly.
 */
export function integrationTileStories({
  component,
  tileId,
  queryKey,
  emptyData = {},
  connectText,
  emptyText,
}: IntegrationTileStoriesConfig): IntegrationTileStories {
  const clientWith = (configured: boolean) =>
    seededQueryClient([[queryKey, {
      configured,
      ...emptyData,
    }]]);

  return {
    meta: {
      component,
      args: {
        tile: makeTile(tileId),
        onUpdateTile: fn(),
      },
      decorators: [queryStoryDecorator(clientWith(false))],
    },
    // Not configured: the card prompts the user to connect the integration.
    ConnectPrompt: {
      play: smokeText(connectText),
    },
    // Configured but with no data shows the empty state.
    ConfiguredEmpty: {
      decorators: [queryStoryDecorator(clientWith(true))],
      play: smokeText(emptyText),
    },
  };
}
