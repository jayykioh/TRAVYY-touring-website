import { useState, useEffect } from 'react';
import { X, Star, MapPin, Calendar, Award, Languages } from 'lucide-react';
import { Button } from '../../ui/button';
import GuideReviewSection from '../GuideReviewSection';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function GuideProfileModal({ guideId, guideName, onClose }) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'reviews'

  useEffect(() => {
    const fetchGuideDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/guide/profile/${guideId}`);
        
        if (response.data.success) {
          setGuide(response.data.guide);
        }
      } catch (error) {
        console.error('Error fetching guide:', error);
      } finally {
        setLoading(false);
      }
    };

    if (guideId) {
      fetchGuideDetails();
    }
  }, [guideId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Thông tin hướng dẫn viên</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guide Header */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-2xl flex-shrink-0">
              {(guide?.name || guideName)?.charAt(0)?.toUpperCase() || 'G'}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">
                {guide?.name || guideName}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {guide?.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({guide?.totalTours || 0} đánh giá)
                </span>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {guide?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{guide.location}</span>
                  </div>
                )}
                {guide?.experience && (
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>{guide.experience}</span>
                  </div>
                )}
                {guide?.languages && guide.languages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Languages className="w-4 h-4" />
                    <span>{guide.languages.join(', ')}</span>
                  </div>
                )}
                {guide?.joinedDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Tham gia {new Date(guide.joinedDate).getFullYear()}
                    </span>
                  </div>
                )}
              </div>

              {/* Verified Badge */}
              {guide?.isVerified && (
                <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Đã xác minh
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Thông tin
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đánh giá ({guide?.totalTours || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              {/* Bio */}
              {guide?.bio && (
                <div>
                  <h4 className="font-semibold mb-2">Giới thiệu</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{guide.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {guide?.specialties && guide.specialties.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Chuyên môn</h4>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coverage Areas */}
              {guide?.coverageAreas && guide.coverageAreas.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Khu vực hoạt động</h4>
                  <div className="flex flex-wrap gap-2">
                    {guide.coverageAreas.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {guide?.certifications && guide.certifications.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Chứng chỉ</h4>
                  <div className="space-y-2">
                    {guide.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <p className="font-medium">{cert.name}</p>
                        {cert.issuer && (
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                        )}
                        {cert.verified && (
                          <span className="text-xs text-green-600">✓ Đã xác minh</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <GuideReviewSection guideId={guideId} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
