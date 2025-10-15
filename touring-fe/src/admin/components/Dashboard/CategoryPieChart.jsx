// src/admin/components/Dashboard/CategoryPieChart.jsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
// ...các import khác nếu có

const CategoryPieChart = ({ data = mockCategoryData }) => {
  // Custom label hiển thị phần trăm
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend với ô vuông màu
  const renderLegend = () => {
    return (
      <div className="flex flex-col gap-2" style={{ position: 'absolute', right: '20px', top: '20px' }}>
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative" style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="40%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={120}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '8px 12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {renderLegend()}
    </div>
  );
};

export default CategoryPieChart;