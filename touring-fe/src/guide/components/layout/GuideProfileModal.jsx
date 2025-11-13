import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Star,
  Clock,
  Award,
  Shield,
  Languages,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGuideProfile } from "../../../TravelAgency/guideAPI"; // 🧩 import API function (moved to TravelAgency)

const GuideProfileModal = ({
  show = true,
  onClose = () => {},
  profileData,
}) => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profileData) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const data = await getGuideProfile();
          setApiData(data);
        } catch (error) {
          console.error("Failed to fetch guide profile:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [profileData]);

  const data = profileData || apiData || {
    name: "Hướng dẫn viên",
    email: "",
    phone: "",
    location: "",
    experience: "",
    languages: [],
    rating: 0,
    totalTours: 0,
    responseTime: "",
    availability: "Available",
    specialties: [],
    joinedDate: new Date().toISOString().split('T')[0],
    bio: ""
  }; // fallback data

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Modal chính */}
          <motion.div
            className="bg-white rounded-4xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-gray-700 text-sm leading-relaxed max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-gray-100">
              {/* Nút đóng */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-[#02A0AA] via-[#029ca6] to-[#0298a2] p-10 text-white flex items-center gap-18 mb-10 mt-15 mx-22 shadow-xl rounded-3xl">
                <img
                  src={data.avatar}
                  alt={data.firstName}
                  className="w-24 h-30 rounded-3xl border-4 border-white shadow-md"
                />
                <div>
                  <h2 className="text-xl font-bold">{data.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-white" />
                    <span className="text-sm text-white">Đã xác minh</span>
                  </div>
                  <p className="text-white opacity-90 text-sm mt-2">
                    {data.location}
                  </p>
                  <p className="text-white opacity-90 text-sm mt-2">
                    <b>Chuyên môn:</b>
                    <ul className="list-disc list-inside mt-1">
                      {data.specialties.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </p>
                </div>
              </div>

              {/* Nội dung chính */}
              <div className="text-gray-700 text-sm leading-relaxed space-y-6 mx-13 my-7">
                {/* Giới thiệu */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Giới thiệu
                  </h3>
                  <p>{data.bio}</p>
                </div>

                {/* Thông tin liên hệ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{data.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{data.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{data.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Kinh nghiệm: {data.experience}</span>
                  </div>
                </div>

                {/* Thống kê */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-lg font-semibold">{data.rating}★</p>
                    <p className="text-xs text-gray-500">Đánh giá</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Award className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                    <p className="text-lg font-semibold">
                      {data.toursConducted}
                    </p>
                    <p className="text-xs text-gray-500">Tour đã hướng dẫn</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-semibold">{data.responseTime}</p>
                    <p className="text-xs text-gray-500">Phản hồi trung bình</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <Shield className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-semibold">{data.availability}</p>
                    <p className="text-xs text-gray-500">Trạng thái</p>
                  </div>
                </div>

                {/* Ngôn ngữ & Chuyên môn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Ngôn ngữ */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Languages className="w-5 h-5 text-[#02A0AA]" /> Ngôn ngữ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#f0fdfd] text-[#02A0AA] rounded-full text-sm font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chuyên môn */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#02A0AA]" /> Chuyên môn
                    </h3>
                    <div className="space-y-1">
                      {data.specialties.map((specialty, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#02A0AA] rounded-full"></div>
                          <span>{specialty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GuideProfileModal;
