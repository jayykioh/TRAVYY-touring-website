import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, PlayCircle } from "lucide-react";
import { heroSlides } from "../mockdata/heroData";
import VideoModal from "./VideoModal";

export default function TourHeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  /* ========== AUTO SLIDE ========== */
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      if (!isTransitioning) setActiveSlide((p) => (p + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay, isTransitioning]);

  /* ========== PRELOAD NEXT ========== */
  useEffect(() => {
    const next = (activeSlide + 1) % heroSlides.length;
    const img = new Image();
    img.src = heroSlides[next].images?.desktop || "";
  }, [activeSlide]);

  /* ========== SLIDE CONTROL ========== */
  const changeSlide = useCallback(
    (idx) => {
      if (isTransitioning || idx === activeSlide) return;
      setIsTransitioning(true);
      setActiveSlide(idx);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [activeSlide, isTransitioning]
  );
  const nextSlide = useCallback(() => changeSlide((activeSlide + 1) % heroSlides.length), [activeSlide, changeSlide]);
  const prevSlide = useCallback(() => changeSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length), [activeSlide, changeSlide]);
  const goToSlide  = useCallback((i) => i !== activeSlide && changeSlide(i), [activeSlide, changeSlide]);

  /* ========== SWIPE ========== */
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove  = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd   = () => {
    if (!touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    if (d > 50) nextSlide();
    if (d < -50) prevSlide();
  };

  /* ========== KEYBOARD ========== */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === " ") { e.preventDefault(); setIsAutoPlay((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextSlide, prevSlide]);

  const handleImageLoad = (id) => setImageLoaded((p) => ({ ...p, [id]: true }));

  const current = heroSlides[activeSlide];
  const totalReviews = heroSlides.reduce((s, x) => s + x.reviews, 0);
  const avgRating = (heroSlides.reduce((s, x) => s + x.rating, 0) / heroSlides.length).toFixed(1);

  return (
    <section
      // 🔼 tăng chiều cao so với trước + giữ responsive
      className="relative h-[36rem] md:h-[42rem] lg:h-[48rem] overflow-hidden"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsAutoPlay(false)} onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Slides */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${index === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            aria-hidden={index !== activeSlide}
          >
            {/* ✅ GIỮ NGUYÊN ẢNH CŨ (desktop) */}
            <img
              src={slide.images.desktop}
              alt={slide.title}
              className={`w-full h-full object-cover transition-transform duration-[3000ms] ease-out
                          ${index === activeSlide ? "scale-110" : "scale-105"}
                          ${imageLoaded[slide.id] ? "opacity-100" : "opacity-0"} transition-opacity`}
              onLoad={() => handleImageLoad(slide.id)}
              loading={index <= 1 ? "eager" : "lazy"}
              decoding="async"
            />
            {/* Lớp background đen rõ hơn */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          </div>
        ))}
      </div>

      {/* Arrows (glass) */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning}
        className="group absolute top-1/2 -translate-y-1/2 left-4 z-30 rounded-full p-2.5
                   bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-md
                   hover:bg-white/15 hover:border-white/30 active:scale-95 transition-all disabled:opacity-50"
        aria-label="Slide trước">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className="group absolute top-1/2 -translate-y-1/2 right-4 z-30 rounded-full p-2.5
                   bg-white/10 border border-white/20 backdrop-blur-md text-white shadow-md
                   hover:bg-white/15 hover:border-white/30 active:scale-95 transition-all disabled:opacity-50"
        aria-label="Slide tiếp">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* CONTENT — căn trái toàn bộ */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="w-full mx-auto px-4 md:px-8 lg:px-12 max-w-6xl">
          <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl text-white text-left">
            {/* location chip */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-white/10 border border-white/20 backdrop-blur-md">
              <MapPin className="w-4 h-4" />
              <span className="text-xs md:text-sm font-medium tracking-wide">{current.location}</span>
            </div>

            {/* title */}
            <h1 className="mt-4 font-extrabold leading-[1.1] tracking-tight
                           text-3xl md:text-5xl lg:text-6xl drop-shadow">
              {current.title}
            </h1>

            {/* subtitle */}
            <p className="mt-3 text-white/90 text-sm md:text-base max-w-2xl">
              {current.subtitle}
            </p>

            {/* Chips: rating/duration/category */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* rating */}
              <div className="group flex items-center gap-2 rounded-full px-4 py-2
                              bg-gradient-to-r from-amber-500/25 to-pink-500/25
                              border border-white/20 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/90 text-black font-bold text-xs">
                  {current.rating}
                </div>
                <span className="text-xs md:text-sm font-semibold tracking-wide">
                  {avgRating}★ / {totalReviews.toLocaleString("vi-VN")} reviews
                </span>
              </div>

              {/* duration */}
              <div className="flex items-center gap-2 rounded-full px-4 py-2
                              bg-gradient-to-r from-indigo-500/20 to-cyan-500/20
                              border border-white/20 backdrop-blur-md">
                <Clock className="w-4 h-4" />
                <span className="text-xs md:text-sm">{current.duration}</span>
              </div>

              {/* category */}
              <div className="flex items-center gap-2 rounded-full px-4 py-2
                              bg-gradient-to-r from-emerald-500/20 to-teal-500/20
                              border border-white/20 backdrop-blur-md">
                <span className="text-xs md:text-sm font-medium">{current.category}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-start gap-3">
              <a
                href={`/tours/${current.id || ""}`}
                className="inline-flex items-center justify-center rounded-full
                           bg-white/95 text-gray-900 hover:bg-white
                           px-6 py-2.5 text-sm md:text-base font-semibold
                           shadow-lg hover:shadow-xl active:scale-95 transition">
                Đặt tour {current.price}
              </a>

              <button
                onClick={() => { setVideoUrl(current.videoUrl); setShowVideo(true); }}
                className="inline-flex items-center justify-center gap-2 rounded-full
                           bg-transparent text-white
                           border border-white/30 hover:border-white/50
                           px-6 py-2.5 text-sm md:text-base font-medium
                           backdrop-blur-md hover:bg-white/10 active:scale-95 transition">
                <PlayCircle className="w-5 h-5" />
                <span>Xem video</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dots — chuyển về căn trái */}
       <div className="absolute z-30 left-1/2 -translate-x-1/2 bottom-4">
        <div className="flex gap-2 bg-black/25 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/15">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              disabled={isTransitioning}
              aria-label={`Đi đến slide ${i + 1}`}
              className="h-2 rounded-full transition-all duration-300 focus:outline-none"
              style={
                i === activeSlide
                  ? { width: "1.25rem", background: "#fff", boxShadow: `0 0 0 1px 80 inset` }
                  : { width: "0.625rem", background: "rgba(255,255,255,0.75)" }
              }
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <VideoModal videoUrl={showVideo ? videoUrl : null} onClose={() => setShowVideo(false)} />
    </section>
  );
}
