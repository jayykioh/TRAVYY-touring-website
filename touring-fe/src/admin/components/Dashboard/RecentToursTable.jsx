// src/admin/components/Dashboard/RecentToursTable.jsx

import React from 'react';
import TableCard from '../Common/TableCard';

const RecentToursTable = ({ data }) => {
  const renderRow = (tour, idx) => (
    <tr key={tour.id} className={idx !== data.length - 1 ? 'border-b border-gray-100' : ''}>
      <td className="py-3 px-2 text-sm font-medium text-gray-900">{tour.name}</td>
      <td className="py-3 px-2 text-sm text-gray-600">{tour.date}</td>
      <td className="py-3 px-2 text-sm text-gray-600">{tour.bookings}</td>
      <td className="py-3 px-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          tour.status === 'Hoạt động' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {tour.status}
        </span>
      </td>
    </tr>
  );

  return (
    <TableCard 
      title="Tour gần đây"
      headers={['Tên tour', 'Ngày', 'Đặt', 'Trạng thái']}
      data={data}
      renderRow={renderRow}
    />
  );
};

export default RecentToursTable;