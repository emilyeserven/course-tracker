import type { DashboardTileProps } from "./-dashboardTileMeta";

import { Link } from "@tanstack/react-router";

import {
  CardSettingsFlyout,
  DashboardCard,
  DashboardSectionStatus,
  isAutoHeight,
} from "./-cardKit";
import { DashboardDailiesBody } from "./-DashboardDailiesBody";
import { useDashboardDailies } from "./-useDashboardDailies";

import {
  DailiesViewModeToggle,
  TooManyDailiesWarning,
} from "@/components/dailies";

export function DashboardDoNow({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const data = useDashboardDailies();
  const {
    isPending, error, hasData, activeCount, mode, setMode, maxActiveDailies,
  } = data;
  const doNow = data.bucket("now");

  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title={(
        <span className="inline-flex items-center gap-2">
          Do Now
          <TooManyDailiesWarning
            activeCount={activeCount}
            limit={maxActiveDailies}
            size="sm"
          />
        </span>
      )}
      action={(
        <>
          <DailiesViewModeToggle
            mode={mode}
            onChange={setMode}
          />
          <Link
            to="/routines/tracker"
            className="
              text-sm text-primary underline-offset-2
              hover:underline
            "
          >
            View all
          </Link>
        </>
      )}
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        />
      )}
    >
      <DashboardSectionStatus
        isPending={isPending}
        error={error}
        isEmpty={hasData && doNow.length === 0}
        entity="dailies"
        emptyMessage="Nothing to do right now."
      />
      <DashboardDailiesBody
        list={doNow}
        data={data}
      />
    </DashboardCard>
  );
}

export function DashboardDoneForDay({
  tile,
  onUpdateTile,
}: DashboardTileProps) {
  const data = useDashboardDailies();
  const {
    hasData,
  } = data;
  const doneForDay = data.bucket("done");

  return (
    <DashboardCard
      autoHeight={isAutoHeight(tile)}
      title="Done for the Day"
      settings={(
        <CardSettingsFlyout
          tile={tile}
          onUpdateTile={onUpdateTile}
        />
      )}
    >
      <DashboardSectionStatus
        isEmpty={hasData && doneForDay.length === 0}
        entity="dailies"
        emptyMessage="Nothing done yet today."
      />
      <DashboardDailiesBody
        list={doneForDay}
        data={data}
      />
    </DashboardCard>
  );
}
