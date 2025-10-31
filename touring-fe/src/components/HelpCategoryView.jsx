// components/HelpCategoryView.jsx - Category Articles List
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Eye, ThumbsUp, Search } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function HelpCategoryView() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [categoryData, setCategoryData] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const result = await fetch(`${API_URL}/help/category/${category}`).then(r => r.json());
      setCategoryData(result.category);
      setArticles(result.data || []);
    } catch (error) {
      console.error('Error loading category:', error);
      toast.error('Không thể tải danh mục');
      navigate('/help');
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = searchQuery
    ? articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/help" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-4 h-4" />
          Help
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/help" className="hover:text-blue-600">
          Trợ giúp
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{categoryData?.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl">{categoryData?.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {categoryData?.name}
            </h1>
            <p className="text-gray-600">{categoryData?.description}</p>
          </div>
        </div>

        {/* Search in category */}
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm trong mục này..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có bài viết'}
          </h3>
          <p className="text-gray-600">
            {searchQuery ? `Không có bài viết nào phù hợp với "${searchQuery}"` : 'Danh mục này chưa có bài viết nào.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <Link
              key={article._id}
              to={`/help/article/${article.slug}`}
              className="block p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{article.icon || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{article.views?.toLocaleString() || 0}</span>
                    </div>
                    {article.helpfulnessRate !== null && (
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{article.helpfulnessRate}% hữu ích</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8">
        <Link
          to="/help"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          ← Quay lại trang chủ trợ giúp
        </Link>
      </div>
    </div>
  );
}
