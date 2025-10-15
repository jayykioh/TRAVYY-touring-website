// components/StatusBadge.jsx
import React from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../../data/mockData';

const StatusBadge = ({ status }) => {
  const label = STATUS_LABELS[status] || status;
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.inactive;

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {label}
    </span>
  );
};

export default StatusBadge;