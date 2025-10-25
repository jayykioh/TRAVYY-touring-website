import React, { useState } from "react";
import { Clock, Eye, Heart, Filter, MessageCircle, Share2, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { blogPostsData, pageInfo } from "../mockdata/blogData";

const TravelBlog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const blogPosts = blogPostsData.map(post => ({
    ...post,
    excerpt: post.caption?.slice(0, 150) + (post.caption.length > 150 ? "..." : ""),
    views: Math.floor(Math.random() * 5000) + 1000,
  }));

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

  const filteredPosts = selectedCategory === "Tất cả" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
       {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
              Khám phá cùng chúng tôi
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Blog Du Lịch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Khám phá những câu chuyện du lịch thú vị, cẩm nang hữu ích và những trải nghiệm đáng nhớ từ cộng đồng du lịch Việt Nam
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Bộ lọc chủ đề:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600 flex items-center justify-between">
          <div>
            Hiển thị <span className="font-semibold text-gray-900">{filteredPosts.length}</span> bài viết
          </div>
          <div className="text-sm text-gray-500">
            Sắp xếp: Mới nhất
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>

                {/* Stats on Hover */}
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-xs font-medium">
                    <Eye className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-700">{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full text-xs font-medium">
                    <Heart className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-gray-700">{post.likes}</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3 leading-snug">
                  {post.title}
                </h3>
                
                {/* Excerpt */}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                
                {/* Meta Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {post.publishDate}
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{post.shares}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-500">Hãy thử chọn chủ đề khác</p>
          </div>
        )}

        {/* Footer CTA */}
        {filteredPosts.length > 0 && (
          <div className="text-center py-16 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Theo dõi để không bỏ lỡ bài viết mới
            </h3>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Cập nhật thường xuyên các bài viết về du lịch, cẩm nang, kinh nghiệm và tips hữu ích
            </p>
            <div className="flex gap-4 justify-center">
              <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Users className="w-5 h-5" />
                Theo dõi Page
              </button>
              <button className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-md border-2 border-gray-200">
                <Share2 className="w-5 h-5" />
                Chia sẻ
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default TravelBlog;