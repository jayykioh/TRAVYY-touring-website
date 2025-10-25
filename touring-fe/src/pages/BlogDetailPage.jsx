import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowLeft, Share2, ThumbsUp, Clock, Eye } from 'lucide-react';
import { blogPostsData, pageInfo } from '../mockdata/blogData';

const BlogDetailPage = () => {
  // Giả lập useParams và useNavigate từ react-router-dom
  const getPostIdFromUrl = () => {
    const path = window.location.hash || window.location.pathname;
    const match = path.match(/\/blog\/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  const blogId = getPostIdFromUrl();
  
  const [currentPost, setCurrentPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const post = blogPostsData.find(p => p.id === blogId);
    if (post) {
      setCurrentPost(post);
      
      const related = blogPostsData
        .filter(p => p.id !== blogId)
        .slice(0, 5);
      setRelatedPosts(related);
    }
  }, [blogId]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        setRelatedPosts(prev => {
          const lastPost = prev[prev.length - 1];
          const lastIndex = blogPostsData.findIndex(p => p.id === lastPost?.id);
          
          if (lastIndex !== -1) {
            const nextPosts = [];
            for (let i = 1; i <= 3; i++) {
              const index = (lastIndex + i) % blogPostsData.length;
              const nextPost = blogPostsData[index];
              if (!prev.find(p => p.id === nextPost.id) && nextPost.id !== blogId) {
                nextPosts.push(nextPost);
              }
            }
            return [...prev, ...nextPosts];
          }
          return prev;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blogId]);

  const handleGoBack = () => {
    window.history.back();
  };

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={pageInfo.avatar}
              alt={pageInfo.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-gray-900">{pageInfo.name}</span>
            {pageInfo.verified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
              </svg>
            )}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Feed */}
      <div className="max-w-3xl mx-auto">
        <BlogPostCard 
          key={currentPost.id}
          post={currentPost}
          isFirst={true}
        />
        
        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-1">Bài viết liên quan</h3>
            <p className="text-sm text-gray-600">Từ {pageInfo.name}</p>
          </div>
        )}
        
        {relatedPosts.map((post) => (
          <BlogPostCard 
            key={post.id}
            post={post}
            isFirst={false}
          />
        ))}
      </div>
    </div>
  );
};

const BlogPostCard = ({ post, isFirst }) => {
  const [liked, setLiked] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllCaption, setShowAllCaption] = useState(isFirst);
  const [showFullImage, setShowFullImage] = useState(false);

  const displayCaption = showAllCaption 
    ? post.caption 
    : post.caption.slice(0, 200) + (post.caption.length > 200 ? '...' : '');

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === post.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-white mb-3 border-b border-gray-200">
      {/* Fullscreen Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          onClick={() => setShowFullImage(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setShowFullImage(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img
            src={post.images[currentImageIndex]}
            alt={`Slide ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          {post.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} / {post.images.length}
          </div>
        </div>
      )}

      {/* Page Info Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={pageInfo.avatar}
            alt={pageInfo.name}
            className="w-11 h-11 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[15px] text-gray-900">{pageInfo.name}</span>
              {pageInfo.verified && (
                <svg className="w-[18px] h-[18px] text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>{post.publishDate}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold text-sm rounded-md transition-colors">
            Theo dõi
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Title - Only on first post */}
      {isFirst && (
        <div className="px-4 pb-3">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>
        </div>
      )}

      {/* Images Carousel */}
      <div className="relative bg-black cursor-pointer" onClick={() => setShowFullImage(true)}>
        <img
          src={post.images[currentImageIndex]}
          alt={`Slide ${currentImageIndex + 1}`}
          className="w-full h-auto max-h-[600px] object-contain mx-auto"
        />
        
        {post.images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all z-10 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all z-10 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {post.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {post.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Caption */}
        <div className="mb-3">
          <p className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-line">
            {displayCaption}
          </p>
          {!showAllCaption && post.caption.length > 200 && (
            <button 
              onClick={() => setShowAllCaption(true)}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm mt-1"
            >
              Xem thêm
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 py-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4 text-blue-500 fill-blue-500" />
            <span>{post.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{post.comments} bình luận</span>
            <span>{post.shares} chia sẻ</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around py-2 border-t border-gray-200">
          <button 
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
              liked ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-blue-600' : ''}`} />
            <span className="font-medium">Thích</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Bình luận</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Chia sẻ</span>
          </button>
          <button 
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
              bookmarked ? 'text-yellow-600' : 'text-gray-600'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-yellow-600' : ''}`} />
          </button>
        </div>

        {/* Comment Input */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200">
          <img
            src={pageInfo.avatar}
            alt="User"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Viết bình luận..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button className="text-gray-400 hover:text-blue-600 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;