import type { DashboardTileProps } from "@/lib/dashboardTiles";

import { Link } from "@tanstack/react-router";

import { CardSettingsFlyout } from "./-DashboardCardSettings";

import {
  DashboardCard,
  DashboardSectionStatus,
} from "@/components/contentBoxComponents/DashboardCard";
import { isAutoHeight } from "@/lib/dashboardTiles";
import { cn } from "@/lib/utils";

/**
 * Link to the connections tab of Settings, shared by the integration tiles for
 * both the flyout "manage" link and the not-configured prompt. Pass `className`
 * to extend the base styling (e.g. `text-sm` in the flyout header).
 */
export function SettingsLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to="/settings"
      search={{
        tab: "connections",
      }}
      className={cn(`
        text-primary underline-offset-2
        hover:underline
      `, className)}
    >
      {children}
    </Link>
  );
}

interface DashboardIntegrationCardProps extends DashboardTileProps {
  title: React.ReactNode;
  /** Optional header button (e.g. "Open Reader"); omitted by Calendar. */
  action?: React.ReactNode;
  /** Extra controls rendered in the settings flyout above the link. */
  settingsExtra?: React.ReactNode;
  /** Per-card "Manage…/Set … API key" link shown in the settings flyout. */
  settingsLink: React.ReactNode;
  configured: boolean;
  isPending: boolean;
  error: unknown;
  /** Shown when loaded, error-free, and not yet configured. */
  connectPrompt: React.ReactNode;
  /**
   * Optional status row rendered before `children` in the configured branch.
   * Omitted by cards (e.g. Readwise) that render their own per-section status
   * inside `children`.
   */
  isEmpty?: boolean;
  entity?: string;
  emptyMessage?: string;
  children: React.ReactNode;
}

/**
 * Shared shell for the dashboard integration tiles (Calendar/Readwise/Todoist):
 * the `DashboardCard` chrome, settings flyout, and the not-configured prompt vs.
 * configured-content switch. Each tile supplies only its copy, links, and data
 * rendering.
 */
export function DashboardIntegrationCard({
  tile,
  onUpdateTile,
  title,
  action,
  settingsExtra,
  settingsLink,
  configured,
  isPending,
  error,
  connectPrompt,
  isEmpty,
  entity,
  emptyMessage,
  children,
}: DashboardIntegrationCardProps) {
  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title={title}
      action={action}
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        >
          {settingsExtra}
          {settingsLink}
        </CardSettingsFlyout>
      )}
    >
      {!isPending && !error && !configured
        ? connectPrompt
        : (
          <>
            {entity && (
              <DashboardSectionStatus
                isPending={isPending}
                error={error}
                isEmpty={isEmpty}
                entity={entity}
                emptyMessage={emptyMessage ?? ""}
              />
            )}
            {children}
          </>
        )}
    </DashboardCard>
  );
}
