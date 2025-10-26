// src/admin/components/Dashboard/AvailableGuides.jsx

import React, { useState } from 'react';
import TableCard from '../Common/TableCard';
import { X, Calendar, Users, Clock, DollarSign, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AvailableGuidesTable = ({ data }) => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [modalType, setModalType] = useState(null); // 'assign' hoặc 'schedule'

  const handleAssignTour = (guide) => {
    setSelectedGuide(guide);
    setModalType('assign');
  };

  const handleViewSchedule = (guide) => {
    setSelectedGuide(guide);
    setModalType('schedule');
  };

  const closeModal = () => {
    setSelectedGuide(null);
    setModalType(null);
  };

  const renderRow = (guide, idx) => (
    <tr key={guide.id} className={idx !== data.length - 1 ? 'border-b border-gray-100' : ''}>
      <td className="py-3 px-6 text-sm font-medium text-gray-900">{guide.name}</td>
      <td className="py-3 px-6 text-sm text-gray-600">{guide.region}</td>
      <td className="py-3 px-6 text-sm text-gray-900">{guide.toursThisWeek}</td>
      <td className="py-3 px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">{guide.statusIcon}</span>
          <span className={`text-sm font-medium ${
            guide.status === 'Rảnh' ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {guide.status}
          </span>
        </div>
      </td>
      <td className="py-3 px-6">
        <button 
          onClick={() => guide.status === 'Rảnh' ? handleAssignTour(guide) : handleViewSchedule(guide)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            guide.status === 'Rảnh' 
              ? 'bg-teal-600 text-white hover:bg-teal-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {guide.action}
        </button>
      </td>
    </tr>
  );

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0, 121, 128, 0.15)",
          },
          success: {
            iconTheme: {
              primary: "#007980",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <TableCard
        title="Hướng dẫn viên rảnh / chưa có tour trong tuần"
        headers={['Tên', 'Khu vực', 'Số tour tuần này', 'Trạng thái', 'Action']}
        data={data}
        renderRow={renderRow}
      />

      {/* Modal Giao Tour */}
      {modalType === 'assign' && selectedGuide && (
        <AssignTourModal guide={selectedGuide} onClose={closeModal} />
      )}

      {/* Modal Xem Lịch */}
      {modalType === 'schedule' && selectedGuide && (
        <ScheduleModal guide={selectedGuide} onClose={closeModal} />
      )}
    </>
  );
};

// Modal Giao Tour
const AssignTourModal = ({ guide, onClose }) => {
  const [selectedTour, setSelectedTour] = useState('');
  
  const availableTours = [
    { id: 1, name: 'Tour Bà Nà Hills - Cầu Vàng', date: '20/10/2025', time: '08:00', guests: 15, price: '1.200.000đ' },
    { id: 2, name: 'Tour Hội An - Phố Cổ', date: '21/10/2025', time: '14:00', guests: 10, price: '800.000đ' },
    { id: 3, name: 'Tour Sơn Trà - Linh Ứng', date: '22/10/2025', time: '09:00', guests: 20, price: '950.000đ' },
  ];

  const handleSubmit = () => {
    if (selectedTour) {
      toast.success(`Đã giao tour cho ${guide.name}!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between sticky top-0">
          <h3 className="text-xl font-semibold text-white">Giao Tour cho {guide.name}</h3>
          <button onClick={onClose} className="text-white hover:bg-teal-700 rounded-lg p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guide Info */}
        <div className="px-6 py-4 bg-teal-50 border-b border-teal-100">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Hướng dẫn viên</p>
              <p className="font-semibold text-gray-900">{guide.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Khu vực</p>
              <p className="font-semibold text-gray-900">{guide.region}</p>
            </div>
          </div>
        </div>

        {/* Available Tours */}
        <div className="px-6 py-6">
          <h4 className="font-semibold text-gray-900 mb-4">Chọn tour cần giao</h4>
          <div className="space-y-3">
            {availableTours.map((tour) => (
              <div
                key={tour.id}
                onClick={() => setSelectedTour(tour.id)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTour === tour.id
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-semibold text-gray-900 flex-1">{tour.name}</h5>
                  {selectedTour === tour.id && (
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 ml-2" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{tour.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{tour.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{tour.guests} khách</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{tour.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedTour}
            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
              selectedTour
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Xác nhận giao tour
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Xem Lịch
const ScheduleModal = ({ guide, onClose }) => {
  const schedule = [
    { 
      date: '18/10/2025', 
      day: 'Thứ 6',
      tour: 'Tour Ngũ Hành Sơn',
      time: '14:00 - 18:00',
      status: 'completed',
      guests: 12
    },
    { 
      date: '20/10/2025', 
      day: 'Chủ nhật',
      tour: 'Tour Bà Nà Hills',
      time: '08:00 - 17:00',
      status: 'upcoming',
      guests: 18
    },
  ];

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Hoàn thành</span>;
    }
    return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Sắp tới</span>;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between sticky top-0">
          <h3 className="text-xl font-semibold text-white">Lịch làm việc - {guide.name}</h3>
          <button onClick={onClose} className="text-white hover:bg-teal-700 rounded-lg p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guide Info */}
        <div className="px-6 py-4 bg-teal-50 border-b border-teal-100">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Hướng dẫn viên</p>
              <p className="font-semibold text-gray-900">{guide.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Khu vực</p>
              <p className="font-semibold text-gray-900">{guide.region}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số tour tuần này</p>
              <p className="font-semibold text-gray-900">{guide.toursThisWeek} tour</p>
            </div>
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="px-6 py-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Lịch trình tuần này
          </h4>
          
          <div className="space-y-4">
            {schedule.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h5 className="font-semibold text-gray-900">{item.tour}</h5>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-gray-600">{item.day}, {item.date}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>{item.guests} khách</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Days */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-2">📅 Ngày còn trống trong tuần</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white border border-green-300 text-green-700 text-sm rounded-lg">Thứ 2 - 19/10</span>
              <span className="px-3 py-1 bg-white border border-green-300 text-green-700 text-sm rounded-lg">Thứ 3 - 21/10</span>
              <span className="px-3 py-1 bg-white border border-green-300 text-green-700 text-sm rounded-lg">Thứ 4 - 22/10</span>
              <span className="px-3 py-1 bg-white border border-green-300 text-green-700 text-sm rounded-lg">Thứ 5 - 23/10</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailableGuidesTable;