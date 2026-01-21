import { useState, useMemo } from 'react';
import {
  formatPace,
  titleForRun,
  formatRunTime,
  filterYearRuns,
  sortDateFunc,
  filterAndSortRuns,
  M_TO_DIST,
} from '@/utils/utils';
import RunTable from '@/components/RunTable';

interface ActivityLogCardProps {
  activities: any[];
  runs: any[];
  locateActivity: (runIds: number[]) => void;
  setActivity: (runs: any[]) => void;
  runIndex: number;
  setRunIndex: (index: number) => void;
  thisYear: string;
  changeYear: (year: string) => void;
}

const ActivityLogCard = ({
  activities,
  runs,
  locateActivity,
  setActivity,
  runIndex,
  setRunIndex,
  thisYear,
  changeYear,
}: ActivityLogCardProps) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 14;

  // Get available years
  const availableYears = useMemo(() => {
    const years = new Set(activities.map((a) => a.start_date_local?.slice(0, 4)));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [activities]);

  // Filter runs by selected year
  const filteredRuns = useMemo(() => {
    if (selectedYear === 'all') {
      // When 'all' is selected, show all activities sorted by date
      return filterAndSortRuns(activities, '', () => true, sortDateFunc);
    }
    return filterAndSortRuns(activities, selectedYear, filterYearRuns, sortDateFunc);
  }, [activities, selectedYear]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredRuns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRuns = filteredRuns.slice(startIndex, endIndex);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setCurrentPage(1); // Reset to first page when changing year
    if (year !== 'all') {
      changeYear(year);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden" style={{ height: '1020px' }}>
      {/* Header */}
      <div className="p-6 bg-zinc-900/50 backdrop-blur-sm z-10 sticky top-0 flex flex-col gap-4 border-b border-zinc-800/50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">活动记录</h3>
          <div className="text-sm text-zinc-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRuns.length)} of {filteredRuns.length}
          </div>
        </div>

        {/* Year filter buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => handleYearChange('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedYear === 'all'
                ? 'bg-[#E31937] text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            All
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => handleYearChange(year)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedYear === year
                  ? 'bg-[#E31937] text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-hidden" style={{ height: '850px' }}>
        <RunTable
          runs={paginatedRuns}
          locateActivity={locateActivity}
          setActivity={setActivity}
          runIndex={runIndex}
          setRunIndex={setRunIndex}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-2 border-t border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400 transition-colors"
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
              className="w-5 h-5"
            >
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </button>
          <span className="text-sm text-zinc-400 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-400 transition-colors"
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
              className="w-5 h-5"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogCard;
