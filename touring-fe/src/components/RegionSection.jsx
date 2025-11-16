import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

// DANH SÁCH TỈNH – GIỮ NGUYÊN
const DESTINATIONS = [
  {
    id: 1,
    name: "Hà Nội",
    image:
      "https://i.pinimg.com/1200x/77/4a/9e/774a9e7c90cb32bdb22d3debb0f6dd26.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a12",
  },
  {
    id: 2,
    name: "Hưng Yên",
    image:
      "https://i.pinimg.com/736x/61/e6/d1/61e6d19cad7b0c10c526d08ad2960850.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a14",
  },
  {
    id: 3,
    name: "Nghệ An",
    image:
      "https://i.pinimg.com/736x/c5/d4/10/c5d41077bf14e5d6506fb0b4c8faf35b.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a17",
  },
  {
    id: 4,
    name: "Quảng Ngãi",
    image:
      "https://i.pinimg.com/1200x/ba/07/a1/ba07a14e205b562db71b2d4df03230fe.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a22",
  },
  {
    id: 5,
    name: "Tây Ninh",
    image:
      "https://i.pinimg.com/736x/1e/84/e6/1e84e645c2fbfe9572c52e0cb844aff2.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a28",
  },
  {
    id: 6,
    name: "Ninh Bình",
    image:
      "https://i.pinimg.com/736x/ea/bb/cb/eabbcbbf8cc5729884f1fe347178457f.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a15",
  },
  {
    id: 7,
    name: "Lai Châu",
    image:
      "https://i.pinimg.com/1200x/cb/d1/a7/cbd1a757a6b8b7eceea00ee82a0a490e.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a03",
  },
  {
    id: 8,
    name: "Lào Cai",
    image:
      "https://i.pinimg.com/1200x/5f/0e/7c/5f0e7caa9855303e8568fc8e0b3a4b66.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a04",
  },
  {
    id: 9,
    name: "Thái Nguyên",
    image:
      "https://i.pinimg.com/1200x/39/a6/c7/39a6c7c23be7921861c77eae4a0be042.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a05",
  },
  {
    id: 10,
    name: "Điện Biên",
    image:
      "https://i.pinimg.com/736x/2d/bb/d3/2dbbd3e1bc0fa261e560e5ada8f54a8b.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a06",
  },
  {
    id: 11,
    name: "Lạng Sơn",
    image:
      "https://i.pinimg.com/1200x/6e/50/11/6e50112184bb11277339d5af63f72501.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a07",
  },
  {
    id: 12,
    name: "Sơn La",
    image:
      "https://i.pinimg.com/1200x/aa/00/87/aa00878ffe1f188cc0f5cdd751086c40.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a08",
  },
  {
    id: 13,
    name: "Phú Thọ",
    image:
      "https://i.pinimg.com/736x/b5/f0/b2/b5f0b2c30a3830277d1c9f0d430cd61f.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a09",
  },
  {
    id: 14,
    name: "Bắc Ninh",
    image:
      "https://i.pinimg.com/1200x/04/78/27/0478273ec9351b67d11979672a3c7f24.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a10",
  },
  {
    id: 15,
    name: "Quảng Ninh",
    image:
      "https://i.pinimg.com/736x/e0/a6/1b/e0a61b0451adba24fdb44427a63fa47f.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a11",
  },
  {
    id: 16,
    name: "Hải Phòng",
    image:
      "https://i.pinimg.com/736x/3a/f8/26/3af82696a1cdb13f822dc2f13971e61d.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a13",
  },
  {
    id: 18,
    name: "Cao Bằng",
    image:
      "https://i.pinimg.com/1200x/cc/d7/8d/ccd78dce2533c168f21443f35397a4ec.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a02",
  },
  {
    id: 19,
    name: "Thanh Hóa",
    image: "https://iwater.vn/Image/Picture/New/333/tinh_thanh_hoa.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a16",
  },
  {
    id: 20,
    name: "Quảng Trị",
    image:
      "https://i.pinimg.com/1200x/b1/4a/90/b14a90971d6534fe5750dd9607c66653.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a19",
  },
  {
    id: 21,
    name: "Hà Tĩnh",
    image:
      "https://i.pinimg.com/1200x/91/24/1e/91241e6aac1eec79f44ccc79e0e2b594.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a18",
  },
  {
    id: 22,
    name: "Huế",
    image:
      "https://i.pinimg.com/736x/4f/6f/cf/4f6fcfcdea60b455be31050f3dee677e.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a20",
  },
  {
    id: 23,
    name: "Đà Nẵng",
    image:
      "https://i.pinimg.com/1200x/1e/38/52/1e38526c4857a3ef291bc27bf9eaa169.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a21",
  },
  {
    id: 25,
    name: "Gia Lai",
    image:
      "https://i.pinimg.com/1200x/94/a8/06/94a806abb0315ce4661ca5c65d44501d.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a23",
  },
  {
    id: 26,
    name: "Đắk Lắk",
    image:
      "https://i.pinimg.com/1200x/a9/d6/5b/a9d65b40cd75cb907e238907a85d4c3a.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a24",
  },
  {
    id: 27,
    name: "Khánh Hoà",
    image:
      "https://i.pinimg.com/1200x/44/d3/ad/44d3ad81b413eaa6a9e9be3f309479ed.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a25",
  },
  {
    id: 28,
    name: "Lâm Đồng",
    image:
      "https://i.pinimg.com/736x/87/d4/b9/87d4b94a1e5a5eec3ee6ca710c3b519a.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a26",
  },
  {
    id: 29,
    name: "Đồng Nai",
    image:
      "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwpMPcw7dA0dD0vhPV79MTMhCraXaBjyilZ--yT9lZV4o9jW8eB8uVxA9KlcAQc4T9TQ-OWMCwxml86kURq2E5sa4y6GDKEESIv_JJVnd7bXHq4JdKQVALK4MmhoQVqquVEQEEM-g=s680-w680-h510-rw",
    slug: "68dd001a1b8a9c3b8a4f1a27",
  },
  {
    id: 30,
    name: "Tuyên Quang",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi632xQmYiFikj9t9l8biK-2eg7kZbWaQrbZxIeo8Vq--R4X1_b7yaLhk9kU7k6RMUa9-UboNH-mk_2ZenDmE3tEknbzQ9wHXv2q3hhmZflnCtKIK-11GnUYbwU2Zc2WusGPogOzcok-EH45eVweCW-rLzt1bmt1DwHeN9eTC4Pt6FQy-jRVQe-ujUmO7qj/w640-h638/2.png",
    slug: "68dd001a1b8a9c3b8a4f1a01",
  },
  {
    id: 31,
    name: "Sài Gòn",
    image:
      "https://i.pinimg.com/1200x/32/a0/82/32a0826b769a3d948cbe5c2ac223362e.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a29",
  },
  {
    id: 32,
    name: "Đồng Tháp",
    image:
      "https://i.pinimg.com/736x/45/47/41/4547413918263fee4fbc64a6372080f0.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a30",
  },
  {
    id: 33,
    name: "An Giang",
    image:
      "https://i.pinimg.com/736x/a8/ab/22/a8ab222c3ea8bc984bf6731641195bef.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a31",
  },
  {
    id: 34,
    name: "Vĩnh Long",
    image:
      "https://i.pinimg.com/1200x/1d/ed/2b/1ded2b399422226a341a8d76f34a1bf4.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a32",
  },
  {
    id: 35,
    name: "Cần Thơ",
    image:
      "https://i.pinimg.com/736x/1b/2f/31/1b2f31dfdaf45c91254c52d26de72e72.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a33",
  },
  {
    id: 36,
    name: "Cà Mau",
    image:
      "https://i.pinimg.com/736x/71/57/9d/71579d1b8623cd3d10d15402b718fcd4.jpg",
    slug: "68dd001a1b8a9c3b8a4f1a34",
  },
];

