// src/components/VietnamDestinations.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, DollarSign } from "lucide-react";
import vietnamDestinations from "../mockdata/destinations";

export default function VietnamDestinations() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;
  const totalSlides = Math.ceil(vietnamDestinations.length / itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  const getCurrentDestinations = () => {
    const start = currentIndex * itemsPerView;
    return vietnamDestinations.slice(start, start + itemsPerView);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Khám phá Việt Nam
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Từ những thành phố sôi động đến những vùng núi non hùng vĩ, 
            khám phá vẻ đẹp đa dạng của đất nước Việt Nam
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {getCurrentDestinations().map((destination) => (
              <div
                key={destination.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {destination.name}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-sm opacity-90 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      Việt Nam
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {destination.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Thời gian tốt nhất: {destination.bestTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      <span>Từ {destination.averagePrice}đ</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {destination.highlights.slice(0, 2).map((highlight, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium">
                    Khám phá ngay
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200"
                aria-label="Previous destinations"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200"
                aria-label="Next destinations"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {totalSlides > 1 && (
          <div className="flex justify-center space-x-2 mb-8">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentIndex
                    ? "bg-blue-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* See All Button */}
        <div className="text-center">
          <button className="bg-white border-2 border-blue-500 text-blue-500 px-8 py-3 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 font-medium">
            Xem tất cả địa điểm
          </button>
        </div>
      </div>
    </section>
  );
}