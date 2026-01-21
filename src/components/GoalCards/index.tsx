import useActivities from '@/hooks/useActivities';
import {
  filterYearRuns,
  filterMonthRuns,
  M_TO_DIST,
  sortDateFunc,
  filterAndSortRuns,
  convertMovingTime2Sec,
} from '@/utils/utils';
import { useMemo, useState } from 'react';

const formatDistance = (meters: number): string => {
  return (meters / M_TO_DIST).toFixed(2);
};

const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds) || seconds <= 0) {
    return '0h 0m';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const GOAL_CARD = ({
  title,
  current,
  goal,
  runsCount,
  duration,
  lastYearDiff,
}: {
  title: string;
  current: number;
  goal: number;
  runsCount: number;
  duration: string;
  lastYearDiff?: number;
}) => {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-brand">{title}</h3>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Distance</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-brand">
              {formatDistance(current)}/{formatDistance(goal)} km
            </span>
          </div>
          <div className="w-full bg-neutral-300 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-neutral-900 dark:bg-brand h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Runs</p>
            <p className="font-semibold text-neutral-900 dark:text-brand">{runsCount}</p>
          </div>
          <div>
            <p className="text-neutral-600 dark:text-neutral-400">Time</p>
            <p className="font-semibold text-neutral-900 dark:text-brand">{duration}</p>
          </div>
          {lastYearDiff !== undefined && (
            <div>
              <p className="text-neutral-600 dark:text-neutral-400">vs last year</p>
              <p className={`font-semibold ${lastYearDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {lastYearDiff >= 0 ? '+' : ''}{formatDistance(lastYearDiff)} km
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GoalCards = () => {
  const { activities, thisYear } = useActivities();
  const [currentMonth] = useState(new Date().getMonth());

  const currentYearStr = thisYear;

  const yearlyRuns = useMemo(
    () => filterAndSortRuns(activities, currentYearStr, filterYearRuns, sortDateFunc),
    [activities, currentYearStr]
  );

  const monthlyRuns = useMemo(
    () => filterMonthRuns(yearlyRuns, currentMonth),
    [yearlyRuns, currentMonth]
  );

  const yearlyDistance = yearlyRuns.reduce((sum, run) => sum + run.distance, 0);
  const yearlyDuration = yearlyRuns.reduce((sum, run) => sum + convertMovingTime2Sec(run.moving_time || ''), 0);

  const monthlyDistance = monthlyRuns.reduce((sum, run) => sum + run.distance, 0);
  const monthlyDuration = monthlyRuns.reduce((sum, run) => sum + convertMovingTime2Sec(run.moving_time || ''), 0);

  const yearlyGoal = 2000;
  const monthlyGoal = 200;

  // Calculate last year's same month distance
  const lastYearStr = String(parseInt(currentYearStr) - 1);
  const lastYearRuns = useMemo(
    () => filterAndSortRuns(activities, lastYearStr, filterYearRuns, sortDateFunc),
    [activities, lastYearStr]
  );
  const lastYearMonthRuns = useMemo(
    () => filterMonthRuns(lastYearRuns, currentMonth),
    [lastYearRuns, currentMonth]
  );
  const lastYearMonthDistance = lastYearMonthRuns.reduce((sum, run) => sum + run.distance, 0);
  const lastYearDiff = monthlyDistance - lastYearMonthDistance;

  return (
    <div className="space-y-4">
      <GOAL_CARD
        title="Yearly Goal"
        current={yearlyDistance}
        goal={yearlyGoal}
        runsCount={yearlyRuns.length}
        duration={formatDuration(yearlyDuration)}
      />

      <GOAL_CARD
        title={`Monthly Goal (${new Date().toLocaleString('default', { month: 'short' })})`}
        current={monthlyDistance}
        goal={monthlyGoal}
        runsCount={monthlyRuns.length}
        duration={formatDuration(monthlyDuration)}
        lastYearDiff={lastYearDiff}
      />
    </div>
  );
};

export default GoalCards;
