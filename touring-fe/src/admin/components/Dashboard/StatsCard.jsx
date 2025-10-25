import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

// Color mapping from iconColor to icon color only
const colorSchemeMapping = {
  'text-blue-600': {
    iconBg: '#3b82f6'
  },
  'text-green-600': {
    iconBg: '#22c55e'
  },
  'text-yellow-600': {
    iconBg: '#eab308'
  },
  'text-purple-600': {
    iconBg: '#a855f7'
  },
  'text-orange-600': {
    iconBg: '#f97316'
  },
  'text-red-600': {
    iconBg: '#ef4444'
  }
};

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  const isPositive = stat.trend === 'up';
  const colors = colorSchemeMapping[stat.iconColor] || colorSchemeMapping['text-blue-600'];
 
  // Determine trend color
  const trendColor = isPositive ? '#10b981' : '#ef4444';
  
  // Background variants based on card variant
  const bgVariants = {
    mint: 'bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200',
    aqua: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    yellow: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
  };
  
  const bgClass = bgVariants[stat.variant || 'mint'];
 
  return (
    <div
      className={`${bgClass} rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
    >
      {/* Header with Icon on the right */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-700">
          {stat.label}
        </h3>
        {/* Icon on the right */}
        <Icon
          className="w-6 h-6"
          style={{ color: colors.iconBg }}
        />
      </div>

      {/* Main Value */}
      <div className="mb-1">
        <h2 className={`text-3xl font-bold ${stat.variant === 'yellow' ? 'text-red-600' : 'text-gray-900'}`}>
          {stat.value}
        </h2>
      </div>

      {/* Subtitle */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">{stat.subtitle}</p>
      </div>

      {/* Bottom section with trend and chart */}
      <div className="flex items-end justify-between">
        {/* Trend indicator */}
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {stat.change}
          </span>
        </div>

        {/* Mini Chart on the right */}
        {stat.chartData && stat.chartData.length > 0 && (
          <div className="w-32 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stat.chartData}>
                <defs>
                  <linearGradient id={`gradient-${stat.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={trendColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={trendColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={trendColor}
                  strokeWidth={2}
                  fill={`url(#gradient-${stat.id})`}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
{/* Breakdown section */}
              {stat.breakdown && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center divide-x-2 divide-gray-300">
                    {stat.breakdown.map((item, index) => (
                      <div key={index} className="flex-1 text-center px-4 first:pl-0 last:pr-0">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{item.label}:</span>{' '}
                          <span className="font-bold text-gray-800">{item.value}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
    </div>
  );
};

export default StatCard;