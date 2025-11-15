/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, MapPin, Heart, Award, ChevronRight, ArrowRight, Compass } from 'lucide-react';
import { useAuth } from '../auth/context';
import { useNavigate } from 'react-router-dom';

/**
 * Discovery Wrapped - Spotify Wrapped-style multi-slide reveal
 * Shows user's travel profile with animations
 * Final slide: "Tìm lịch trình" → Navigate to DiscoverResults with auto zones
 */

// Vibe configuration (English key from backend → Vietnamese display + emoji)
const VIBE_CONFIG = {
  'culture': { label: 'Văn hóa', emoji: '🏛️' },
  'history': { label: 'Lịch sử', emoji: '📜' },
  'adventure': { label: 'Mạo hiểm', emoji: '🏔️' },
  'nature': { label: 'Thiên nhiên', emoji: '🌿' },
  'food': { label: 'Ẩm thực', emoji: '🍜' },
  'beach': { label: 'Biển', emoji: '🏖️' },
  'temple': { label: 'Tâm linh', emoji: '⛩️' },
  'photo': { label: 'Nhiếp ảnh', emoji: '📸' },
  'view': { label: 'Cảnh đẹp', emoji: '🏞️' },
  'sunset': { label: 'Hoàng hôn', emoji: '🌅' },
  'local': { label: 'Bản địa', emoji: '🏘️' },
  'market': { label: 'Chợ', emoji: '🏪' },
  'shopping': { label: 'Mua sắm', emoji: '🛍️' },
  'nightlife': { label: 'Nightlife', emoji: '🍻' },
  'architecture': { label: 'Kiến trúc', emoji: '🏛️' },
  'cave': { label: 'Hang động', emoji: '🕳️' },
  'relaxation': { label: 'Thư giãn', emoji: '🧘' },
  'mountain': { label: 'Núi', emoji: '⛰️' },
};

