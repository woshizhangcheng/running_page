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

const MonthlyGoalCard = () => {
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

  const monthlyDistance = monthlyRuns.reduce((sum, run) => sum + run.distance, 0);
  const monthlyDuration = monthlyRuns.reduce((sum, run) => sum + convertMovingTime2Sec(run.moving_time || ''), 0);

  const monthlyGoal = 150000;
  const percentage = Math.min((monthlyDistance / monthlyGoal) * 100, 100);

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
    <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between h-full">
      <div>
        <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">月度跑量</div>
        <div className="text-2xl font-bold text-white mb-2">
          {formatDistance(monthlyDistance)}<span className="text-sm font-normal text-zinc-500 ml-1">/ {formatDistance(monthlyGoal)} km</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-[#E31937] to-red-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-sm text-zinc-400">
          <span>{monthlyRuns.length} runs</span>
          <span>{formatDuration(monthlyDuration)}</span>
        </div>
        <div className={`text-xs flex items-center gap-1 ${lastYearDiff >= 0 ? 'text-zinc-500' : 'text-red-400'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            {lastYearDiff >= 0 ? (
              <>
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                <polyline points="16 17 22 17 22 11"></polyline>
              </>
            ) : (
              <>
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </>
            )}
          </svg>
          <span>{lastYearDiff >= 0 ? '+' : ''}{formatDistance(lastYearDiff)} km vs last year</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyGoalCard;
