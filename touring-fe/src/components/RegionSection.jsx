import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const RegionSection = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const itemsPerPage = 6;

  const destinations = [
    { id: 1, name: "Hà Nội", image: "https://i.pinimg.com/1200x/77/4a/9e/774a9e7c90cb32bdb22d3debb0f6dd26.jpg", slug: "hanoi" },
    { id: 2, name: "Nha Trang", image: "https://i.pinimg.com/1200x/c4/77/ca/c477ca292c458a44840da32b3b0590aa.jpg", slug: "nhatrang" },
    { id: 3, name: "Đà Nẵng", image: "https://i.pinimg.com/1200x/1e/38/52/1e38526c4857a3ef291bc27bf9eaa169.jpg", slug: "danang" },
    { id: 4, name: "Thành phố Hồ Chí Minh", image: "https://i.pinimg.com/736x/0e/6b/ef/0e6bef1f6fa506927008dcedd1f69818.jpg", slug: "tphcm" },
    { id: 5, name: "Phú Quốc", image: "https://i.pinimg.com/1200x/93/bd/0f/93bd0f07eee43f72bcf100cf48b79bc1.jpg", slug: "phuquoc" },
    { id: 6, name: "Hội An", image: "https://i.pinimg.com/1200x/bd/d5/ff/bdd5ffaa1734779f8c434df958f125cc.jpg", slug: "hoian" },
    { id: 7, name: "Sapa", image: "https://i.pinimg.com/1200x/cc/b4/3a/ccb43a8c22f68d44e1c47832d6c3d9c1.jpg", slug: "sapa" },
    { id: 8, name: "Huế", image: "https://i.pinimg.com/1200x/8a/19/67/8a19677e446f5134b897ba4e4a34e7b5.jpg", slug: "hue" },
    { id: 9, name: "Hạ Long", image: "https://i.pinimg.com/1200x/4c/32/a1/4c32a1446e5c36635388ecabefee3778.jpg", slug: "halong" },
    { id: 10, name: "Cần Thơ", image: "https://i.pinimg.com/1200x/76/2a/d8/762ad8df50c68dc6e0c3c4bc28a37b6f.jpg", slug: "cantho" },
  ];

  const startIndex = currentPage * itemsPerPage;
  const visibleDestinations = destinations.slice(startIndex, startIndex + itemsPerPage);

  // 🎯 Animation carousel thật sự - trượt ngang như băng chuyền
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000, // Bắt đầu từ xa bên ngoài
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 500, damping: 40 }, // Smooth spring animation
        opacity: { duration: 0.15 }
      }
    },
  };

  const scrollLeft = () => {
    setDirection(-1);
    setCurrentPage((prev) =>
      prev > 0 ? prev - 1 : Math.ceil(destinations.length / itemsPerPage) - 1
    );
  };

  const scrollRight = () => {
    setDirection(1);
    setCurrentPage((prev) =>
      prev < Math.ceil(destinations.length / itemsPerPage) - 1 ? prev + 1 : 0
    );
  };

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#007980] mb-2">
              Bạn muốn đi đâu chơi?
            </h2>
            <p className="text-lg text-gray-600 ">
              Từ những thành phố sôi động đến những vùng núi non hùng vĩ, khám
              phá vẻ đẹp đa dạng của đất nước Việt Nam
            </p>
          </div>

        <div className="relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
            >
              {visibleDestinations.map((region) => (
                <div
                  key={region.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-500 hover:shadow-2xl"
                  onClick={() => navigate(`/region/${region.slug}`)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={region.image}
                      alt={region.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/50 transition-all duration-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                        {region.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Nút chuyển trang */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg p-3 rounded-full hover:bg-[#02A0AA] hover:text-white transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg p-3 rounded-full hover:bg-[#02A0AA] hover:text-white transition-all z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RegionSection;