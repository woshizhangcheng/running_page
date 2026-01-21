import useActivities from '@/hooks/useActivities';
import { M_TO_DIST, convertMovingTime2Sec } from '@/utils/utils';

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

const RunnerStat = () => {
  const { activities } = useActivities();

  const totalDistance = activities.reduce((sum, run) => sum + run.distance, 0);
  const totalRuns = activities.length;
  const totalDuration = activities.reduce((sum, run) => sum + convertMovingTime2Sec(run.moving_time || ''), 0);

  return (
    <a href="/summary" className="block h-full">
      <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between cursor-pointer hover:border-[#E31937] transition-colors group relative overflow-hidden h-full">
        <div>
          <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1 group-hover:text-white transition-colors">总跑量</div>
          <div className="text-2xl font-bold text-white">
            {formatDistance(totalDistance)} <span className="text-sm font-normal text-zinc-500">km</span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#E31937]">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>{totalRuns} runs</span>
          </div>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#E31937]">
              <line x1="10" x2="14" y1="2" y2="2"></line>
              <line x1="12" x2="15" y1="14" y2="11"></line>
              <circle cx="12" cy="14" r="8"></circle>
            </svg>
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>

        {/* Hover 提示 */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
          <span className="text-white font-bold text-sm tracking-wider uppercase border-b border-[#E31937] pb-1">点击打开轨迹墙</span>
        </div>
      </div>
    </a>
  );
};

export default RunnerStat;
