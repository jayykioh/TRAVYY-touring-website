// src/admin/components/Dashboard/TopGuidesTable.jsx

import React from 'react';
import { Star } from 'lucide-react';
import TableCard from '../Common/TableCard';

const TopGuidesTable = ({ data }) => {
  const renderRow = (guide, idx) => (
    <tr key={guide.id} className={idx !== data.length - 1 ? 'border-b border-gray-100' : ''}>
      <td className="py-3 px-2 text-sm font-medium text-gray-900">{guide.name}</td>
      <td className="py-3 px-2 text-sm text-gray-600">{guide.region}</td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-900">{guide.rating}</span>
        </div>
      </td>
    </tr>
  );

  return (
    <TableCard 
      title="Hướng dẫn viên nổi bật"
      headers={['Tên', 'Khu vực', 'Đánh giá']}
      data={data}
      renderRow={renderRow}
    />
  );
};

export default TopGuidesTable;