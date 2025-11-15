/* eslint-disable no-unused-vars */
// pages/DiscoverWrapped.jsx - Spotify Wrapped-style top 3 zones reveal
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Star,
  Heart,
  ArrowRight,
  ChevronRight,
  Eye,
} from "lucide-react";

// Emoji map for vibes
const VIBE_EMOJI = {
  photo: "📸",
  nature: "🌿",
  local: "🏘️",
  history: "📜",
  culture: "🏛️",
  food: "🍜",
  beach: "🏖️",
  temple: "⛩️",
  sunset: "🌅",
  view: "🏞️",
  architecture: "🏛️",
  nightlife: "🍻",
  adventure: "🗺️",
  market: "🏪",
  shopping: "🛍️",
  cave: "🕳️",
};

// SVG animated sparkles icon
const SparklesIcon = ({ className = "w-24 h-24" }) => (
  <motion.svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <motion.path
      d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
      fill="url(#sparkle1)"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
    <motion.path
      d="M19 4L19.5 6.5L22 7L19.5 7.5L19 10L18.5 7.5L16 7L18.5 6.5L19 4Z"
      fill="url(#sparkle2)"
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
    />
    <motion.path
      d="M5 14L5.5 16L7 16.5L5.5 17L5 19L4.5 17L3 16.5L4.5 16L5 14Z"
      fill="url(#sparkle3)"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
    />
    <defs>
      <linearGradient id="sparkle1" x1="12" y1="2" x2="12" y2="18" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCD34D" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="sparkle2" x1="19" y1="4" x2="19" y2="10" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="sparkle3" x1="5" y1="14" x2="5" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="1" stopColor="#FBBF24" />
      </linearGradient>
    </defs>
  </motion.svg>
);

// Gradient backgrounds for cards - using brand color #02A0AA
const GRADIENTS = [
  {
    card: "from-[#02A0AA]/90 via-cyan-500/90 to-teal-500/90",
    badge: "from-[#02A0AA] to-cyan-500",
    progress: "from-[#02A0AA] to-cyan-500",
  },
  {
    card: "from-[#02A0AA]/90 via-teal-500/90 to-emerald-500/90",
    badge: "from-[#02A0AA] to-teal-500",
    progress: "from-[#02A0AA] to-emerald-500",
  },
  {
    card: "from-cyan-500/90 via-[#02A0AA]/90 to-blue-500/90",
    badge: "from-cyan-400 to-[#02A0AA]",
    progress: "from-cyan-400 to-[#02A0AA]",
  },
];

