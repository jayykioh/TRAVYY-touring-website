import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Star, Clock, Users, Search, Calendar, PlayCircle } from 'lucide-react';

const TourHeroSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  // const [searchDestination, setSearchDestination] = useState('');
  // const [searchDates, setSearchDates] = useState('');
  // const [searchGuests, setSearchGuests] = useState('2');

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      location: 'Ha Long Bay, Vietnam',
      title: 'Discover the Emerald Waters of Ha Long',
      subtitle: 'Experience the breathtaking limestone karsts and emerald waters',
      rating: 4.8,
      reviews: 2847,
      duration: '3 days',
      price: 'From $299',
      category: 'Adventure & Nature'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2139&q=80',
      location: 'Sapa, Vietnam',
      title: 'Trek Through Golden Rice Terraces',
      subtitle: 'Immerse yourself in the stunning mountain landscapes and local culture',
      rating: 4.9,
      reviews: 1923,
      duration: '4 days',
      price: 'From $399',
      category: 'Trekking & Culture'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
      location: 'Hoi An, Vietnam',
      title: 'Ancient Town Cultural Journey',
      subtitle: 'Explore the UNESCO World Heritage site with its lantern-lit streets',
      rating: 4.7,
      reviews: 3156,
      duration: '2 days',
      price: 'From $199',
      category: 'Cultural Heritage'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      location: 'Phu Quoc Island, Vietnam',
      title: 'Tropical Paradise Getaway',
      subtitle: 'Relax on pristine beaches and explore vibrant coral reefs',
      rating: 4.6,
      reviews: 2234,
      duration: '5 days',
      price: 'From $599',
      category: 'Beach & Relaxation'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === activeSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.location}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3 text-white hover:bg-white/20 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3 text-white hover:bg-white/20 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-white space-y-6  pl-10">
              <div className="flex items-center space-x-2 text-orange-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide">
                  {currentSlide.location}
                </span>
              </div>

              <div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-4">
                  {currentSlide.title}
                </h1>
                <p className="text-xl text-gray-200 max-w-lg">
                  {currentSlide.subtitle}
                </p>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{currentSlide.rating}</span>
                  <span className="text-gray-300">({currentSlide.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentSlide.duration}</span>
                </div>
                <div className="px-3 py-1 bg-orange-500/20 rounded-full text-orange-300">
                  {currentSlide.category}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Book Now {currentSlide.price}
                </button>
                <button className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-4 rounded-full hover:bg-white/20 transition-all duration-300">
                  <PlayCircle className="w-5 h-5" />
                  <span>Watch Video</span>
                </button>
              </div>
            </div>
        
            {/* Right Content - Search Widget */}
            {/* <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Plan Your Adventure</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Where do you want to go?"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Check-in
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={searchDates}
                        onChange={(e) => setSearchDates(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Guests
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        value={searchGuests}
                        onChange={(e) => setSearchGuests(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                      >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="5+">5+ Guests</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Search Tours</span>
                </button>

                <div className="text-center">
                  <p className="text-white/70 text-sm">
                    Over 500+ amazing tours available
                  </p>
                </div>
              </div>
            </div> */}

          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeSlide 
                  ? 'bg-orange-500 scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Floating Stats */}
      <div className="absolute bottom-25 right-30 z-20 hidden lg:block">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3">
          <div className="text-white text-sm">
            <div className="font-semibold">4.8★ Average Rating</div>
            <div className="text-white/70">From 10,000+ happy travelers</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourHeroSection;