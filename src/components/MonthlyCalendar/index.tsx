import { useState, useMemo } from 'react';
import useActivities from '@/hooks/useActivities';
import {
  geoJsonForRuns,
  sortDateFunc,
} from '@/utils/utils';

interface MonthlyCalendarProps {
  activities: any[];
}

const MonthlyCalendar = ({ activities }: MonthlyCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'route'>('calendar');

  // Format distance in km
  const formatDistance = (meters: number): string => {
    return (meters / 1000).toFixed(1);
  };

  // Get current year and month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Filter activities for current month
  const monthlyActivities = useMemo(() => {
    return activities.filter((activity) => {
      const activityDate = new Date(activity.start_date_local);
      return activityDate.getFullYear() === year && activityDate.getMonth() === month;
    });
  }, [activities, year, month]);

  // Group activities by day
  const activitiesByDay = useMemo(() => {
    const map = new Map<number, any[]>();
    monthlyActivities.forEach((activity) => {
      const day = new Date(activity.start_date_local).getDate();
      if (!map.has(day)) {
        map.set(day, []);
      }
      map.get(day)!.push(activity);
    });
    return map;
  }, [monthlyActivities]);

  // Create SVG path data for each day's routes
  const routePathsByDay = useMemo(() => {
    const pathMap = new Map<number, string>();
    activitiesByDay.forEach((dayActivities, day) => {
      const geoData = geoJsonForRuns(dayActivities.sort(sortDateFunc));
      if (geoData.features.length > 0) {
        // Generate SVG path from coordinates
        const paths: string[] = [];
        geoData.features.forEach((feature: any) => {
          const coords = feature.geometry.coordinates;
          if (coords && coords.length > 0) {
            // Scale coordinates to fit in a 100x100 viewBox
            const lons = coords.map((c: number[]) => c[0]);
            const lats = coords.map((c: number[]) => c[1]);
            const minLon = Math.min(...lons);
            const maxLon = Math.max(...lons);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);

            const lonRange = maxLon - minLon || 1;
            const latRange = maxLat - minLat || 1;

            // Add padding
            const padding = 10;
            const scaleX = (100 - 2 * padding) / lonRange;
            const scaleY = (100 - 2 * padding) / latRange;
            const scale = Math.min(scaleX, scaleY);

            const offsetX = (100 - lonRange * scale) / 2;
            const offsetY = (100 - latRange * scale) / 2;

            const pathD = coords
              .map((c: number[], index: number) => {
                const x = offsetX + (c[0] - minLon) * scale;
                const y = 100 - (offsetY + (c[1] - minLat) * scale); // Flip Y for SVG
                return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(' ');

            paths.push(pathD);
          }
        });
        pathMap.set(day, paths.join(' '));
      }
    });
    return pathMap;
  }, [activitiesByDay]);

  // Calculate total distance for the month
  const totalDistance = useMemo(() => {
    return monthlyActivities.reduce((sum, activity) => sum + activity.distance, 0);
  }, [monthlyActivities]);

  // Create a map of day -> distance for quick lookup
  const dayDistanceMap = useMemo(() => {
    const map = new Map<number, number>();
    monthlyActivities.forEach((activity) => {
      const day = new Date(activity.start_date_local).getDate();
      const distance = activity.distance / 1000; // Convert to km
      map.set(day, (map.get(day) || 0) + distance);
    });
    return map;
  }, [monthlyActivities]);

  // Get days in month and first day of week
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Navigate to previous month
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Format month title (e.g., "01/2026")
  const monthTitle = `${String(month + 1).padStart(2, '0')}/${year}`;

  // Weekday labels
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 flex flex-col" style={{ height: '456px' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 whitespace-nowrap flex-1">
          {monthTitle}
          <span className="text-sm font-normal text-zinc-400 ml-2 flex items-baseline gap-0.5">
            {formatDistance(totalDistance)} km
          </span>
        </h3>

        <div className="flex items-center gap-3">
          {/* Month navigation */}
          <div className="flex gap-1 bg-zinc-800/50 p-1 rounded-lg">
            <button
              onClick={goToPrevMonth}
              className="p-1 rounded-full hover:bg-zinc-700 transition-colors"
              title="Previous month"
            >
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
                className="w-4 h-4 text-zinc-400"
              >
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1 rounded-full hover:bg-zinc-700 transition-colors"
              title="Next month"
            >
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
                className="w-4 h-4 text-zinc-400"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex bg-zinc-800/50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'calendar'
                  ? 'bg-[#E31937] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Calendar View"
            >
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
                className="w-4 h-4"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('route')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'route'
                  ? 'bg-[#E31937] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Route View"
            >
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
                className="w-4 h-4"
              >
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                <line x1="9" x2="9" y1="3" y2="18"></line>
                <line x1="15" x2="15" y1="6" y2="21"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area - Calendar or Route Map */}
      <div className="flex-1">
        <div className="grid grid-cols-7 gap-3 sm:gap-4 h-full">
          {/* Weekday headers */}
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-zinc-600 py-1"
            >
              {day}
            </div>
          ))}

          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-transparent"></div>
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const distance = dayDistanceMap.get(day);
            const hasRun = distance !== undefined;
            const routePath = routePathsByDay.get(day);

            return (
              <div
                key={day}
                className={`rounded-lg sm:rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                  hasRun
                    ? 'bg-zinc-800 text-zinc-500'
                    : ''
                }`}
                style={{ aspectRatio: '1 / 1' }}
              >
                {viewMode === 'calendar' ? (
                  <>
                    <span className="text-xs font-medium">
                      {day}
                    </span>
                    {hasRun && (
                      <span className="text-[10px] opacity-80 mt-0.5">
                        {distance.toFixed(1)}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {routePath ? (
                      <svg
                        viewBox="0 0 100 100"
                        className="absolute inset-0 w-full h-full p-1"
                        style={{ filter: 'drop-shadow(0 0 2px rgba(227, 25, 55, 0.5))' }}
                      >
                        <path
                          d={routePath}
                          fill="none"
                          stroke="#E31937"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    ) : (
                      <span className="text-xs font-medium text-zinc-600">
                        {day}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* Empty cells after last day to complete grid */}
          {Array.from({
            length: (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7,
          }).map((_, index) => (
            <div key={`empty-after-${index}`} className="bg-transparent"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
