import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  PlayCircle,
} from "lucide-react";

const TourHeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState({});

  const heroSlides = [
    {
      id: 1,
      images: {
        mobile:
          "https://banahills.sunworld.vn/wp-content/uploads/2024/04/DJI_0004-1-scaled.jpg",
        tablet:
          "https://banahills.sunworld.vn/wp-content/uploads/2024/04/DJI_0004-1-scaled.jpg",
        desktop:
          "https://banahills.sunworld.vn/wp-content/uploads/2024/04/DJI_0004-1-scaled.jpg",
        webp: "https://banahills.sunworld.vn/wp-content/uploads/2024/04/DJI_0004-1-scaled.jpg", 
      },
      location: "Đà Nẵng, Việt Nam",
      title: "Ba Na Hills & Cầu Vàng",
      subtitle: "Đi cáp treo, check-in Cầu Vàng giữa mây, vui chơi Sun World",
      rating: 4.8,
      reviews: 2847,
      duration: "1 ngày",
      price: "From $59",
      category: "Theme Park & Mountain",
    },
    {
      id: 2,
      images: {
        mobile:
          "https://static.vinwonders.com/production/wkxKquWj-nha-co-hoi-an.jpg",
        tablet:
          "https://static.vinwonders.com/production/wkxKquWj-nha-co-hoi-an.jpg",
        desktop:
            "https://static.vinwonders.com/production/wkxKquWj-nha-co-hoi-an.jpg",
          webp: "https://static.vinwonders.com/production/wkxKquWj-nha-co-hoi-an.jpg",
      },
      location: "Hội An, Quảng Nam, Việt Nam",
      title: "Phố cổ Hội An & Đêm đèn lồng",
      subtitle: "Dạo phố cổ, chụp ảnh đèn lồng, ngồi thuyền sông Hoài",
      rating: 4.9,
      reviews: 1923,
      duration: "2 ngày",
      price: "From $79",
      category: "Cultural Heritage",
    },
    {
      id: 3,
      images: {
        mobile:
          "https://media.vietravel.com/images/Content/thanh-dia-my-son-1.jpg",
        tablet:
          "https://media.vietravel.com/images/Content/thanh-dia-my-son-1.jpg",
        desktop:
          "https://media.vietravel.com/images/Content/thanh-dia-my-son-1.jpg",
        webp: "https://media.vietravel.com/images/Content/thanh-dia-my-son-1.jpg",
      },
      location: "Quảng Nam, Việt Nam",
      title: "Bình minh Thánh địa Mỹ Sơn",
      subtitle: "Khám phá di sản Chăm Pa trong sương sớm, nghe nhạc Apsara",
      rating: 4.7,
      reviews: 3156,
      duration: "Half-day",
      price: "From $39",
      category: "History & Culture",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const next = (activeSlide + 1) % heroSlides.length;
    const img = new Image();
    img.src = heroSlides[next].images.desktop;
  }, [activeSlide]);

  const nextSlide = () => setActiveSlide((p) => (p + 1) % heroSlides.length);
  const prevSlide = () =>
    setActiveSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length);
  const goToSlide = (i) => setActiveSlide(i);

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
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          imageLoaded[slide.id] ? "opacity-100" : "opacity-0"
        } ${isActive ? "scale-100" : "scale-105"}`}
        onLoad={() => handleImageLoad(slide.id)}
        loading={index <= 1 ? "eager" : "lazy"}
        sizes="100vw"
        style={{ objectPosition: "center", aspectRatio: "16/9" }}
      />
    </picture>
  );

  const current = heroSlides[activeSlide];

  return (
    <section className="relative h-[70vh] sm:h-[75vh] md:h-[82vh] lg:h-[88vh] xl:h-[90vh] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <ResponsiveImage
              slide={slide}
              index={index}
              isActive={index === activeSlide}
            />
            {/* Gradient overlay (giữ trong suốt) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent sm:from-black/60 sm:via-black/30 lg:from-black/50 lg:via-black/20" />
            {!imageLoaded[slide.id] && (
              <div className="absolute inset-0 bg-gray-800 animate-pulse grid place-items-center">
                <div className="text-white/50 text-sm">Loading...</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute top-1/2 -translate-y-1/2 z-20
                 left-2 sm:left-3 md:left-4 lg:left-5
                 bg-white/10 backdrop-blur-sm border border-white/20 text-white
                 rounded-full p-2 md:p-2.5 lg:p-3 hover:bg-white/20 transition"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute top-1/2 -translate-y-1/2 z-20
                 right-2 sm:right-3 md:right-4 lg:right-5
                 bg-white/10 backdrop-blur-sm border border-white/20 text-white
                 rounded-full p-2 md:p-2.5 lg:p-3 hover:bg-white/20 transition"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
      </button>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div
          className="w-full mx-auto
                        px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12
                        max-w-sm sm:max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl"
        >
          <div className="grid items-center gap-6 lg:grid-cols-[680px_1fr] xl:grid-cols-[740px_1fr]">
            {/* Left */}
            <div className="text-white text-center lg:text-left space-y-4 px-2 sm:px-3 md:px-4 lg:pl-6 py-6">
              {/* Location */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sky-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm md:text-base font-medium tracking-wide">
                  {current.location}
                </span>
              </div>

              {/* Title & subtitle */}
              <div className="space-y-2">
                <h1 className="font-bold leading-tight text-2xl md:text-4xl xl:text-5xl">
                  {current.title}
                </h1>
                <p className="text-white/85 max-w-xl mx-auto lg:mx-0 text-sm md:text-lg leading-relaxed">
                  {current.subtitle}
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-semibold">{current.rating}</span>
                  <span className="text-white/70 hidden sm:inline">
                    ({current.reviews.toLocaleString()} reviews)
                  </span>
                  <span className="text-white/70 sm:hidden">
                    ({Math.floor(current.reviews / 1000)}k)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{current.duration}</span>
                </div>
                <div className="px-3 py-1 rounded-full text-sky-200 bg-sky-500/20 border border-sky-400/20">
                  <span className="hidden sm:inline">{current.category}</span>
                  <span className="sm:hidden">
                    {current.category.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Actions (blue theme) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full px-6 md:px-7 lg:px-8 py-3 md:py-3.5 lg:py-4 transition-transform hover:scale-[1.03] shadow-lg">
                  <span>Book Now</span>
                  <span className="hidden sm:inline"> {current.price}</span>
                </button>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full px-5 md:px-6 lg:px-7 py-3 md:py-3.5 lg:py-4 hover:bg-white/20 transition">
                  <PlayCircle className="w-5 h-5" />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
            {/* Right column trống (giữ bố cục 2 cột trên lg) */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </div>

      {/* Dots (blue) */}
      <div className="absolute z-30 left-1/2 -translate-x-1/2 bottom-4">
        <div className="flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeSlide
                  ? "bg-sky-500 w-3.5 h-3.5 scale-110"
                  : "bg-white/60 hover:bg-white w-2.5 h-2.5"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floating stat */}
      <div className="absolute z-20 hidden md:block bottom-16 right-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
          <div className="text-white text-sm">
            <div className="font-semibold">4.8★ Average Rating</div>
            <div className="text-white/70">10k+ travelers</div>
          </div>
        </div>
      </div>

      {/* Touch hint */}
      <div className="absolute z-20 block sm:hidden left-1/2 -translate-x-1/2 bottom-10">
        <div className="text-white/70 text-xs text-center px-4">
          Swipe to explore more destinations
        </div>
      </div>
    </section>
  );
};

export default TourHeroSection;
