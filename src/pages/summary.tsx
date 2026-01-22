import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import TrackWallSidebar from '@/components/TrackWallSidebar';
import TrackWallGrid from '@/components/TrackWallGrid';
import useActivities from '@/hooks/useActivities';
import { useTheme } from '@/hooks/useTheme';

const SummaryPage = () => {
  const { theme } = useTheme();
  const { activities } = useActivities();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const handleYearSelect = (year: string | null) => {
    setSelectedYear(year);
  };

  return (
    <Layout>
      <Helmet>
        <html lang="zh" data-theme={theme} />
        <title>轨迹墙 - RUN.LOG</title>
      </Helmet>

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-100">轨迹墙</h1>
          <p className="text-zinc-400 mt-1">
            {selectedYear ? `${selectedYear} 年` : '全部'}跑步记录
          </p>
        </div>

        {/* 左右布局 */}
        <div className="flex gap-6">
          {/* 左侧边栏 - 固定宽度 */}
          <div className="sticky top-6 h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
            <TrackWallSidebar
              activities={activities}
              selectedYear={selectedYear}
              onYearSelect={handleYearSelect}
            />
          </div>

          {/* 右侧网格 - 自适应 */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col min-h-[600px] relative">
            <TrackWallGrid activities={activities} selectedYear={selectedYear} />
          </div>
        </div>
      </div>

      {/* 自定义滚动条样式 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(227, 25, 55, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(227, 25, 55, 0.5);
        }
      `}</style>
    </Layout>
  );
};

export default SummaryPage;
