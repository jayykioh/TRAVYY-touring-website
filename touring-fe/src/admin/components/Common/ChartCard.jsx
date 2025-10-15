// src/admin/components/Common/ChartCard.jsx

import React from 'react';

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
    <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
);

export default ChartCard;