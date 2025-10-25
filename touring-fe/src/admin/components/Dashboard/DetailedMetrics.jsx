"use client"

import React from "react"
import {
  Users,
  UserPlus,
  ShoppingCart,
  RotateCw,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Map các Icons
const iconMap = {
  Users: <Users className="w-6 h-6" />,
  UserPlus: <UserPlus className="w-6 h-6" />,
  ShoppingCart: <ShoppingCart className="w-6 h-6" />,
  RotateCw: <RotateCw className="w-6 h-6" />,
  MessageSquare: <MessageSquare className="w-6 h-6" />,
  AlertCircle: <AlertCircle className="w-6 h-6" />,
}

// Component Card chi tiết
const DetailedMetricCard = ({ metric, index }) => {
  const colorVariants = [
    {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-200",
      iconColor: "text-blue-700",
      border: "border-blue-300",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
      iconBg: "bg-purple-200",
      iconColor: "text-purple-700",
      border: "border-purple-300",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      iconBg: "bg-amber-200",
      iconColor: "text-amber-700",
      border: "border-amber-300",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    {
      bg: "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
      iconBg: "bg-cyan-200",
      iconColor: "text-cyan-700",
      border: "border-cyan-300",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    {
      bg: "bg-gradient-to-br from-rose-50 to-rose-100/50",
      iconBg: "bg-rose-200",
      iconColor: "text-rose-700",
      border: "border-rose-300",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
    {
      bg: "bg-gradient-to-br from-teal-50 to-teal-100/50",
      iconBg: "bg-teal-200",
      iconColor: "text-teal-700",
      border: "border-teal-300",
      trendUp: "text-emerald-600 bg-emerald-50",
      trendDown: "text-red-600 bg-red-50",
    },
  ]

  const colors = colorVariants[index % colorVariants.length]
  const isTrendUp = metric.trend === "up"

  return (
    <div
      className={cn(
        "rounded-2xl p-3  border-2 shadow-sm hover:shadow-xl transition-all duration-300",
        colors.bg,
        colors.border,
      )}
    >
      {/* Header với Icon và Label */}
      <div className="flex items-start gap-3 mb-6">
        <div className={cn("rounded-xl p-2.5 flex-shrink-0", colors.iconBg)}>
          <div className={colors.iconColor}>{iconMap[metric.icon]}</div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-600 line-clamp-2">{metric.label}</h3>
        </div>
      </div>

      {/* Main Value - Căn giữa */}
      <div className="text-center mb-5">
        <div className="text-4xl font-bold text-gray-900 mb-1">{metric.value}</div>
        <p className="text-sm text-gray-500">{metric.unit}</p>
      </div>

      {/* Trend Badge - Căn giữa */}
      <div className="flex justify-center mb-4">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
            isTrendUp ? colors.trendUp : colors.trendDown,
          )}
        >
          {isTrendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{metric.change}</span>
          <span className="opacity-70">vs. tháng trước</span>
        </div>
      </div>

      {/* Additional Info */}
      {(metric.percentage || metric.rating) && (
        <div className="pt-4 border-t border-gray-200/50 space-y-1">
          {metric.percentage && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Tỷ lệ:</span>
              <span className="font-bold text-gray-900">{metric.percentage}</span>
            </div>
          )}
          {metric.rating && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Đánh giá:</span>
              <span className="font-bold text-gray-900">{metric.rating}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Component Container
const DetailedMetrics = ({ metrics }) => {
  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Chi tiết Metrics</h2>
        <p className="text-gray-600">Theo dõi các chỉ số quan trọng về người dùng</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <DetailedMetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </div>
  )
}

export default DetailedMetrics