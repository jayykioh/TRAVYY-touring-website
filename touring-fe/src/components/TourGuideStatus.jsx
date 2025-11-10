import React from 'react';
import { CheckCircle, Clock, XCircle, User, Calendar } from 'lucide-react';

const TourGuideStatus = ({ tourGuideRequest, preferredDate, onRequestGuide, onCancelRequest }) => {
  if (!tourGuideRequest || tourGuideRequest.status === 'none') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">
              Cần hướng dẫn viên?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Yêu cầu hướng dẫn viên chuyên nghiệp để có trải nghiệm tốt nhất cho chuyến đi của bạn
            </p>
            <button
              onClick={onRequestGuide}
              className="px-6 py-2.5 bg-[#02A0AA] text-white rounded-lg hover:bg-[#018f95] transition-colors font-medium shadow-lg shadow-[#02A0AA]/30"
            >
              Yêu cầu hướng dẫn viên
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (tourGuideRequest.status === 'pending') {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">
              Đang chờ hướng dẫn viên
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Yêu cầu của bạn đang được xem xét bởi các hướng dẫn viên. Chúng tôi sẽ thông báo ngay khi có phản hồi.
            </p>
            {tourGuideRequest.requestedAt && (
              <p className="text-xs text-gray-500 mb-3">
                Gửi yêu cầu: {new Date(tourGuideRequest.requestedAt).toLocaleString('vi-VN')}
              </p>
            )}
            {preferredDate && (
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                <Calendar className="w-4 h-4" />
                <span>Ngày khởi hành: {new Date(preferredDate).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={onCancelRequest}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Hủy yêu cầu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tourGuideRequest.status === 'accepted') {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">
              Đã có hướng dẫn viên!
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Tuyệt vời! Hướng dẫn viên đã chấp nhận yêu cầu của bạn. Hãy chuẩn bị cho chuyến đi thú vị!
            </p>
            {tourGuideRequest.respondedAt && (
              <p className="text-xs text-gray-500 mb-3">
                Chấp nhận lúc: {new Date(tourGuideRequest.respondedAt).toLocaleString('vi-VN')}
              </p>
            )}
            {preferredDate && (
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Ngày khởi hành: {new Date(preferredDate).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-700">
                <strong>Lưu ý:</strong> Hướng dẫn viên sẽ liên hệ với bạn qua email hoặc số điện thoại để xác nhận chi tiết.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tourGuideRequest.status === 'rejected') {
    return (
      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">
              Yêu cầu bị từ chối
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Rất tiếc, yêu cầu của bạn chưa được chấp nhận. Bạn có thể thử yêu cầu lại hoặc điều chỉnh lịch trình.
            </p>
            {tourGuideRequest.respondedAt && (
              <p className="text-xs text-gray-500 mb-4">
                Từ chối lúc: {new Date(tourGuideRequest.respondedAt).toLocaleString('vi-VN')}
              </p>
            )}
            <button
              onClick={onRequestGuide}
              className="px-6 py-2.5 bg-[#02A0AA] text-white rounded-lg hover:bg-[#018f95] transition-colors font-medium"
            >
              Yêu cầu lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TourGuideStatus;
