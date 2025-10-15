'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function GuidesByRegionChart({ data }) {
  // Màu đã được định nghĩa trực tiếp ở đây
  const chartColor = "#38D39F"; 

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '200px' }}>
      <ResponsiveContainer>
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{
            left: 10,
            top: 5,
            right: 5,
            bottom: 5,
          }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <YAxis
            dataKey="region"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            className="capitalize"
            fontSize={12}
          />
          <XAxis type="number" hide />
          <Tooltip
            cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
            contentStyle={{
              background: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Bar dataKey="guides" fill={chartColor} radius={5} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
