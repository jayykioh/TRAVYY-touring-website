// ✅ src/components/HelpCenter.jsx - COMPLETE FIXED VERSION
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Clock, Eye, ThumbsUp, CreditCard, User, Calendar, FileText, RotateCcw, Wrench, Lock, MessageCircle } from "lucide-react";

import {
  getCategories,
  getFeaturedArticles,
  searchArticles,
} from "@/mockdata/helpData";
import logger from "../utils/logger";

export default function HelpCenter() {
  const [categories, setCategories] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // ✅ Load mockdata
  useEffect(() => {
    try {
      setLoading(true);
      setCategories(getCategories());
      setFeaturedArticles(getFeaturedArticles());
    } catch (error) {
      logger.error("Error loading help center:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Improved search with debouncing effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      const results = searchArticles(searchQuery);
      setSearchResults(results);
      setShowSearchDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ===== HEADER HERO ===== */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] mb-8">
        {/* Hero Background */}
        <div 
          className="relative h-96 flex flex-col items-center justify-center overflow-visible"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/1200x/19/b1/0a/19b10aae3912299c6ac7483d6451305a.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Blur Effect Overlay (Dark Tint) */}
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Content - Centered Text */}
          <div className="relative z-10 text-center text-white px-4 max-w-3xl mb-12">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 drop-shadow-lg">Trung Tâm Hỗ Trợ</h1>
            <p className="text-xl md:text-2xl font-medium opacity-95 drop-shadow-md">
              Tìm câu trả lời nhanh chóng cho mọi thắc mắc của bạn
            </p>
          </div>

          {/* 🔍 SEARCH BAR INSIDE BANNER */}
          <div className="max-w-2xl mx-auto px-4 w-full">
            <div className="relative search-container z-[200]">
              <div className="bg-white rounded-full shadow-lg">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowSearchDropdown(true)}
                    placeholder="Tìm kiếm tour, địa điểm..."
                    className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-full focus:outline-none transition-colors bg-transparent"
                  />
                </div>
              </div>

              {/* SEARCH RESULTS DROPDOWN */}
              {showSearchDropdown && searchQuery && (
                <div className="absolute z-[300] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                        Tìm thấy {searchResults.length} kết quả
                      </div>
                      {searchResults.map((article) => (
                        <Link
                          key={article._id}
                          to={`/help/article/${article.slug}`}
                          className="block px-4 py-3 hover:bg-teal-50 border-b border-gray-100 last:border-0 transition-colors"
                          onClick={() => {
                            setSearchQuery("");
                            setShowSearchDropdown(false);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{article.icon || "📄"}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</p>
                              <div className="flex items-center gap-3 mt-1">
                                {article.tags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-gray-600 mb-3">
                        Không tìm thấy kết quả cho "<strong>{searchQuery}</strong>"
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Hãy thử từ khóa khác hoặc liên hệ hỗ trợ
                      </p>
                      <Link
                        to="#contact"
                        className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        onClick={() => setShowSearchDropdown(false)}
                      >
                        Liên hệ hỗ trợ
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {["booking-payment", "account-login", "itinerary-usage", "troubleshooting"].map((slug) => {
            const cat = categories.find(c => c.slug === slug);
            return cat ? (
              <Link
                key={slug}
                to={`/help/category/${slug}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-sm font-medium text-gray-700 hover:text-teal-600"
              >
                {cat.icon} {cat.name}
              </Link>
            ) : null;
          })}
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative max-w-6xl mx-auto px-4 py-8">

        {/* ===== FEATURED ARTICLES (COMPACT) ===== */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Câu hỏi thường gặp nhất
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredArticles.slice(0, 4).map((article) => (
                <Link
                  key={article._id}
                  to={`/help/article/${article.slug}`}
                  className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{article.icon || "📄"}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base group-hover:text-teal-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm mb-2 line-clamp-1">{article.excerpt}</p>
                      
                      {/* METRICS */}
                      {(article.views || article.helpfulCount) && (
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {article.views && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.views.toLocaleString()}</span>
                            </div>
                          )}
                          {article.helpfulCount && article.totalFeedback && (
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{Math.round((article.helpfulCount / article.totalFeedback) * 100)}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ===== CATEGORIES GRID ===== */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Chủ đề hỗ trợ
          </h2>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((category) => {
                // Map lucide-react icons based on category slug
                const IconComponent = {
                  'booking-payment': CreditCard,
                  'account-login': User,
                  'itinerary-usage': Calendar,
                  'checkout-invoice': FileText,
                  'cancellation-refund': RotateCcw,
                  'troubleshooting': Wrench,
                  'privacy-security': Lock,
                  'support-contact': MessageCircle
                }[category.slug] || FileText;
                
                return (
                <Link
                  key={category.slug}
                  to={`/help/category/${category.slug}`}
                  className="group block p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <IconComponent className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-teal-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          {category.articleCount} bài viết
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có nội dung hỗ trợ
              </h3>
              <p className="text-gray-600 mb-4">
                Chúng tôi đang cập nhật thêm bài viết hướng dẫn
              </p>
              <a
                href="#contact"
                className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Gửi câu hỏi của bạn
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ===== CONTACT & SUPPORT SECTION ===== */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ===== CONTACT GRID (LIVE CHAT + HOTLINE) ===== */}
        <div id="contact" className="grid md:grid-cols-2 gap-6 mb-8">
          {/* LIVE CHAT */}
          <div className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Chat trực tuyến</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Phản hồi trong 5-10 phút
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Thứ 2-CN: 9:00 - 21:00</span>
                </div>
                <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                  Bắt đầu chat ngay
                </button>
              </div>
            </div>
          </div>

          {/* HOTLINE */}
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-start gap-4">
<div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="17" cy="7" r="3" fill="currentColor"/>
                  <path d="M16 4v6M13 7h6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Hotline</h3>
                <a 
                  href="tel:1900851775"
                  className="text-2xl font-bold text-green-600 hover:text-green-700 block mb-2"
                >
                  1900-851-775
                </a>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Hàng ngày: 8:00 - 22:00</span>
                </div>
                <p className="text-sm text-gray-600">
                  Phí cuộc gọi theo nhà mạng
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== EMAIL SUPPORT ===== */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Gửi email cho chúng tôi
              </h3>
              <p className="text-gray-600 mb-4">
                Phản hồi trong vòng <strong>24 giờ</strong> (ngày làm việc). 
                Thích hợp cho các vấn đề phức tạp hoặc cần đính kèm tài liệu.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@travyy.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  support@travyy.com
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Form liên hệ
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SLA INFO ===== */}
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
          <h3 className="font-semibold text-gray-900 mb-3">Cam kết thời gian phản hồi (SLA)</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-amber-100">
              <div className="font-semibold text-gray-900 mb-1">Khẩn cấp</div>
              <div className="text-sm text-gray-600 mb-2">Thanh toán lỗi, không vào tour</div>
              <div className="text-xs text-gray-500">Phản hồi &lt; 1h • Giải quyết &lt; 4h</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-100">
              <div className="font-semibold text-gray-900 mb-1">Cao</div>
              <div className="text-sm text-gray-600 mb-2">Hủy/đổi đơn, hoàn tiền</div>
              <div className="text-xs text-gray-500">Phản hồi &lt; 4h • Giải quyết &lt; 24h</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-100">
              <div className="font-semibold text-gray-900 mb-1">Thường</div>
              <div className="text-sm text-gray-600 mb-2">Thắc mắc chung, hướng dẫn</div>
              <div className="text-xs text-gray-500">Phản hồi &lt; 24h • Giải quyết &lt; 72h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}