// 📁 src/components/Guides/GuideDetailModal.jsx
import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Star,
  Award,
  Calendar,
  TrendingUp,
  Briefcase,
  Globe,
  FileText,
  Clock,
} from "lucide-react";
import { getGuideById } from "../../services/guideService";
import { formatPrice } from "../../utils/guideHelpers";
import logger from "../../../utils/logger";

const GuideDetailModal = ({ guideId, onClose }) => {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadGuideDetail();
  }, [guideId]);

  const loadGuideDetail = async () => {
    setLoading(true);
    try {
      const result = await getGuideById(guideId);
      if (result.success) {
        setGuide(result.data);
      }
    } catch (error) {
      logger.error("Failed to load guide details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return null;
  }

  const statusConfig = {
    active: {
      label: "Đang hoạt động",
      color: "text-green-600 bg-green-50 border-green-200",
      icon: "✅",
    },
    suspended: {
      label: "Tạm ngừng",
      color: "text-red-600 bg-red-50 border-red-200",
      icon: "⛔",
    },
  };

  const currentStatus =
    statusConfig[guide.activityStatus] || statusConfig.active;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-7 h-7" />
              Chi tiết Hướng dẫn viên
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Profile Section */}
          <div className="flex items-start gap-6 mb-8 pb-6 border-b border-gray-200">
            {imageError ? (
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-lg">
                <span className="text-white text-5xl font-bold">
                  {guide.name.charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <img
                src={guide.avatar}
                alt={guide.name}
                onError={() => setImageError(true)}
                className="w-32 h-32 rounded-2xl object-cover flex-shrink-0 shadow-lg"
              />
            )}

            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                {guide.name}
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-2" />
                  <span className="text-lg font-bold text-gray-900">
                    {guide.rating}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">/ 5.0</span>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border-2 font-medium ${currentStatus.color}`}
                >
                  <span className="mr-2">{currentStatus.icon}</span>
                  {currentStatus.label}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-gray-700">
                  <Mail className="w-5 h-5 mr-3 text-blue-600" />
                  <span>{guide.email || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="w-5 h-5 mr-3 text-green-600" />
                  <span>{guide.phone || "Chưa cập nhật"}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-red-600" />
                  <span>{guide.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Building2 className="w-5 h-5 mr-3 text-purple-600" />
                  <span className="font-medium">{guide.agencyName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {guide.totalTours}
              </p>
              <p className="text-sm text-gray-600">Tổng tours</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {guide.completedTours}
              </p>
              <p className="text-sm text-gray-600">Hoàn thành</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">
                ₫{formatPrice(guide.revenue)}
              </p>
              <p className="text-sm text-gray-600">Doanh thu</p>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {guide.experience}
              </p>
              <p className="text-sm text-gray-600">Kinh nghiệm</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Languages */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-bold text-gray-900">Ngôn ngữ</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {guide.languages && guide.languages.length > 0 ? (
                  guide.languages.map((lang, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg font-medium"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Chưa cập nhật</span>
                )}
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-purple-600 mr-2" />
                <h4 className="font-bold text-gray-900">Chuyên môn</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {guide.specialties && guide.specialties.length > 0 ? (
                  guide.specialties.map((specialty, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-sm rounded-lg font-medium"
                    >
                      {specialty}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Chưa cập nhật</span>
                )}
              </div>
            </div>

            {/* Bio */}
            {guide.bio && (
              <div className="md:col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-gray-600 mr-2" />
                  <h4 className="font-bold text-gray-900">Giới thiệu</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">{guide.bio}</p>
              </div>
            )}

            {/* Join Date */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-bold text-gray-900">Ngày tham gia</h4>
              </div>
              <p className="text-gray-700">
                {guide.joinDate
                  ? new Date(guide.joinDate).toLocaleDateString("vi-VN")
                  : "Chưa cập nhật"}
              </p>
            </div>

            {/* Last Active */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-orange-600 mr-2" />
                <h4 className="font-bold text-gray-900">Hoạt động gần nhất</h4>
              </div>
              <p className="text-gray-700">
                {guide.lastActive
                  ? new Date(guide.lastActive).toLocaleDateString("vi-VN")
                  : "Chưa có dữ liệu"}
              </p>
            </div>
          </div>

          {/* Status Reason */}
          {guide.statusReason && guide.activityStatus === "suspended" && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
              <h4 className="font-bold text-red-900 mb-2">Lý do tạm ngừng:</h4>
              <p className="text-red-700">{guide.statusReason}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetailModal;