export default function DiscoverWrapped() {
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  const topZones = data?.zones?.slice(0, 3) || [];
  const totalSlides = topZones.length + 1; // +1 for intro slide

  useEffect(() => {
    const navigationData = location.state?.data;
    if (!navigationData || !navigationData.zones?.length) {
      navigate("/intinerary-creator");
      return;
    }
    setData(navigationData);

    // Show skip button after 2 seconds
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, [location.state, navigate]);

  // Auto-advance intro slide
  useEffect(() => {
    if (currentSlide === 0) {
      const timer = setTimeout(() => setCurrentSlide(1), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleViewAll();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleViewAll = () => {
    // Set flag to indicate user came from Wrapped view
    try {
      window.sessionStorage.setItem('from_wrapped', 'true');
    } catch (err) {
      console.error('SessionStorage error:', err);
    }
    navigate("/discover-results", { state: { data } });
  };

  const handleZoneClick = (zone) => {
    // Clear the flag since user is going directly to zone detail
    try {
      window.sessionStorage.removeItem('from_wrapped');
    } catch (err) {
      console.error('SessionStorage error:', err);
    }
    
    navigate(`/zone/${zone.id}`, {
      state: {
        zone,
        prefs: data?.prefs,
        data,
      },
    });
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#02A0AA]/20 border-t-[#02A0AA] rounded-full"
        />
      </div>
    );
  }

  // Format match reasons
  const formatReasons = (zone) => {
    const reasons = [];


    if (zone.embedScore > 0.5) {
      reasons.push(`${(zone.finalScore * 100).toFixed(0)}% tương đồng theo AI`);
    }

    if (zone.distanceKm && zone.distanceKm < 50) {
      reasons.push(`Chỉ ${zone.distanceKm.toFixed(0)}km từ vị trí bạn`);
    }

    if (zone.tags?.some(t => data.prefs?.vibes?.includes(t))) {
      const matchedTags = zone.tags.filter(t => data.prefs?.vibes?.includes(t));
      reasons.push(`Có ${matchedTags.map(t => VIBE_EMOJI[t] || t).join(', ')}`);
    }

    return reasons.length > 0 ? reasons : ["Phù hợp với phong cách của bạn"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 text-slate-900 overflow-hidden relative">
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
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl"
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
      {/* Skip button */}
      <AnimatePresence>
        {showSkip && currentSlide < totalSlides - 1 && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={handleViewAll}
            className="fixed top-6 right-6 z-50 px-5 py-2.5 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl rounded-full text-sm font-semibold backdrop-blur-sm transition-all text-slate-700 border border-slate-200"
          >
            <span className="flex items-center gap-2">
              Xem tất cả <Eye className="w-4 h-4" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-white/10">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentSlide
                ? "bg-white w-8"
                : "bg-white/40 hover:bg-white/60 w-2"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slides */}
      <AnimatePresence mode="wait">
        {/* Intro Slide */}
        {currentSlide === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 relative z-10"
          >
            <div className="text-center max-w-2xl">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 1, bounce: 0.4 }}
                className="mb-8"
              >
                <SparklesIcon className="w-32 h-32 mx-auto" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#02A0AA] via-cyan-600 to-teal-600 bg-clip-text text-transparent"
              >
                Địa điểm dành riêng cho bạn
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-xl md:text-2xl text-slate-600 mb-10 font-medium"
              >
                Dựa trên sở thích của bạn, chúng tôi đã tìm ra{" "}
                <span className="font-bold text-[#02A0AA]">{data.zones?.length}</span> zones phù hợp
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-[#02A0AA]/30"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-[#02A0AA]/30 border-t-[#02A0AA] rounded-full"
                />
                <span className="text-slate-700 font-medium">Đang chuẩn bị top 3 zones đặc biệt...</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Zone Slides */}
        {topZones.map((zone, index) => {
          const slideIndex = index + 1;
          if (currentSlide !== slideIndex) return null;

          const gradient = GRADIENTS[index % GRADIENTS.length];
          const reasons = formatReasons(zone);
          const rank = index + 1;

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen flex items-center justify-center p-4 md:p-6 relative z-10"
            >
              <div className="max-w-lg w-full">
                {/* Rank Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                  className="text-center mb-4"
                >
                  <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900/80 backdrop-blur-md rounded-full shadow-xl border border-white/20">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-lg font-semibold text-white">Top #{rank}</span>
                  </div>
                </motion.div>

                {/* Main Card - Santorini Villa Style */}
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="rounded-3xl shadow-2xl overflow-hidden w-full"
                >
                  {/* Zone Image with Overlay Content */}
                  <div className="relative">
                    {zone.heroImg && (
                      <motion.img
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                        src={zone.heroImg}
                        alt={zone.name}
                        className="w-full h-[550px] md:h-[600px] object-cover"
                      />
                    )}
                    
                    {/* Blue to Black Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-slate-800/60 to-black/95" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6 space-y-4">
                      {/* Zone Name & Location */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                          {zone.name}
                        </h2>
                        <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          <span>{zone.province}</span>
                          {zone.distanceKm && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-white/60" />
                              <span>{zone.distanceKm.toFixed(0)} km</span>
                            </>
                          )}
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                          {zone.desc || "Discover this amazing destination perfectly matched to your travel preferences and style."}
                        </p>
                      </motion.div>

                      {/* Match Reasons */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-2"
                      >
                        {reasons.slice(0, 3).map((reason, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + i * 0.1 }}
                            className="flex items-start gap-2 px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20"
                          >
                            <Heart className="w-4 h-4 text-white/90 fill-white/90 shrink-0 mt-0.5" />
                            <span className="text-white/95 text-sm leading-relaxed">{reason}</span>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Action Buttons */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="pt-2"
                      >
                        <button
                          onClick={() => handleZoneClick(zone)}
                          className="w-full bg-white hover:bg-slate-50 text-slate-900 font-semibold py-4 px-6 rounded-2xl transition-all hover:shadow-xl hover:-translate-y-0.5 text-base mb-2"
                        >
                          Khám phá ngay
                        </button>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleViewAll}
                            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem tất cả</span>
                          </button>
                          
                          {index < topZones.length - 1 && (
                            <button
                              onClick={handleNext}
                              className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                            >
                              <span>Tiếp theo</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="text-center mt-8 text-slate-600 text-sm"
                >
                  {index < topZones.length - 1 ? (
                    <>Vuốt hoặc nhấn "Tiếp theo" để xem zone khác</>
                  ) : (
                    <>Đây là zone cuối cùng trong top 3. Khám phá hoặc xem tất cả {data.zones?.length} zones!</>
                  )}
                </motion.p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Keyboard navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-between pointer-events-none z-40">
        {currentSlide > 0 && (
          <button
            onClick={handlePrevious}
            className="pointer-events-auto px-4 py-2 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all"
          >
            ← Trước
          </button>
        )}
        
        {currentSlide < totalSlides - 1 && (
          <button
            onClick={handleNext}
            className="pointer-events-auto px-4 py-2 bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-md rounded-full border border-white/20 text-white transition-all ml-auto"
          >
            Tiếp →
          </button>
        )}
        
        {currentSlide === totalSlides - 1 && (
          <button
            onClick={handleViewAll}
            className="pointer-events-auto px-5 py-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full text-slate-900 font-semibold transition-all ml-auto shadow-lg"
          >
            Xem tất cả zones
          </button>
        )}
      </div>
    </div>
  );
}
