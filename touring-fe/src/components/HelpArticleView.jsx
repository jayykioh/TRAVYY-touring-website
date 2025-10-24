// components/HelpArticleView.jsx - Single Article View with Feedback
import { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Eye, Clock, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AuthCtx } from '@/auth/context';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function HelpArticleView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { withAuth, isAuth } = useContext(AuthCtx);
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  useEffect(() => {
    loadArticle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const result = await fetch(`${API_URL}/help/article/${slug}`).then(r => r.json());
      setArticle(result.data);
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Không thể tải bài viết');
      navigate('/profile/help');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful) => {
    try {
      const result = isAuth
        ? await withAuth(`/api/help/article/${article._id}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ helpful, comment: '' })
          })
        : await fetch(`${API_URL}/help/article/${article._id}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ helpful, comment: '' })
          }).then(r => r.json());

      setFeedbackGiven(true);
      
      // Update article counts
      setArticle(prev => ({
        ...prev,
        helpfulCount: result.data.helpfulCount,
        notHelpfulCount: result.data.notHelpfulCount,
        helpfulnessRate: result.data.helpfulnessRate
      }));

      toast.success('Cảm ơn phản hồi của bạn!', {
        icon: helpful ? '👍' : '👎'
      });
    } catch (error) {
      if (error.response?.data?.message?.includes('already submitted')) {
        toast.error('Bạn đã gửi phản hồi cho bài viết này rồi');
        setFeedbackGiven(true);
      } else {
        toast.error('Không thể gửi phản hồi');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const totalFeedback = article.helpfulCount + article.notHelpfulCount;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
        <Link to="/profile" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-4 h-4" />
          Profile
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/profile/help" className="hover:text-blue-600">
          Trợ giúp
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">{article.title}</span>
      </nav>

      {/* Article Header */}
      <div className="mb-8">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-5xl">{article.icon || '📄'}</span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{article.views?.toLocaleString() || 0} lượt xem</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Cập nhật {formatDate(article.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <ReactMarkdown
            components={{
              h1: ({ ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
              h2: ({ ...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
              h3: ({ ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
              p: ({ ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
              ul: ({ ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
              ol: ({ ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
              li: ({ ...props}) => <li className="ml-4" {...props} />,
              code: ({ inline, ...props}) => 
                inline 
                  ? <code className="bg-gray-100 px-2 py-1 rounded text-sm" {...props} />
                  : <code className="block bg-gray-100 p-4 rounded-lg overflow-x-auto" {...props} />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">
          ❓ Bài viết này có hữu ích không?
        </h3>
        
        {!feedbackGiven ? (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleFeedback(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">Hữu ích</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="font-medium">Chưa hữu ích</span>
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-lg">
              <Check className="w-5 h-5" />
              <span className="font-medium">Cảm ơn phản hồi của bạn!</span>
            </div>
          </div>
        )}

        {totalFeedback > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            💬 {article.helpfulnessRate}% người dùng thấy hữu ích ({totalFeedback} phản hồi)
          </div>
        )}
      </div>

      {/* Related Articles */}
      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📚 Bài viết liên quan
          </h3>
          <div className="space-y-3">
            {article.relatedArticles.map((related) => (
              <Link
                key={related._id}
                to={`/profile/help/article/${related.slug}`}
                className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{related.icon || '📄'}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 hover:text-blue-600">
                      {related.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {related.excerpt}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Still Need Help */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">
          🆘 Vẫn cần trợ giúp?
        </h3>
        <p className="text-gray-600 mb-4">
          Liên hệ với đội ngũ hỗ trợ của chúng tôi
        </p>
        <div className="flex flex-wrap gap-3">
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
            📞 Hotline
          </a>
          <Link
            to="/profile/help"
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
}