// =========================
// HÀM TÍNH ITEMS / PAGE TỰ ĐỘNG
// =========================
const getItemsPerPage = () => {
  if (window.innerWidth < 768) return 3; // mobile
  if (window.innerWidth < 1024) return 4; // tablet
  return 6; // desktop
};

const RegionSection = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  // Cập nhật itemsPerPage khi resize
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
      setCurrentPage(0); // tránh lệch slide khi thay đổi kích thước
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tổng số page
  const totalPages = Math.ceil(DESTINATIONS.length / itemsPerPage);

  // Tách dữ liệu thành Page
  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    const start = pageIndex * itemsPerPage;
    return DESTINATIONS.slice(start, start + itemsPerPage);
  });

  // LOOP NEXT
  const nextPage = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  // LOOP PREV
  const prevPage = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-7 lg:px-8">
        <div className="pb-3">
          <h2 className="text-3xl font-bold text-[#007980] mb-2">
            Bạn muốn đi đâu chơi?
          </h2>
          <p className="text-lg text-gray-600">
            Chọn khu vực để xem các tour du lịch nổi bật.
          </p>
        </div>

        <div className="relative overflow-visible z-20">
          <div className="overflow-x-hidden overflow-y-visible relative">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
              {pages.map((pageItems, pageIndex) => (
                <div key={pageIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 mt-4">
                    {pageItems.map((region) => (
                      <div
                        key={region.id}
                        className="relative rounded-2xl cursor-pointer hover:scale-105 transition duration-500 hover:shadow-xl"
                        onClick={() => navigate(`/region/${region.slug}`)}
                      >
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                          <img
                            src={region.image}
                            alt={region.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg">
                              {region.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nút prev */}
          <button
            onClick={prevPage}
            className="absolute top-1/2 -translate-y-1/2 p-1 hover:scale-125
             -left-1 md:-left-1 lg:-left-9"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          {/* Nút next */}
          <button
            onClick={nextPage}
            className="absolute top-1/2 -translate-y-1/2 p-1 hover:scale-125
             -right-1 md:-right-1 lg:-right-9"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RegionSection;
