import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import useActivities from '@/hooks/useActivities';

const MonthlyDistanceChart = () => {
  const { activities, thisYear } = useActivities();

  // Calculate monthly distances for current year
  const chartData = useMemo(() => {
    const monthlyData = new Array(12).fill(0).map((_, index) => ({
      name: `${index + 1}月`,
      distance: 0,
    }));

    activities.forEach((activity) => {
      const date = new Date(activity.start_date_local);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (year.toString() === thisYear) {
        monthlyData[month].distance += activity.distance / 1000; // Convert to km
      }
    });

    return monthlyData;
  }, [activities, thisYear]);

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 h-[300px]">
      <style>
        {`
          .recharts-wrapper path:focus,
          .recharts-wrapper rect:focus,
          .recharts-wrapper g:focus,
          .recharts-wrapper:focus,
          .recharts-surface:focus,
          .recharts-layer:focus,
          .recharts-cartesian-axis-tick:focus {
            outline: none !important;
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">月度跑量</h3>
        <span className="text-2xl font-bold text-zinc-500">{thisYear}</span>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#a1a1aa',
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number) => `${value.toFixed(1)} km`}
            />
            <Bar
              dataKey="distance"
              fill="#3f3f46"
              radius={[4, 4, 0, 0]}
              className="transition-colors hover:opacity-80 outline-none focus:outline-none"
              style={{ outline: 'none' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyDistanceChart;
