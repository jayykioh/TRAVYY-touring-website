import React, { useState } from "react";
import { Clock, User, ArrowRight, Eye, Heart, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { blogPostsData } from "../mockdata/blogData";

const TravelBlog = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const blogPosts = blogPostsData.map(post => ({
    ...post,
    excerpt: post.caption?.slice(0, 120) + (post.caption.length > 120 ? "..." : ""),
    views: Math.floor(Math.random() * 3000) + 500,
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

  // Lọc bài viết theo category
  const filteredPosts = selectedCategory === "Tất cả" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
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

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-700">Lọc theo chủ đề:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Hiển thị <span className="font-semibold text-gray-900">{filteredPosts.length}</span> bài viết
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>

                {/* Quick Stats on Hover */}
                <div className="absolute bottom-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                    <Eye className="w-3 h-3" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                    <Heart className="w-3 h-3 text-red-500" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3 leading-tight">
                  {post.title}
                </h3>
                
                {/* Excerpt */}
                <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                
                {/* Author & Meta */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">{post.author.username}</span>
                        {post.author.verified && (
                          <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{post.publishDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action - Navigate to first blog */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-16 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Sẵn sàng khám phá?
            </h3>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Bắt đầu hành trình khám phá những câu chuyện du lịch thú vị từ bài viết đầu tiên
            </p>
            <Link
              to={`/blog/${filteredPosts[0].id}`}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Bắt đầu đọc ngay
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có bài viết nào</h3>
            <p className="text-gray-500">Hãy thử chọn chủ đề khác</p>
          </div>
        )}

      </div>
    </section>
  );
};

export default TravelBlog;