import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  PlayCircle,
  Pause,
  Play
} from "lucide-react";
import TravelBlog from "./TravelBlog";
// Import data from heroData.js
import { heroSlides } from "../mockdata/heroData";
import VideoModal from "./VideoModal";
const TourHeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const timer = setInterval(() => {
      if (!isTransitioning) {
        setActiveSlide((prev) => (prev + 1) % heroSlides.length);
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoPlay, isTransitioning]);

  // Preload next image
  useEffect(() => {
    const next = (activeSlide + 1) % heroSlides.length;
    const img = new Image();
    img.src = heroSlides[next].images.desktop;
  }, [activeSlide]);

  // Smooth slide transition with lock
  const changeSlide = useCallback((newIndex, direction = 'next') => {
    if (isTransitioning || newIndex === activeSlide) return;
    
    setIsTransitioning(true);
    setActiveSlide(newIndex);
    
    // Reset transition lock after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
  }, [activeSlide, isTransitioning]);

  const nextSlide = useCallback(() => {
    const newIndex = (activeSlide + 1) % heroSlides.length;
    changeSlide(newIndex, 'next');
  }, [activeSlide, changeSlide]);

  const prevSlide = useCallback(() => {
    const newIndex = (activeSlide - 1 + heroSlides.length) % heroSlides.length;
    changeSlide(newIndex, 'prev');
  }, [activeSlide, changeSlide]);

  const goToSlide = useCallback((index) => {
    if (index !== activeSlide) {
      const direction = index > activeSlide ? 'next' : 'prev';
      changeSlide(index, direction);
    }
  }, [activeSlide, changeSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlay(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide]);

  const handleImageLoad = (id) =>
    setImageLoaded((prev) => ({ ...prev, [id]: true }));

  const ResponsiveImage = ({ slide, index, isActive }) => (
    <picture className="w-full h-full">
      <source
        media="(min-width: 1024px)"
        srcSet={slide.images.webp}
        type="image/webp"
      />
      <source
        media="(min-width: 768px)"
        srcSet={slide.images.tablet}
        type="image/jpeg"
      />
      <source
        media="(max-width: 767px)"
        srcSet={slide.images.mobile}
        type="image/jpeg"
      />
      <img
        src={slide.images.desktop}
        alt={slide.location}
        className={`w-full h-full object-cover transition-all duration-700 ease-out
          ${
            imageLoaded[slide.id]
              ? isActive
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-4 scale-105"
              : "opacity-0"
          }`}
        onLoad={() => handleImageLoad(slide.id)}
        loading={index <= 1 ? "eager" : "lazy"}
        sizes="100vw"
        style={{ objectPosition: "center", aspectRatio: "16/9" }}
      />
    </picture>
  );

  const current = heroSlides[activeSlide];
  const totalReviews = heroSlides.reduce((sum, slide) => sum + slide.reviews, 0);
  const avgRating = (heroSlides.reduce((sum, slide) => sum + slide.rating, 0) / heroSlides.length).toFixed(1);

  return (
    <section 
      className="relative h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh] overflow-hidden cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-out pointer-events-none ${
              index === activeSlide ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <ResponsiveImage
              slide={slide}
              index={index}
              isActive={index === activeSlide}
            />
            {/* Dynamic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            {!imageLoaded[slide.id] && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse grid place-items-center">
                <div className="text-white/50 text-sm">Loading...</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Navigation Arrows */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning}
        className="group absolute top-1/2 -translate-y-1/2 z-30
                   left-4 md:left-6 lg:left-8
                   bg-white/10 hover:bg-white/20 backdrop-blur-md 
                   border border-white/20 hover:border-white/40
                   text-white rounded-full p-3 lg:p-4
                   transition-all duration-300 
                   hover:scale-110 active:scale-95 
                   disabled:opacity-50 disabled:scale-100
                   shadow-lg hover:shadow-xl
                   focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Slide trước"
      >
        <ChevronLeft 
          className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 
                     group-hover:-translate-x-1 group-hover:drop-shadow-md" 
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className="group absolute top-1/2 -translate-y-1/2 z-30
                   right-4 md:right-6 lg:right-8
                   bg-white/10 hover:bg-white/20 backdrop-blur-md 
                   border border-white/20 hover:border-white/40
                   text-white rounded-full p-3 lg:p-4
                   transition-all duration-300 
                   hover:scale-110 active:scale-95 
                   disabled:opacity-50 disabled:scale-100
                   shadow-lg hover:shadow-xl
                   focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Slide tiếp"
      >
        <ChevronRight 
          className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 
                     group-hover:translate-x-1 group-hover:drop-shadow-md" 
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-l from-sky-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      {/* Main Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_300px]">
            {/* Left Content */}
            <div className="text-white text-center lg:text-left space-y-6 px-2 py-6">
              {/* Location with animation */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sky-300">
                <MapPin className="w-4 h-4 animate-pulse" />
                <span className="text-sm md:text-base font-medium tracking-wide">
                  {current.location}
                </span>
              </div>

              {/* Title & subtitle with stagger animation */}
              <div className="space-y-3">
                <h1 className="font-bold leading-tight text-2xl md:text-4xl xl:text-5xl
                               transform transition-all duration-700 delay-100">
                  {current.title}
                </h1>
                <p className="text-white/85 max-w-2xl mx-auto lg:mx-0 text-sm md:text-lg leading-relaxed
                              transform transition-all duration-700 delay-200">
                  {current.subtitle}
                </p>
              </div>

              {/* Enhanced Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm
                              transform transition-all duration-700 delay-300">
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-semibold">{current.rating}</span>
                  <span className="text-white/70 hidden sm:inline">
                    ({current.reviews.toLocaleString('vi-VN')} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
                  <Clock className="w-4 h-4" />
                  <span>{current.duration}</span>
                </div>
                <div className="px-4 py-2 rounded-full text-sky-200 bg-sky-500/20 border border-sky-400/30 backdrop-blur-sm">
                  <span>{current.category}</span>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4
                              transform transition-all duration-700 delay-400">
                <button className="group w-full sm:w-auto bg-gradient-to-r from-[#02A0AA] to-[#02838B] hover:from-[#0297A0] hover:to-[#026F77]
                                   text-white font-semibold rounded-full px-8 py-4 
                                   transition-all duration-300 hover:scale-105 active:scale-95
                                   shadow-lg hover:shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">Đặt Tour {current.price}</span>
                </button>
                <button
  onClick={() => {
    setVideoUrl(current.videoUrl); // lấy từ slide hiện tại
    setShowVideo(true);
  }}
  className="group w-full sm:w-auto flex items-center justify-center gap-3 
             bg-white/10 backdrop-blur-md border border-white/30 text-white 
             rounded-full px-6 py-4 hover:bg-white/20 
             transition-all duration-300 hover:scale-105 active:scale-95">
  <PlayCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
  <span>Xem Video</span>
</button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Slide Indicators */}
      <div className="absolute z-30 left-1/2 -translate-x-1/2 bottom-4">
  <div className="flex gap-2 bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
    {heroSlides.map((_, i) => (
      <button
        key={i}
        onClick={() => goToSlide(i)}
        disabled={isTransitioning}
        className={`relative rounded-full transition-all duration-500 overflow-hidden
                   focus:outline-none disabled:opacity-50 ${
          i === activeSlide
            ? "bg-[#02A0AA] w-5 h-2.5 scale-110 shadow-md"
            : "bg-white/50 hover:bg-white/80 w-2.5 h-2.5 hover:scale-110"
        }`}
        aria-label={`Đi đến slide ${i + 1}`}
      >
        {i === activeSlide && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#02A0AA] to-[#02838B]" />
        )}
      </button>
    ))}
  </div>
</div>


      {/* Enhanced Floating Stats */}
      <div className="absolute z-20 hidden lg:block bottom-8 right-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-4 shadow-xl">
          <div className="text-white">
            <div className="text-lg font-bold mb-1">{avgRating}★ Đánh giá trung bình</div>
            <div className="text-white/70 text-sm">{totalReviews.toLocaleString('vi-VN')}+ du khách</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-30">
        <div 
          className="h-full bg-gradient-to-r bg-gradient-to-r from-[#02A0AA] to-[#02838B] transition-all duration-300"
          style={{ 
            width: `${((activeSlide + 1) / heroSlides.length) * 100}%` 
          }}
        />
      </div>
      <VideoModal 
  videoUrl={showVideo ? videoUrl : null} 
  onClose={() => setShowVideo(false)} 
/>
    </section>
  );
};

export default TourHeroSection;