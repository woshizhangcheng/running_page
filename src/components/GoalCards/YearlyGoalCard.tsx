import useActivities from '@/hooks/useActivities';
import {
  filterYearRuns,
  M_TO_DIST,
  sortDateFunc,
  filterAndSortRuns,
  convertMovingTime2Sec,
} from '@/utils/utils';
import { useMemo } from 'react';

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

const YearlyGoalCard = () => {
  const { activities, thisYear } = useActivities();
  const currentYearStr = thisYear;

  const yearlyRuns = useMemo(
    () => filterAndSortRuns(activities, currentYearStr, filterYearRuns, sortDateFunc),
    [activities, currentYearStr]
  );

  const yearlyDistance = yearlyRuns.reduce((sum, run) => sum + run.distance, 0);
  const yearlyDuration = yearlyRuns.reduce((sum, run) => sum + convertMovingTime2Sec(run.moving_time || ''), 0);

  const yearlyGoal = 2000000;
  const percentage = Math.min((yearlyDistance / yearlyGoal) * 100, 100);

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between h-full">
      <div>
        <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">年度跑量</div>
        <div className="text-2xl font-bold text-white mb-2">
          {formatDistance(yearlyDistance)}<span className="text-sm font-normal text-zinc-500 ml-1">/ {formatDistance(yearlyGoal)} km</span>
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
          <span>{yearlyRuns.length} runs</span>
          <span>{formatDuration(yearlyDuration)}</span>
        </div>
      </div>
    </div>
  );
};

export default YearlyGoalCard;
