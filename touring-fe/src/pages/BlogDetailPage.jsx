// BlogDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowLeft, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogPostsData } from '../mockdata/blogData';

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const blogId = parseInt(id);
  
  const [currentPost, setCurrentPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  // ✅ Load bài viết hiện tại và các bài liên quan
  useEffect(() => {
    // Scroll to top khi component mount hoặc blogId thay đổi
    window.scrollTo(0, 0);
    
    const post = blogPostsData.find(p => p.id === blogId);
    if (post) {
      setCurrentPost(post);
      
      // Load 5 bài viết liên quan (không bao gồm bài hiện tại)
      const related = blogPostsData
        .filter(p => p.id !== blogId)
        .slice(0, 5);
      setRelatedPosts(related);
    }
  }, [blogId]);

  // ✅ Infinite scroll - load thêm bài viết khi scroll gần cuối
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        setRelatedPosts(prev => {
          const lastPost = prev[prev.length - 1];
          const lastIndex = blogPostsData.findIndex(p => p.id === lastPost?.id);
          
          if (lastIndex !== -1) {
            // Load thêm 3 bài tiếp theo
            const nextPosts = [];
            for (let i = 1; i <= 3; i++) {
              const index = (lastIndex + i) % blogPostsData.length;
              const nextPost = blogPostsData[index];
              // Không thêm bài đã có và bài hiện tại
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
    navigate(-1);
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
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Bài viết</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Feed */}
      <div className="max-w-2xl mx-auto">
        {/* Bài viết chính */}
        <BlogPostCard 
          key={currentPost.id}
          post={currentPost}
          isFirst={true}
        />
        
        {/* Các bài viết liên quan */}
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

// ✅ Component riêng cho mỗi blog post
const BlogPostCard = ({ post, isFirst }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllCaption, setShowAllCaption] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const displayCaption = showAllCaption 
    ? post.caption 
    : post.caption.slice(0, 150) + (post.caption.length > 150 ? '...' : '');

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
    <div className="bg-white mb-4">
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
          
          {/* Navigation trong fullscreen */}
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
          
          {/* Image counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            {currentImageIndex + 1} / {post.images.length}
          </div>
        </div>
      )}

      {/* Author Info */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{post.author.username}</span>
              {post.author.verified && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-500">{post.publishDate}</span>
          </div>
        </div>
        <button className="p-2">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Images Carousel - Chiều cao vừa phải */}
      <div className="relative bg-black cursor-pointer" onClick={() => setShowFullImage(true)}>
        <img
          src={post.images[currentImageIndex]}
          alt={`Slide ${currentImageIndex + 1}`}
          className="w-full h-96 object-cover"
        />
        
        {/* Navigation Arrows */}
        {post.images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {post.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {post.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLiked(!liked)}
              className="hover:opacity-60 transition-opacity"
            >
              <Heart 
                className={`w-7 h-7 ${liked ? 'fill-red-500 text-red-500' : ''}`}
              />
            </button>
            <button className="hover:opacity-60 transition-opacity">
              <MessageCircle className="w-7 h-7" />
            </button>
            <button className="hover:opacity-60 transition-opacity">
              <Send className="w-7 h-7" />
            </button>
          </div>
          <button 
            onClick={() => setBookmarked(!bookmarked)}
            className="hover:opacity-60 transition-opacity"
          >
            <Bookmark 
              className={`w-7 h-7 ${bookmarked ? 'fill-black' : ''}`}
            />
          </button>
        </div>

        {/* Likes Count */}
        <div className="font-semibold text-sm mb-2">
          {liked ? post.likes + 1 : post.likes} lượt thích
        </div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{post.author.username}</span>
          <span className="whitespace-pre-line">{displayCaption}</span>
          {!showAllCaption && post.caption.length > 150 && (
            <button 
              onClick={() => setShowAllCaption(true)}
              className="text-gray-500 ml-1"
            >
              xem thêm
            </button>
          )}
        </div>

        {/* Comments Preview */}
        <button className="text-sm text-gray-500 mt-2">
          Xem tất cả {post.comments} bình luận
        </button>

        {/* Add Comment */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"
            alt="Your avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <input
            type="text"
            placeholder="Thêm bình luận..."
            className="flex-1 text-sm outline-none"
          />
          <button className="text-blue-500 font-semibold text-sm">
            Đăng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;