const DiscoveryWrappedNew = () => {
  const { withAuth } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Auto-advance slides (except last one)
  useEffect(() => {
    if (!profile || !autoAdvance) return;
    
    const totalSlides = 5; // Intro, Stats, Vibes, Provinces, CTA
    if (currentSlide < totalSlides - 1) {
      const timer = setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
      }, 3500); // 3.5s per slide
      
      return () => clearTimeout(timer);
    }
  }, [currentSlide, profile, autoAdvance]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await withAuth('/api/recommendations/profile');
      setProfile(data);
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || 'Không thể tải hồ sơ của bạn');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setAutoAdvance(false);
    setCurrentSlide(prev => prev + 1);
  };

  const handleFindTrip = () => {
    // Handle empty profile - redirect to itinerary creator
    if (!profile || !profile.topVibes || profile.topVibes.length === 0) {
      navigate('/intinerary-creator', {
        state: {
          fromWrapped: true,
          message: '🎯 Bạn chưa có đủ dữ liệu. Hãy bắt đầu tạo lịch trình của bạn!'
        }
      });
      return;
    }
    
    // Navigate to DiscoverResults với profile data
    // Skip ViDoi (vibe selection), load zones directly from profile
    const topVibes = profile.topVibes.map(v => v.vibe); // English tags for matching
    
    // Get interactionSummary for freeText (hybrid search)
    const freeText = profile.raw?.interactionSummary || '';
    
    navigate('/discover-results', {
      state: {
        fromWrapped: true,
        vibes: topVibes, // English tags: ['culture', 'adventure', 'nature']
        freeText, // Vietnamese text: "xem tour Hạ Long, lưu tour Sapa..."
        profile: {
          confidence: profile.summary?.confidence || 0,
          travelStyle: profile.summary?.travelStyle || 'Explorer',
          topVibes,
          topProvinces: profile.topProvinces?.map(p => p.province) || []
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6"
          >
            <Sparkles className="w-20 h-20 text-[#02A0AA] mx-auto" />
          </motion.div>
          <p className="text-white text-2xl font-bold">
            Đang phân tích hành trình của bạn...
          </p>
        </motion.div>
      </div>
    );
  }

  // Don't show error screen - handle empty profile in slides instead
  // if (error) { ... }

  // Handle empty profile for new users
  const hasData = profile && profile.summary && profile.topVibes && profile.topVibes.length > 0;
  
  const { summary, topVibes = [], topProvinces = [], eventBreakdown } = profile || {};
  
  const slides = hasData ? [
    { id: 'intro', component: IntroSlide },
    { id: 'stats', component: StatsSlide },
    { id: 'vibes', component: VibesSlide },
    { id: 'provinces', component: ProvincesSlide },
    { id: 'cta', component: CTASlide }
  ] : [
    { id: 'intro', component: IntroSlide },
    { id: 'empty', component: EmptyProfileSlide }
  ];

  const CurrentSlideComponent = slides[currentSlide]?.component;

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(2,160,170,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.3) 0%, transparent 50%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {CurrentSlideComponent && (
          <CurrentSlideComponent
            key={currentSlide}
            profile={profile}
            onNext={handleNext}
            onFindTrip={handleFindTrip}
            isLast={currentSlide === slides.length - 1}
          />
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
        {slides.map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === currentSlide ? 'w-8 bg-[#02A0AA]' : 'w-2 bg-slate-600'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};

// ========== SLIDE COMPONENTS ==========

function IntroSlide({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative z-10"
      onClick={onNext}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 1, bounce: 0.5 }}
        className="mb-8"
      >
        <Sparkles className="w-24 h-24 text-[#02A0AA] mx-auto" />
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-6xl md:text-7xl font-bold text-white mb-4"
      >
        Discovery Wrapped
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl md:text-2xl text-slate-400"
      >
        Hành trình khám phá của bạn
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-20 text-slate-500 text-sm"
      >
        Nhấn vào bất kỳ đâu để tiếp tục
      </motion.div>
    </motion.div>
  );
}

function StatsSlide({ profile, onNext }) {
  const { summary, eventBreakdown } = profile;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative z-10"
      onClick={onNext}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2, bounce: 0.6 }}
        className="mb-8"
      >
        <Award className="w-20 h-20 text-[#02A0AA] mx-auto" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl md:text-6xl font-bold text-white mb-6"
      >
        {summary.engagementLevel}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-slate-400 mb-12"
      >
        Cấp độ khám phá của bạn
      </motion.p>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring", bounce: 0.5 }}
        className="text-8xl font-bold bg-linear-to-r from-[#02A0AA] via-cyan-400 to-teal-400 bg-clip-text text-transparent mb-4"
      >
        {summary.totalInteractions}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-lg text-slate-500"
      >
        tương tác trong tuần qua
      </motion.p>

      {/* Activity breakdown mini */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="mt-12 grid grid-cols-2 gap-4 max-w-md"
      >
        {Object.entries(eventBreakdown).map(([event, count], idx) => (
          <motion.div
            key={event}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3 + idx * 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
          >
            <div className="text-3xl font-bold text-[#02A0AA]">{count}</div>
            <div className="text-xs text-slate-400">
              {event === 'tour_view' && '🔍 Xem tour'}
              {event === 'tour_bookmark' && '⭐ Lưu tour'}
              {event === 'tour_booking_complete' && '✅ Đặt tour'}
              {event === 'blog_view' && '📖 Đọc blog'}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function VibesSlide({ profile, onNext }) {
  const { topVibes, summary } = profile;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative z-10"
      onClick={onNext}
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-5xl font-bold text-white mb-12"
      >
        Bạn thích gì nhất?
      </motion.h2>

      <div className="w-full max-w-2xl space-y-6">
        {topVibes.slice(0, 5).map((item, idx) => {
          const vibeConfig = VIBE_CONFIG[item.vibe] || { label: item.vibe, emoji: '✨' };
          
          return (
            <motion.div
              key={item.vibe}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.15, type: "spring" }}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="text-5xl">{vibeConfig.emoji}</div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-white">
                    {vibeConfig.label}
                  </span>
                {idx === 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.15, type: "spring", bounce: 0.6 }}
                    className="text-2xl"
                  >
                    👑
                  </motion.div>
                )}
              </div>
              
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.score / topVibes[0].score) * 100}%` }}
                  transition={{ delay: 0.6 + idx * 0.15, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-linear-to-r from-[#02A0AA] to-cyan-400 rounded-full"
                />
              </div>
            </div>

            <div className="text-lg font-semibold text-slate-400">
              #{idx + 1}
            </div>
          </motion.div>
        );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/20"
      >
        <div className="text-sm text-slate-400 mb-1">Độ chính xác được ghi nhận</div>
        <div className="text-4xl font-bold text-[#02A0AA]">
          {summary.confidence}%
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProvincesSlide({ profile, onNext }) {
  const { topProvinces } = profile;
  
  // Skip slide if no provinces (use useEffect to avoid setState in render)
  useEffect(() => {
    if (!topProvinces || topProvinces.length === 0) {
      onNext();
    }
  }, [topProvinces, onNext]);
  
  // Return null if skipping (will be replaced by next slide via useEffect)
  if (!topProvinces || topProvinces.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      exit={{ opacity: 0, rotateY: 90 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative z-10"
      onClick={onNext}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
        className="mb-8"
      >
        <MapPin className="w-20 h-20 text-[#02A0AA] mx-auto" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-5xl font-bold text-white mb-12"
      >
        Điểm đến yêu thích
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {topProvinces.slice(0, 3).map((item, idx) => (
          <motion.div
            key={item.province}
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.4 + idx * 0.2, 
              type: "spring", 
              bounce: 0.6 
            }}
            className="relative"
          >
            {/* Medal position */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + idx * 0.2, type: "spring", bounce: 0.8 }}
              className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-6xl z-10"
            >
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
            </motion.div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 pt-12 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-3xl font-bold text-white mb-2">
                {item.province}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function CTASlide({ profile, onFindTrip, isLast }) {
  const { summary } = profile;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative z-10"
    >
      <motion.div
        initial={{ scale: 0, rotate: 360 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 1, bounce: 0.6 }}
        className="mb-8"
      >
        <Compass className="w-24 h-24 text-[#02A0AA] mx-auto" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-6xl font-bold text-white mb-6"
      >
        Sẵn sàng khám phá?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xl text-slate-400 mb-12 max-w-2xl"
      >
        Dựa trên <span className="text-[#02A0AA] font-bold">{summary.totalInteractions} tương tác</span> của bạn, 
        chúng tôi đã tìm ra những địa điểm hoàn hảo dành riêng cho bạn
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onFindTrip}
        className="group relative bg-linear-to-r from-[#02A0AA] via-cyan-500 to-teal-500 text-white text-2xl font-bold px-12 py-6 rounded-full shadow-2xl hover:shadow-[#02A0AA]/50 transition-all"
      >
        <span className="flex items-center gap-3">
          Tìm lịch trình ngay
          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </span>
        
        {/* Animated glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-linear-to-r from-[#02A0AA] to-cyan-400 opacity-0 blur-xl"
          animate={{
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 flex items-center gap-2 text-slate-500 text-sm"
      >
        <Heart className="w-4 h-4" />
        <span>Được cá nhân hóa dựa trên phong cách: <span className="text-[#02A0AA] font-semibold">{summary.travelStyle}</span></span>
      </motion.div>
    </motion.div>
  );
}

// ========== EMPTY PROFILE SLIDE (NEW USERS) ==========

function EmptyProfileSlide({ onFindTrip }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative z-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 1, bounce: 0.6 }}
        className="mb-8"
      >
        <Sparkles className="w-24 h-24 text-[#02A0AA] mx-auto" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl md:text-6xl font-bold text-white mb-6"
      >
        Chào mừng bạn đến!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xl text-slate-400 mb-8 max-w-2xl"
      >
        Bạn chưa có dữ liệu tương tác. Hãy <span className="text-[#02A0AA] font-bold">chọn sở thích</span> để chúng tôi gợi ý lịch trình phù hợp nhất!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-md mb-8"
      >
        <div className="text-sm text-slate-400 mb-4">💡 Gợi ý:</div>
        <ul className="text-left text-slate-300 space-y-2">
          <li>✅ Xem tour để khám phá</li>
          <li>✅ Lưu tour yêu thích</li>
          <li>✅ Đặt tour để trải nghiệm</li>
        </ul>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onFindTrip}
        className="group relative bg-linear-to-r from-[#02A0AA] via-cyan-500 to-teal-500 text-white text-2xl font-bold px-12 py-6 rounded-full shadow-2xl hover:shadow-[#02A0AA]/50 transition-all"
      >
        <span className="flex items-center gap-3">
          Chọn sở thích ngay
          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </span>
        
        {/* Animated glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-linear-to-r from-[#02A0AA] to-cyan-400 opacity-0 blur-xl"
          animate={{
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-slate-500 text-sm"
      >
        Sau khi chọn, hệ thống sẽ tự động gợi ý lịch trình
      </motion.div>
    </motion.div>
  );
}

export default DiscoveryWrappedNew;
