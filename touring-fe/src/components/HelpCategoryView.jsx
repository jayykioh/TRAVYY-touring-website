// components/HelpCategoryView.jsx - Category Articles List
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Home, ChevronLeft, Eye, ThumbsUp } from "lucide-react";
import logger from "../utils/logger";

import { 
  helpCategories, 
  getArticlesByCategory 
} from "@/mockdata/helpData";

export default function HelpCategoryPage() {
  const { category: slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      const cat = helpCategories.find(c => c.slug === slug);
      
      if (!cat) {
        navigate("/help");
        return;
      }

      setCategory(cat);
      setArticles(getArticlesByCategory(slug));
    } catch (error) {
      logger.error("Error loading category:", error);
      navigate("/help");
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded w-2/3"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/help" className="hover:text-blue-600 transition-colors">
          Trợ giúp
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{category.name}</span>
      </nav>

      {/* BACK BUTTON */}
      <Link
        to="/help"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại Trung tâm Trợ giúp
      </Link>

      {/* CATEGORY HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{category.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            <p className="text-gray-600">{category.description}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {articles.length} bài viết trong chủ đề này
        </div>
      </div>

      {/* ARTICLES LIST */}
      {articles.length > 0 ? (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article._id}
              to={`/help/article/${article.slug}`}
              className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{article.icon || "📄"}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>

                  {/* METRICS & TAGS */}
                  <div className="flex items-center gap-4 text-sm">
                    {article.views && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                    )}
                    {article.helpfulCount && article.totalFeedback && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{Math.round((article.helpfulCount / article.totalFeedback) * 100)}%</span>
                      </div>
                    )}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex items-center gap-2 ml-auto">
                        {article.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // EMPTY STATE
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có bài viết
          </h3>
          <p className="text-gray-600 mb-4">
            Nội dung đang được cập nhật
          </p>
          <Link
            to="/help"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem chủ đề khác
          </Link>
        </div>
      )}

      {/* NEED MORE HELP */}
      <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">
          ❓ Không tìm thấy câu trả lời?
        </h3>
        <p className="text-gray-600 mb-4">
          Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp bạn!
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:support@travyy.com"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📧 Email hỗ trợ
          </a>
          <a
            href="tel:1900851775"
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            📞 Hotline: 1900-851-775
          </a>
        </div>
      </div>
    </div>
  );
}