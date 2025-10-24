import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Star, Building2, Clock, Phone, Mail, Globe, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const fetchTourDetail = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock tour data
        const mockTour = {
          _id: id,
          title: "Hà Nội - Hạ Long - Ninh Bình 4N3Đ",
          description: "Khám phá vẻ đẹp của miền Bắc Việt Nam với tour 4 ngày 3 đêm, tham quan vịnh Hạ Long, Tràng An Ninh Bình và các di sản văn hóa thế giới.",
          images: [
            "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800"
          ],
          basePrice: 5500000,
          duration: "4 ngày 3 đêm",
          location: "Hà Nội - Hạ Long - Ninh Bình",
          tags: ["Văn hóa", "Thiên nhiên", "Di sản"],
          isHidden: false,
          agencyId: {
            _id: "agency001",
            name: "Saigon Tourist",
            phone: "0901234567",
            email: "contact@saigontourist.vn",
            website: "www.saigontourist.vn",
            logo: "https://ui-avatars.com/api/?name=Saigon+Tourist&background=3B82F6&color=fff"
          },
          itinerary: [
            {
              day: 1,
              title: "Hà Nội - Tham quan thủ đô",
              activities: ["Đón tại sân bay Nội Bài", "Tham quan Văn Miếu Quốc Tử Giám", "Hồ Gươm và Đền Ngọc Sơn", "Phố cổ Hà Nội"],
              meals: "Trưa, Tối"
            },
            {
              day: 2,
              title: "Hà Nội - Hạ Long",
              activities: ["Khởi hành đi Hạ Long", "Du thuyền trên vịnh Hạ Long", "Tham quan hang Sửng Sốt", "Kayak và bơi lội"],
              meals: "Sáng, Trưa, Tối"
            },
            {
              day: 3,
              title: "Hạ Long - Ninh Bình",
              activities: ["Khởi hành về Ninh Bình", "Tham quan Tràng An", "Đi thuyền qua các hang động", "Chùa Bái Đính"],
              meals: "Sáng, Trưa, Tối"
            },
            {
              day: 4,
              title: "Ninh Bình - Hà Nội - Kết thúc",
              activities: ["Tham quan Tam Cốc", "Hang Múa", "Trả khách tại sân bay"],
              meals: "Sáng, Trưa"
            }
          ],
          departures: [
            {
              _id: "dep1",
              date: "2025-11-15",
              priceAdult: 5500000,
              priceChild: 4000000,
              seatsTotal: 20,
              seatsLeft: 5,
              status: "open"
            },
            {
              _id: "dep2",
              date: "2025-12-01",
              priceAdult: 5800000,
              priceChild: 4200000,
              seatsTotal: 20,
              seatsLeft: 12,
              status: "open"
            },
            {
              _id: "dep3",
              date: "2025-12-20",
              priceAdult: 6200000,
              priceChild: 4500000,
              seatsTotal: 20,
              seatsLeft: 0,
              status: "full"
            }
          ],
          reviews: [
            {
              _id: "rev1",
              customerName: "Nguyễn Văn A",
              rating: 5,
              comment: "Tour rất tuyệt vời, hướng dẫn viên nhiệt tình, lịch trình hợp lý!",
              date: "2025-10-10",
              avatar: "https://i.pravatar.cc/150?img=12"
            },
            {
              _id: "rev2",
              customerName: "Trần Thị B",
              rating: 4,
              comment: "Khách sạn tốt, đồ ăn ngon. Tuy nhiên thời gian di chuyển hơi dài.",
              date: "2025-10-05",
              avatar: "https://i.pravatar.cc/150?img=5"
            },
            {
              _id: "rev3",
              customerName: "Lê Minh C",
              rating: 5,
              comment: "Gia đình tôi rất hài lòng. Cảnh đẹp, dịch vụ chu đáo. Sẽ quay lại!",
              date: "2025-09-28",
              avatar: "https://i.pravatar.cc/150?img=33"
            }
          ],
          included: [
            "Xe du lịch máy lạnh",
            "Khách sạn 3-4 sao",
            "Vé tham quan theo chương trình",
            "Bảo hiểm du lịch",
            "Hướng dẫn viên tiếng Việt",
            "Bữa ăn theo chương trình"
          ],
          excluded: [
            "Vé máy bay",
            "Chi phí cá nhân",
            "Đồ uống có cồn",
            "Tip hướng dẫn viên",
            "VAT"
          ]
        };

        setTour(mockTour);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tour:', error);
        setLoading(false);
      }
    };

    fetchTourDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy tour</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSeats = tour.departures?.reduce((sum, dep) => sum + dep.seatsTotal, 0) || 0;
  const bookedSeats = tour.departures?.reduce((sum, dep) => sum + (dep.seatsTotal - dep.seatsLeft), 0) || 0;
  const availableSeats = tour.departures?.reduce((sum, dep) => sum + dep.seatsLeft, 0) || 0;
  const avgRating = tour.reviews?.length > 0 
    ? (tour.reviews.reduce((sum, r) => sum + r.rating, 0) / tour.reviews.length).toFixed(1)
    : 0;

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{tour.title}</h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 gap-2 p-4">
              {tour.images?.slice(0, 4).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Tour ${idx + 1}`}
                  className={`rounded-lg object-cover ${idx === 0 ? 'col-span-2 h-80' : 'h-40'}`}
                />
              ))}
            </div>
          </div>

          {/* Tour Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin tour</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Thời gian</p>
                  <p className="font-medium">{tour.duration}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Địa điểm</p>
                  <p className="font-medium">{tour.location}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Đã đặt / Tổng</p>
                  <p className="font-medium">{bookedSeats} / {totalSeats} chỗ</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                <div>
                  <p className="text-xs text-gray-500">Đánh giá</p>
                  <p className="font-medium">{avgRating} ⭐ ({tour.reviews?.length || 0} reviews)</p>
                </div>
              </div>
            </div>

            {tour.tags?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  {tour.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả</h2>
            <p className="text-gray-600 leading-relaxed">{tour.description}</p>
          </div>

          {/* Itinerary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch trình</h2>
            <div className="space-y-4">
              {tour.itinerary?.map((day) => (
                <div key={day.day} className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900">Ngày {day.day}: {day.title}</h3>
                  <ul className="mt-2 space-y-1">
                    {day.activities.map((activity, idx) => (
                      <li key={idx} className="text-sm text-gray-600">• {activity}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">Bữa ăn: {day.meals}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Included/Excluded */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Bao gồm</h2>
              <ul className="space-y-2">
                {tour.included?.map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <span className="text-green-600 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Không bao gồm</h2>
              <ul className="space-y-2">
                {tour.excluded?.map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <span className="text-red-600 mr-2">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Đánh giá từ khách hàng</h2>
            <div className="space-y-4">
              {tour.reviews?.length > 0 ? (
                tour.reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <img
                        src={review.avatar}
                        alt={review.customerName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(review.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center my-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có đánh giá nào</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Agency Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Công ty quản lý</h2>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={tour.agencyId.logo}
                alt={tour.agencyId.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{tour.agencyId.name}</h3>
                <p className="text-xs text-gray-500">Travel Agency</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                <span>{tour.agencyId.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                <span className="truncate">{tour.agencyId.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Globe className="w-4 h-4 mr-2 text-blue-600" />
                <a href={`https://${tour.agencyId.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  {tour.agencyId.website}
                </a>
              </div>
            </div>
          </div>

          {/* Departures */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Lịch khởi hành</h2>
            <div className="space-y-3">
              {tour.departures?.map((dep) => {
                const seatsBooked = dep.seatsTotal - dep.seatsLeft;
                const bookingPercentage = Math.round((seatsBooked / dep.seatsTotal) * 100);
                
                return (
                  <div key={dep._id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium text-sm">
                          {new Date(dep.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        dep.status === 'full' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {dep.status === 'full' ? 'Đã đầy' : `Còn ${dep.seatsLeft} chỗ`}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex justify-between">
                        <span>Người lớn:</span>
                        <span className="font-medium">{dep.priceAdult.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trẻ em:</span>
                        <span className="font-medium">{dep.priceChild.toLocaleString()} VNĐ</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          bookingPercentage === 100 ? 'bg-red-600' : 
                          bookingPercentage > 75 ? 'bg-yellow-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${bookingPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {seatsBooked}/{dep.seatsTotal} chỗ đã đặt
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Thống kê</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng số chỗ:</span>
                <span className="font-semibold text-gray-900">{totalSeats}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đã đặt:</span>
                <span className="font-semibold text-green-600">{bookedSeats}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Còn lại:</span>
                <span className="font-semibold text-blue-600">{availableSeats}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Tỉ lệ đặt:</span>
                <span className="font-semibold text-gray-900">
                  {totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
