import React, { useMemo } from 'react';
import { Activity } from '@/utils/utils';
import { DIST_UNIT, M_TO_DIST } from '@/utils/utils';

interface TrackWallSidebarProps {
  activities: Activity[];
  selectedYear: string | null;
  onYearSelect: (year: string | null) => void;
}

interface YearStats {
  year: string;
  count: number;
  totalDistance: number;
  totalTime: number;
  avgPace: string;
  avgHeartRate?: number;
}

const TrackWallSidebar: React.FC<TrackWallSidebarProps> = ({
  activities,
  selectedYear,
  onYearSelect,
}) => {
  // 计算总统计数据
  const totalStats = useMemo(() => {
    let totalDistance = 0;
    let totalTime = 0;
    let count = 0;
    let totalHeartRate = 0;
    let heartRateCount = 0;

    activities.forEach((activity) => {
      totalDistance += activity.distance / M_TO_DIST;
      const [hours, minutes, seconds] = activity.moving_time.split(':').map(Number);
      totalTime += hours * 3600 + minutes * 60 + seconds;
      count += 1;

      if (activity.average_heartrate) {
        totalHeartRate += activity.average_heartrate;
        heartRateCount += 1;
      }
    });

    // 计算平均配速 (min/km)
    const avgSpeed = totalTime > 0 ? (totalDistance / (totalTime / 3600)) : 0;
    const avgPace = avgSpeed > 0 ? (60 / avgSpeed).toFixed(2) : '0.00';

    // 格式化时间
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);

    return {
      totalDistance: totalDistance.toFixed(2),
      totalTime: `${hours}h ${minutes}m`,
      count,
      avgPace,
      avgHeartRate:
        heartRateCount > 0 ? (totalHeartRate / heartRateCount).toFixed(0) : null,
    };
  }, [activities]);

  // 按年份分组统计
  const yearStatsList = useMemo(() => {
    const yearMap = new Map<string, YearStats>();

    activities.forEach((activity) => {
      const year = activity.start_date_local.slice(0, 4);

      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year,
          count: 0,
          totalDistance: 0,
          totalTime: 0,
          avgPace: '0.00',
          avgHeartRate: undefined,
        });
      }

      const stats = yearMap.get(year)!;
      stats.count += 1;
      stats.totalDistance += activity.distance / M_TO_DIST;

      const [hours, minutes, seconds] = activity.moving_time.split(':').map(Number);
      const secondsTotal = hours * 3600 + minutes * 60 + seconds;
      stats.totalTime += secondsTotal;

      if (activity.average_heartrate) {
        if (!stats.avgHeartRate) stats.avgHeartRate = 0;
        stats.avgHeartRate += activity.average_heartrate;
      }
    });

    // 转换为数组并计算平均值
    const result = Array.from(yearMap.values())
      .map((stats) => {
        const avgSpeed =
          stats.totalTime > 0
            ? stats.totalDistance / (stats.totalTime / 3600)
            : 0;
        stats.avgPace = avgSpeed > 0 ? (60 / avgSpeed).toFixed(2) : '0.00';

        if (stats.avgHeartRate && stats.count > 0) {
          stats.avgHeartRate = Number(
            (stats.avgHeartRate / stats.count).toFixed(0)
          );
        }

        return stats;
      })
      .sort((a, b) => b.year.localeCompare(a.year)); // 按年份降序

    return result;
  }, [activities]);

  // 格式化单个年份的时间
  const formatYearTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="w-full lg:w-[280px] space-y-4 shrink-0">
      {/* Total Summary Card */}
      <div>
        <div className="bg-zinc-900 border rounded-2xl p-5 space-y-4 relative overflow-hidden cursor-pointer transition-all border-[#E31937] shadow-[0_0_20px_-5px_rgba(227,25,55,0.3)]">
          {/* Background icon */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-24 h-24 text-white"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>

          <h2 className="text-xl font-bold text-zinc-100 relative z-10">
            Total Summary
          </h2>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 relative z-10">
            {/* Total Distance */}
            <div className="flex flex-col col-span-2">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase mb-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"></path>
                  <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"></path>
                  <path d="M16 17h4"></path>
                  <path d="M4 13h4"></path>
                </svg>
                Distance
              </div>
              <div className="font-mono font-medium truncate text-2xl text-white tracking-tight">
                {totalStats.totalDistance} {DIST_UNIT}
              </div>
            </div>

            {/* Runs */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase mb-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                Runs
              </div>
              <div className="font-mono font-medium truncate text-lg text-zinc-300">
                {totalStats.count}
              </div>
            </div>

            {/* Time */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase mb-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <line x1="10" x2="14" y1="2" y2="2"></line>
                  <line x1="12" x2="15" y1="14" y2="11"></line>
                  <circle cx="12" cy="14" r="8"></circle>
                </svg>
                Time
              </div>
              <div className="font-mono font-medium truncate text-lg text-zinc-300">
                {totalStats.totalTime}
              </div>
            </div>

            {/* Avg Pace */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase mb-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <line x1="10" x2="14" y1="2" y2="2"></line>
                  <line x1="12" x2="15" y1="14" y2="11"></line>
                  <circle cx="12" cy="14" r="8"></circle>
                </svg>
                Avg Pace
              </div>
              <div className="font-mono font-medium truncate text-lg text-zinc-300">
                {totalStats.avgPace}'{totalStats.avgPace.split('.')[1] || '00'}"
              </div>
            </div>

            {/* Avg HR */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase mb-0.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3 h-3"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
                Avg HR
              </div>
              <div className="font-mono font-medium truncate text-lg text-zinc-300">
                {totalStats.avgHeartRate ? `${totalStats.avgHeartRate} bpm` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Year Stats List */}
      <div className="space-y-3">
        {yearStatsList.map((yearStats) => (
          <div key={yearStats.year}>
            <div
              className={`bg-zinc-900/50 border rounded-xl p-4 transition-colors group cursor-pointer border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 ${
                selectedYear === yearStats.year
                  ? 'border-[#E31937] bg-zinc-900'
                  : ''
              }`}
              onClick={() =>
                onYearSelect(
                  selectedYear === yearStats.year ? null : yearStats.year
                )
              }
            >
              <div className="flex justify-between items-center mb-3">
                <h3
                  className={`text-lg font-bold transition-colors ${
                    selectedYear === yearStats.year
                      ? 'text-[#E31937]'
                      : 'text-white group-hover:text-[#E31937]'
                  }`}
                >
                  {yearStats.year}
                </h3>
                <div className="text-xs font-mono text-zinc-500">
                  {yearStats.count} runs
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase">
                    Distance
                  </span>
                  <span className="font-mono text-zinc-200">
                    {yearStats.totalDistance.toFixed(2)} {DIST_UNIT}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase">
                    Time
                  </span>
                  <span className="font-mono text-zinc-400">
                    {formatYearTime(yearStats.totalTime)}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase">
                    Avg Pace
                  </span>
                  <span className="font-mono text-zinc-400">
                    {yearStats.avgPace}'
                    {yearStats.avgPace.split('.')[1] || '00'}"
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 uppercase">
                    Avg HR
                  </span>
                  <span className="font-mono text-zinc-400">
                    {yearStats.avgHeartRate || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackWallSidebar;
