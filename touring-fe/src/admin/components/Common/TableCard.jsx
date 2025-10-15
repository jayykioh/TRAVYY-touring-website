// src/admin/components/Common/TableCard.jsx

import React from 'react';

const TableCard = ({ title, titleClassName, headers, data, renderRow }) => (
  <div className="bg-white rounded-xl shadow-md border border-teal-200 overflow-hidden">
    <div className="bg-teal-50 px-6 py-5 border-b border-teal-100">
      <h3 className={titleClassName || "text-lg font-semibold text-teal-900"}>
        {title}
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-teal-600">
            {headers.map((header, idx) => (
              <th key={idx} className="text-left text-xs font-semibold text-white uppercase tracking-wide py-3.5 px-6">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => renderRow(item, idx))}
        </tbody>
      </table>
    </div>
  </div>
);
export default TableCard;