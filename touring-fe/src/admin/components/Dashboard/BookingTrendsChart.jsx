// src/admin/components/Dashboard/BookingTrendsChart.jsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BookingTrendsChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          formatter={(value) => `${value} lượt`}
        />
        <Line 
          type="monotone" 
          dataKey="bookings" 
          stroke="#10b981" 
          strokeWidth={3} 
          dot={{ r: 5 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BookingTrendsChart;