import React from "react";
import { Clock, User, ArrowRight, Eye, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const TravelBlog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "10 Điểm Đến Không Thể Bỏ Qua Khi Du Lịch Việt Nam",
      excerpt: "Khám phá những địa điểm tuyệt đẹp từ Bắc đến Nam, từ núi rừng hùng vĩ đến biển xanh cát trắng...",
      image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73b0e?q=80&w=500&auto=format&fit=crop",
      author: "Minh Anh",
      readTime: "5 phút đọc",
      publishDate: "2 ngày trước",
      category: "Cẩm nang",
      views: 1250,
      likes: 89,
      featured: true
    },
    {
      id: 2,
      title: "Kinh Nghiệm Du Lịch Sapa Tự Túc - Cập Nhật 2024",
      excerpt: "Hướng dẫn chi tiết từ A-Z để có chuyến du lịch Sapa tiết kiệm nhưng vẫn trọn vẹn...",
      image: "https://images.unsplash.com/photo-1563051265-c8de7e48fabe?q=80&w=500&auto=format&fit=crop",
      author: "Thu Hà",
      readTime: "8 phút đọc",
      publishDate: "5 ngày trước",
      category: "Kinh nghiệm",
      views: 2100,
      likes: 156,
      featured: false
    },
    {
      id: 3,
      title: "Những Món Ăn Không Thể Bỏ Qua Khi Đến Hội An",
      excerpt: "Từ cao lầu, mì quảng đến bánh mì Phượng - khám phá ẩm thực đậm chất phố cổ...",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=500&auto=format&fit=crop",
      author: "Đức Minh",
      readTime: "6 phút đọc",
      publishDate: "1 tuần trước",
      category: "Ẩm thực",
      views: 1800,
      likes: 124,
      featured: false
    },
    {
      id: 4,
      title: "Bí Quyết Chụp Ảnh Du Lịch Đẹp Như Travel Blogger",
      excerpt: "Những tips và tricks để có những bức ảnh check-in lung linh trên mạng xã hội...",
      image: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=500&auto=format&fit=crop",
      author: "Phương Linh",
      readTime: "7 phút đọc",
      publishDate: "1 tuần trước",
      category: "Photography",
      views: 980,
      likes: 67,
      featured: false
    },
    {
      id: 5,
      title: "Phú Quốc - Hòn Đảo Ngọc Và Những Trải Nghiệm Độc Đáo",
      excerpt: "Cáp treo Hòn Thơm, Safari, và những hoạt động thú vị không thể bỏ qua tại đảo ngọc...",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=500&auto=format&fit=crop",
      author: "Hoàng Nam",
      readTime: "10 phút đọc",
      publishDate: "2 tuần trước",
      category: "Trải nghiệm",
      views: 3200,
      likes: 245,
      featured: true
    },
    {
      id: 6,
      title: "Du Lịch Đà Nẵng - Huế Bằng Xe Máy: Cung Đường Hải Vân",
      excerpt: "Chinh phục cung đường ven biển đẹp nhất Việt Nam với những góc view tuyệt đỉnh...",
      image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=500&auto=format&fit=crop",
      author: "Tuấn Anh",
      readTime: "9 phút đọc",
      publishDate: "2 tuần trước",
      category: "Phiêu lưu",
      views: 1650,
      likes: 98,
      featured: false
    }
  ];

  const categories = [
    "Tất cả", "Cẩm nang", "Kinh nghiệm", "Ẩm thực", "Photography", "Trải nghiệm", "Phiêu lưu"
  ];

  const getCategoryColor = (category) => {
    const colors = {
      "Cẩm nang": "bg-blue-100 text-blue-800",
      "Kinh nghiệm": "bg-green-100 text-green-800",
      "Ẩm thực": "bg-orange-100 text-orange-800",
      "Photography": "bg-purple-100 text-purple-800",
      "Trải nghiệm": "bg-pink-100 text-pink-800",
      "Phiêu lưu": "bg-teal-100 text-teal-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const featuredPost = blogPosts.find(post => post.featured);
  const otherPosts = blogPosts.filter(post => !post.featured);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Blog Du Lịch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cập nhật những thông tin mới nhất, kinh nghiệm hay và cẩm nang du lịch từ các chuyên gia
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                index === 0 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Featured Post */}
          <div className="lg:col-span-8">
            {featuredPost && (
              <Link
                to={`/blog/${featuredPost.id}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Featured badge */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Nổi bật
                  </div>

                  {/* Category */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(featuredPost.category)}`}>
                      {featuredPost.category}
                    </span>
                  </div>

                  {/* Content overlay */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-200 mb-4 text-lg leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                        <span>{featuredPost.publishDate}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{featuredPost.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{featuredPost.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Other Posts */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {otherPosts.slice(0, 4).map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group flex gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-24 h-20 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* More Posts Grid */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Bài viết khác</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.slice(4).map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
                    {post.title}
                  </h4>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full transition-colors duration-200"
          >
            Xem tất cả bài viết
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TravelBlog;