import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, pathForRun } from '@/utils/utils';
import { DIST_UNIT, M_TO_DIST } from '@/utils/utils';

interface TrackWallGridProps {
  activities: Activity[];
  selectedYear: string | null;
}

interface TooltipProps {
  activity: Activity;
  position: { x: number; y: number };
  visible: boolean;
}

const TrackWallTooltip: React.FC<TooltipProps> = ({ activity, position, visible }) => {
  if (!visible) return null;

  const distance = (activity.distance / M_TO_DIST).toFixed(2);
  const [hours, minutes] = activity.moving_time.split(':').slice(0, 2);
  const date = new Date(activity.start_date_local).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div
      className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y + 10,
        transform: 'translate(0, -50%)',
      }}
    >
      <div className="text-xs text-zinc-400 mb-1">{date}</div>
      <div className="text-lg font-bold text-white mb-2">
        {distance} <span className="text-sm font-normal">{DIST_UNIT}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-300">
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{hours}h {minutes}m</span>
        </div>
        {activity.average_heartrate && (
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
            <span>{activity.average_heartrate.toFixed(0)} bpm</span>
          </div>
        )}
      </div>
    </div>
  );
};

const TrackWallGrid: React.FC<TrackWallGridProps> = ({
  activities,
  selectedYear,
}) => {
  const navigate = useNavigate();
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 根据选中的年份筛选活动
  const filteredActivities = useMemo(() => {
    if (!selectedYear) return activities;
    return activities.filter((activity) =>
      activity.start_date_local.startsWith(selectedYear)
    );
  }, [activities, selectedYear]);

  // 按日期排序(最新的在前)
  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort(
      (a, b) =>
        new Date(b.start_date_local).getTime() -
        new Date(a.start_date_local).getTime()
    );
  }, [filteredActivities]);

  const handleClick = (activity: Activity) => {
    navigate(`/#run_${activity.run_id}`);
  };

  const handleMouseEnter = (activity: Activity, event: React.MouseEvent) => {
    setHoveredActivity(activity);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredActivity(null);
  };

  // 根据距离计算颜色
  const getStrokeColor = (dist: number): string => {
    if (dist < 5) return '#60a5fa';   // 蓝色 - < 5km
    if (dist < 10) return '#34d399';  // 绿色 - 5-10km
    if (dist < 15) return '#fbbf24';  // 黄色 - 10-15km
    if (dist < 20) return '#f97316';  // 橙色 - 15-20km
    return '#E31937';                 // 红色 - >= 20km
  };

  // SVG 轨迹渲染组件
  const RouteSvg: React.FC<{ activity: Activity }> = ({ activity }) => {
    const path = useMemo(() => pathForRun(activity), [activity]);
    const distance = activity.distance / M_TO_DIST;
    const strokeColor = getStrokeColor(distance);

    if (!path || path.length < 2) {
      // 无轨迹数据时显示占位符
      return (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
        >
          <circle
            cx="50"
            cy="50"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-zinc-700"
          />
          <path
            d="M50 35 L50 65 M35 50 L65 50"
            stroke="currentColor"
            strokeWidth="3"
            className="text-zinc-700"
          />
        </svg>
      );
    }

    // 计算边界
    const lngs = path.map((p) => p[0]);
    const lats = path.map((p) => p[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    const width = maxLng - minLng || 1;
    const height = maxLat - minLat || 1;

    // 坐标转换函数 - 映射到100x100
    const toSvg = (lng: number, lat: number) => {
      const x = ((lng - minLng) / width) * 100;
      const y = 100 - ((lat - minLat) / height) * 100;
      return [x, y];
    };

    // 生成路径字符串
    const pathString = path
      .map((coord, i) => {
        const [x, y] = toSvg(coord[0], coord[1]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
      >
        {/* 轨迹线 - 细60% (3px * 0.4 = 1.2px) */}
        <path
          d={pathString}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300 group-hover:stroke-white group-hover:stroke-[1.6px] group-hover:drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
        />
      </svg>
    );
  };

  if (sortedActivities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-zinc-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12 mx-auto mb-4 opacity-50"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <p className="text-lg">该年份暂无跑步记录</p>
          <p className="text-sm mt-2">选择其他年份查看</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 顶部标题区域 - 完全按照HTML设计 */}
      <div className="flex items-baseline justify-end gap-3 px-6 pt-6 cursor-pointer group" title="Click to download track map">
        {/* 下载按钮 - hover时显示 */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 mr-2">
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" x2="12" y1="15" y2="3"></line>
          </svg>
        </div>

        {/* 标题文字 */}
        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
          ZiTone's Run
        </span>
      </div>

      {/* 15列网格布局 */}
      <div className="px-6 pb-6 pt-2 flex-1 z-10 relative">
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(15, minmax(0px, 1fr))' }}>
          {sortedActivities.map((activity) => (
            <div
              key={activity.run_id}
              className="aspect-square flex items-center justify-center relative group cursor-pointer"
              onClick={() => handleClick(activity)}
              onMouseEnter={(e) => handleMouseEnter(activity, e)}
              onMouseLeave={handleMouseLeave}
            >
              <RouteSvg activity={activity} />
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      <TrackWallTooltip
        activity={hoveredActivity || sortedActivities[0]}
        position={tooltipPosition}
        visible={hoveredActivity !== null}
      />
    </>
  );
};

export default TrackWallGrid;
