/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, MapPin, Calendar, Award, ArrowLeft, ChevronRight, Heart, Compass, Map } from 'lucide-react';
import { useAuth } from '../auth/context';
import logger from "../utils/logger";
import { useNavigate } from 'react-router-dom';

/**
 * Discovery Wrapped - Spotify-style reveal of user's travel profile
 * Multi-slide animation showing stats, vibes, provinces, travel style
 * After completion: navigate to DiscoverResults with auto-loaded zones
 */
const DiscoveryWrapped = () => {
  const { withAuth } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await withAuth('/api/recommendations/profile');
      setProfile(data);
    } catch (err) {
      logger.error('Fetch profile error:', err);
      setError(err.response?.data?.message || 'Unable to load your profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden flex items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-[#02A0AA]/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Sparkles className="w-16 h-16 text-[#02A0AA] mx-auto" />
          </motion.div>
          <p className="text-slate-700 text-2xl font-bold">
            Đang phân tích hành trình của bạn...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-brrom-slate-50 via-blue-50 to-purple-50 relative overflow-hidden flex items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-[#02A0AA]/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center shadow-2xl relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <Sparkles className="w-16 h-16 text-[#02A0AA] mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Chưa có dữ liệu</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/tours')}
            className="bg-linear-to-r from-[#02A0AA] to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Khám phá ngay
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const { summary, topVibes, topProvinces, eventBreakdown } = profile;

  return (
    <div className="min-h-screen bg-linear-to-r from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden py-12 px-4">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-[#02A0AA]/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/60 shadow-md hover:shadow-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Quay lại</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1, bounce: 0.4 }}
            className="mb-4"
          >
            <Sparkles className="w-16 h-16 text-[#02A0AA] mx-auto" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-3 bg-linear-to-rrom-[#02A0AA] via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Discovery Wrapped
          </h1>
          <p className="text-xl text-slate-600">
            Hành trình khám phá của bạn trong tuần này
          </p>
        </motion.div>

        {/* Engagement Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl ring-1 ring-slate-200/60"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Award className="w-10 h-10 text-[#02A0AA]" />
                </motion.div>
                <h2 className="text-3xl font-bold text-slate-900">{summary.engagementLevel}</h2>
              </div>
              <p className="text-slate-600">Cấp độ khám phá của bạn</p>
            </div>
            <div className="text-right">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
                className="text-5xl font-bold bg-gradient-to-r from-[#02A0AA] to-cyan-600 bg-clip-text text-transparent"
              >
                {summary.totalInteractions}
              </motion.div>
              <p className="text-sm text-slate-600">tương tác</p>
            </div>
          </div>
          
          {/* Travel Style Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-6 border-t border-slate-200"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#02A0AA]/10 to-cyan-600/10 px-6 py-3 rounded-full border border-[#02A0AA]/20">
              <TrendingUp className="w-5 h-5 text-[#02A0AA]" />
              <span className="font-semibold text-slate-900">Phong cách: {summary.travelStyle}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Activity Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl ring-1 ring-slate-200/60"
        >
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-[#02A0AA]" />
            <h2 className="text-2xl font-bold text-slate-900">Tuần này bạn đã làm gì?</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(eventBreakdown).map(([event, count], idx) => (
              <motion.div
                key={event}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="bg-linear-to-r from-slate-50 to-white rounded-2xl p-4 text-center border border-slate-200/60 shadow-md hover:shadow-lg transition-all"
              >
                <div className="text-3xl font-bold text-[#02A0AA]">{count}</div>
                <div className="text-sm text-slate-600 mt-1">
                  {event === 'tour_view' && '🔍 Xem tour'}
                  {event === 'tour_bookmark' && '⭐ Lưu tour'}
                  {event === 'tour_booking_complete' && '🎫 Đặt tour'}
                  {event === 'blog_view' && '📖 Đọc blog'}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Vibes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl ring-1 ring-slate-200/60"
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-[#02A0AA]" />
            <h2 className="text-2xl font-bold text-slate-900">Sở thích của bạn</h2>
          </div>
          
          <div className="space-y-4">
            {topVibes.map((item, idx) => (
              <motion.div
                key={item.vibe}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="text-4xl font-bold text-[#02A0AA]/40 w-12">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-semibold text-slate-900">{item.vibe}</span>
                    <span className="text-sm text-slate-600 font-medium">
                      {Math.round(item.score * 100)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.score / topVibes[0].score) * 100}%` }}
                      transition={{ delay: 0.8 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#02A0AA] to-cyan-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Confidence Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-slate-200 text-center"
          >
            <div className="text-sm text-slate-600 mb-2">Độ tin cậy hồ sơ</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              {summary.confidence}%
            </div>
          </motion.div>
        </motion.div>

        {/* Top Provinces */}
        {topProvinces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl ring-1 ring-slate-200/60"
          >
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-6 h-6 text-[#02A0AA]" />
              <h2 className="text-2xl font-bold text-slate-900">Điểm đến yêu thích</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topProvinces.map((item, idx) => (
                <motion.div
                  key={item.province}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + idx * 0.1, type: "spring", bounce: 0.4 }}
                  whileHover={{ y: -6, scale: 1.05 }}
                  className="bg-linear-to-r from-[#02A0AA]/10 to-cyan-100/50 rounded-2xl p-6 text-center border border-[#02A0AA]/20 shadow-md hover:shadow-xl transition-all"
                >
                  <div className="text-5xl mb-2">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="text-xl font-bold text-slate-900">{item.province}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {Math.round(item.score * 10) / 10} điểm
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/recommendations/tours')}
            className="bg-gradient-to-r from-[#02A0AA] via-cyan-600 to-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-2xl hover:shadow-[0_20px_60px_rgba(2,160,170,0.4)] transition-all"
          >
            🎯 Xem gợi ý tour dành riêng cho bạn
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/recommendations/itinerary')}
            className="block w-full md:w-auto mx-auto bg-white/90 backdrop-blur-lg text-slate-900 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white transition-all shadow-lg border border-slate-200/60"
          >
            ✨ Tạo lộ trình tối ưu
          </motion.button>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-slate-600 text-sm"
        >
          Cập nhật lần cuối: {new Date(summary.lastUpdated).toLocaleDateString('vi-VN')}
        </motion.div>
      </div>
    </div>
  );
};

export default DiscoveryWrapped;
