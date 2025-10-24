import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { Users, Award } from 'lucide-react';

// Mock data - có thể thay đổi dễ dàng
const mockData = [
  { name: '18-25 tuổi', value: 450, percentage: 22.5, description: 'Gen Z' },
  { name: '26-35 tuổi', value: 680, percentage: 34.0, description: 'Millennials' },
  { name: '36-45 tuổi', value: 520, percentage: 26.0, description: 'Gen X' },
  { name: '46-55 tuổi', value: 240, percentage: 12.0, description: 'Trung niên' },
  { name: '56+ tuổi', value: 110, percentage: 5.5, description: 'Cao tuổi' }
];

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];
const GRADIENT_COLORS = [
  { start: '#3b82f6', end: '#60a5fa' },
  { start: '#06b6d4', end: '#22d3ee' },
  { start: '#8b5cf6', end: '#a78bfa' },
  { start: '#f59e0b', end: '#fbbf24' },
  { start: '#ef4444', end: '#f87171' }
];

const AgeDistributionChart = () => {
  const totalCustomers = mockData.reduce((sum, item) => sum + item.value, 0);
  const maxGroup = mockData.reduce((max, item) => item.value > max.value ? item : max);
  const [activeIndex, setActiveIndex] = useState(null);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-2xl border border-gray-200 backdrop-blur-sm">
          <p className="font-bold text-gray-800 text-lg mb-2">{payload[0].name}</p>
          <p className="text-xs text-gray-500 mb-3">{payload[0].payload.description}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Số lượng:</span>
              <span className="font-bold text-blue-600 text-lg">{payload[0].value.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Tỷ lệ:</span>
              <span className="font-bold text-purple-600 text-lg">{payload[0].payload.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 15}
          fill={fill}
          style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <path 
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} 
          stroke={fill} 
          fill="none" 
          strokeWidth={2}
          style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 12} 
          y={ey} 
          textAnchor={textAnchor} 
          fill="#1f2937" 
          className="font-bold text-sm"
          style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {payload.name}
        </text>
        <text 
          x={ex + (cos >= 0 ? 1 : -1) * 12} 
          y={ey} 
          dy={18} 
          textAnchor={textAnchor} 
          fill="#6b7280" 
          className="text-xs"
          style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {`${value.toLocaleString()} khách (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart với header */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Phân bố Khách hàng theo Độ tuổi
            </h2>
            <p className="text-gray-600 text-xs">
              Tổng: <span className="font-semibold text-blue-600">{totalCustomers.toLocaleString()}</span> khách hàng
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={450}>
          <PieChart>
            <defs>
              {GRADIENT_COLORS.map((color, index) => (
                <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color.start} stopOpacity={1} />
                  <stop offset="100%" stopColor={color.end} stopOpacity={0.8} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={mockData}
              cx="50%"
              cy="50%"
              outerRadius={150}
              innerRadius={70}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={3}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {mockData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient${index})`}
                  style={{ 
                    filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              ))}
            </Pie>
            <Legend 
              verticalAlign="bottom" 
              height={60}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm font-medium text-gray-700">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgeDistributionChart;