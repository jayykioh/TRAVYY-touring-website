// components/HelpCenter.jsx - Main Help Center Component
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Eye, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function HelpCenter() {
  const [categories, setCategories] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, featuredData] = await Promise.all([
        fetch(`${API_URL}/help/categories`).then(r => r.json()),
        fetch(`${API_URL}/help/featured`).then(r => r.json())
      ]);
      
      setCategories(categoriesData.data || []);
      setFeaturedArticles(featuredData.data || []);
    } catch (error) {
      console.error('Error loading help center:', error);
      toast.error('Không thể tải dữ liệu trợ giúp');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const result = await fetch(`${API_URL}/help/search?q=${encodeURIComponent(query)}`).then(r => r.json());
      setSearchResults(result.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🆘 Trung tâm Trợ giúp
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Tìm câu trả lời cho các câu hỏi thường gặp
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm câu hỏi hoặc từ khóa..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
              {searchResults.map((article) => (
                <Link
                  key={article._id}
                  to={`/profile/help/article/${article.slug}`}
                  className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{article.icon || '📄'}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{article.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {searchQuery && !searching && searchResults.length === 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 text-center text-gray-500">
              Không tìm thấy kết quả cho "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📚 Chọn chủ đề bạn quan tâm
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/profile/help/category/${category.slug}`}
              className="group block p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {category.articleCount} bài viết
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ⭐ Câu hỏi thường gặp
          </h2>
          
          <div className="space-y-4">
            {featuredArticles.map((article) => (
              <Link
                key={article._id}
                to={`/profile/help/article/${article.slug}`}
                className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{article.icon || '📄'}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views?.toLocaleString() || 0} lượt xem</span>
                      </div>
                      {article.helpfulnessRate !== null && (
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{article.helpfulnessRate}% hữu ích</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">
          ❓ Không tìm thấy câu trả lời?
        </h3>
        <p className="text-gray-600 mb-4">
          Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp bạn!
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:support@travyy.com"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📧 Email hỗ trợ
          </a>
          <a
            href="tel:1900-xxx-xxx"
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            📞 Hotline: 1900-xxx-xxx
          </a>
        </div>
      </div>
    </div>
  );
}
