'use client';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/admin/components/ui/chart';


export default function RevenueChart({ data }) {
  const chartConfig = {
    revenue: {
      label: 'Doanh thu',
      color: 'hsl(217, 91%, 60%)',
    },
    profit: {
      label: 'Lợi nhuận',
      color: 'hsl(142, 76%, 36%)',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 12,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Legend content={<ChartLegendContent />} />
        
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-profit)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-profit)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        
        <Area
          dataKey="revenue"
          type="monotone"
          fill="url(#fillRevenue)"
          fillOpacity={0.4}
          stroke="var(--color-revenue)"
          strokeWidth={2}
        />
        <Area
          dataKey="profit"
          type="monotone"
          fill="url(#fillProfit)"
          fillOpacity={0.4}
          stroke="var(--color-profit)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}