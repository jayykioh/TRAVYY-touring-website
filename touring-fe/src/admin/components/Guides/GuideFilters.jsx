// 📁 src/components/Guides/GuideFilters.jsx
// ============================================

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { STATUS_FILTER_OPTIONS } from '../../data/guideData';

const GuideFilters = ({ searchTerm, onSearchChange, statusFilter, onStatusChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm hướng dẫn viên..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_FILTER_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Lọc nâng cao
        </button>
      </div>
    </div>
  );
};

export default GuideFilters;