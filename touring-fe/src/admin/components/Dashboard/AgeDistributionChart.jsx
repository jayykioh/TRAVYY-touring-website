import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts";
import { Users } from "lucide-react";

const GRADIENT_COLORS = [
  { start: "#3b82f6", end: "#60a5fa" },
  { start: "#10b981", end: "#34d399" },
];

const AgeDistributionChart = ({ data = [] }) => {
  const totalCustomers = data.reduce((sum, item) => sum + item.value, 0);
  const [activeIndex, setActiveIndex] = useState(null);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-xl shadow-2xl border border-gray-200 backdrop-blur-sm">
          <p className="font-bold text-gray-800 text-lg mb-2">
            {payload[0].name}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {payload[0].payload.description}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Số lượng:</span>
              <span className="font-bold text-blue-600 text-lg">
                {payload[0].value.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm text-gray-600">Tỷ lệ:</span>
              <span className="font-bold text-purple-600 text-lg">
                {payload[0].payload.percentage}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          fill="#1f2937"
          className="font-bold text-xl"
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy}
          dy={25}
          textAnchor="middle"
          fill="#6b7280"
          className="text-sm"
        >
          {`${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
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
              Tổng:{" "}
              <span className="font-semibold text-blue-600">
                {totalCustomers.toLocaleString()}
              </span>{" "}
              khách hàng
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <defs>
              {GRADIENT_COLORS.map((color, index) => (
                <linearGradient
                  key={index}
                  id={`ageGradient${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color.start} stopOpacity={1} />
                  <stop offset="100%" stopColor={color.end} stopOpacity={0.8} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={5}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#ageGradient${index})`}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={40}
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
