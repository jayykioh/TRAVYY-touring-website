import React, { useState, useEffect, useCallback } from 'react';
import { X, User, Star, DollarSign, MessageSquare, Send, Loader2, MapPin, CheckCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/auth/context';
import { useNavigate } from 'react-router-dom';
import { useCheckActiveRequest } from '@/hooks/useCheckActiveRequest';
import logger from '@/utils/logger';

export default function RequestGuideModal({ isOpen, onClose, itineraryId, itineraryName, itineraryLocation }) {
  const { withAuth, user } = useAuth();
  const navigate = useNavigate();
  const { checkActiveRequest } = useCheckActiveRequest();
  
  const [step, setStep] = useState(1); // 1: Select guide, 2: Enter details
  const [guides, setGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    budget: '',
    numberOfPeople: 1,
    preferredDate: '',
    specialRequirements: '',
    contactPhone: '',
  });

  // Helpers for budget formatting
  const formatNumber = (v) => {
    if (v == null) return '';
    const s = String(v);
    return s.replace(/[^0-9]/g, '');
  };

  const formatDisplay = (v) => {
    const cleaned = formatNumber(v);
    if (!cleaned) return '';
    try {
      return Number(cleaned).toLocaleString('vi-VN');
    } catch {
      return cleaned;
    }
  };

  const handleBudgetChange = (val) => {
    const cleaned = formatNumber(val);
    setFormData((f) => ({ ...f, budget: cleaned ? formatDisplay(cleaned) : '' }));
  };

  const getBudgetValueNumber = (budgetStr) => {
    const cleaned = formatNumber(budgetStr);
    return cleaned ? Number(cleaned) : 0;
  };

  // Define loadGuides first (before useEffect that uses it)
  const loadGuides = useCallback(async () => {
    setLoadingGuides(true);
    try {
      // Build query params with zoneName for accurate filtering
      const params = new URLSearchParams();
      if (itineraryLocation) {
        params.append('zoneName', itineraryLocation);
      }
      
      const data = await withAuth(`/api/guide/available?${params.toString()}`);
      
      logger.info('📍 [Guides] Loaded for zone:', itineraryLocation, 'Found:', data.guides?.length || 0);
      setGuides(data.guides || []);
      
      // Show info if no guides found in this area
      if (data.guides && data.guides.length === 0 && itineraryLocation) {
        toast.info(`Hiện chưa có hướng dẫn viên tại ${itineraryLocation}. Vui lòng chọn khu vực khác hoặc liên hệ admin.`, {
          duration: 5000
        });
      }
    } catch (error) {
      logger.error('Error loading guides:', error);
      toast.error('Không thể tải danh sách hướng dẫn viên');
      setGuides([]);
    } finally {
      setLoadingGuides(false);
    }
  }, [itineraryLocation, withAuth]);

  // Check if user has active request for this itinerary + Load guides
  useEffect(() => {
    if (!isOpen) return;

    const checkAndLoadGuides = async () => {
      logger.debug('[RequestGuide] Modal opened, checking for active requests...');
      
      // 1. Check for active request (fast check first)
      if (itineraryId) {
        try {
          logger.debug('[RequestGuide] Checking active request for itinerary:', itineraryId);
          const result = await checkActiveRequest(itineraryId);
          logger.debug('[RequestGuide] Active request check result:', result);
          
          if (result?.hasActive) {
            logger.info('[RequestGuide] User already has active request:', result.requestId);
            toast.error('Bạn đã có yêu cầu đang chờ xử lý cho lộ trình này. Hãy xem trang "Yêu cầu của tôi".', {
              duration: 4000,
              action: {
                label: 'Xem yêu cầu',
                onClick: () => {
                  onClose();
                  navigate('/my-tour-requests');
                }
              }
            });
            return; // Don't load guides if already has active request
          }
        } catch (error) {
            logger.warn('[RequestGuide] Active request check failed (continuing anyway):', error.message);
          // Continue loading guides even if check fails - don't block the modal
        }
      }

      // 2. Load available guides in parallel
      logger.debug('[RequestGuide] Loading available guides...');
      loadGuides();
    };

    checkAndLoadGuides();
  }, [isOpen, itineraryId, checkActiveRequest, loadGuides, onClose, navigate]);

  const handleGuideSelect = (guide) => {
    setSelectedGuide(guide);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedGuide(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedGuide) {
      toast.error('Vui lòng chọn hướng dẫn viên');
      return;
    }

    // Validate budget format and value (clean formatted input)
    const budgetNum = getBudgetValueNumber(formData.budget);
    if (!formData.budget || isNaN(budgetNum) || budgetNum <= 0) {
      toast.error('Ngân sách phải là số dương (VD: 2000000)');
      return;
    }
    if (budgetNum > 999999999) {
      toast.error('Ngân sách quá lớn');
      return;
    }

    if (!formData.preferredDate) {
      toast.error('Vui lòng chọn ngày khởi hành dự kiến');
      return;
    }

    // Validate phone number (Vietnamese format: 10 digits starting with 0)
    if (formData.contactPhone && !/^0\d{9}$/.test(formData.contactPhone.replace(/\s+/g, ''))) {
      toast.error('Số điện thoại không hợp lệ (VD: 0912345678)');
      return;
    }

    if (!itineraryId) {
      toast.error('Lỗi: Không tìm thấy lộ trình. Vui lòng tạo lại lộ trình.');
      return;
    }

    setSubmitting(true);
    try {
      // Check for active request again (race condition prevention)
      logger.debug('[RequestGuide] Checking for active request (pre-submit)...');
      try {
        const activeCheck = await checkActiveRequest(itineraryId);
        logger.debug('[RequestGuide] Pre-submit active check:', activeCheck);
        if (activeCheck?.hasActive) {
          toast.error('Bạn đã có yêu cầu đang chờ xử lý cho lộ trình này.', {
            duration: 3000,
            action: {
              label: 'Xem yêu cầu',
              onClick: () => navigate('/my-tour-requests')
            }
          });
          setSubmitting(false);
          return;
        }
      } catch (checkError) {
        logger.warn('[RequestGuide] Pre-submit check failed, proceeding anyway:', checkError.message);
        // Continue with submission - backend will validate
      }

      // Build request body with minimal overhead
      const requestBody = {
        itineraryId,
        guideId: selectedGuide._id,
        initialBudget: {
          amount: budgetNum,
          currency: 'VND'
        },
        numberOfGuests: parseInt(formData.numberOfPeople),
        preferredDates: [formData.preferredDate],
        specialRequirements: formData.specialRequirements || '',
        contactInfo: {
          phone: formData.contactPhone || '',
          email: user?.email || '',
        },
      };

      logger.info('🔍 [RequestGuide] Sending request body:', requestBody);
      logger.info('📋 [RequestGuide] Selected guide details:', {
        id: selectedGuide._id,
        name: selectedGuide.name,
        rating: selectedGuide.rating
      });

      const result = await withAuth('/api/tour-requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      logger.info('✅ [RequestGuide] Success response:', result);

      // Show success message
      toast.success('Đã gửi yêu cầu thành công! Đang chuyển hướng...', {
        duration: 2000,
      });

      // Close modal immediately (don't wait for navigation)
      onClose();
      
      // Reset form
      setStep(1);
      setSelectedGuide(null);
      setFormData({
        budget: '',
        numberOfPeople: 1,
        preferredDate: '',
        specialRequirements: '',
        contactPhone: '',
      });

      // Redirect to tour requests list page (profile/my-tour-requests)
      // This is more reliable than the details page which may have loading issues
      setTimeout(() => {
        navigate('/profile/my-tour-requests');
      }, 300); // Shorter delay for faster response
    } catch (error) {
      logger.error('❌ [RequestGuide] Error submitting request:', {
        message: error.message,
        status: error.status,
        body: error.body,
        fullError: error
      });
      
      // Show specific error message from backend if available
      let errorMessage = 'Không thể gửi yêu cầu. Vui lòng thử lại.';
      
      if (error.body?.error) {
        errorMessage = error.body.error;
      } else if (error.body?.message) {
        errorMessage = error.body.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Log the full error details for debugging
      logger.error('[RequestGuide] Full error details:', {
        status: error.status,
        body: JSON.stringify(error.body),
        message: errorMessage
      });
      
      // Handle specific error cases
      if (error.status === 400) {
        // Check if it's a duplicate request error (matches both English and Vietnamese)
        if (error.body?.error?.includes('Active request exists') || 
            error.body?.error?.includes('already have an active request') || 
            error.body?.error?.includes('đã có yêu cầu')) {
          toast.error('Bạn đã có yêu cầu đang chờ xử lý cho lộ trình này. Hãy xem trang "Yêu cầu của tôi".', {
            duration: 4000,
            action: {
              label: 'Xem yêu cầu',
              onClick: () => {
                onClose();
                navigate('/my-tour-requests');
              }
            }
          });
          return;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#02A0AA] to-[#029ca6] text-white p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Yêu cầu Hướng dẫn viên</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white/90 text-sm">
              {itineraryName || 'Tour của bạn'}
            </p>
            
            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1 ? 'bg-white text-[#02A0AA]' : 'bg-white/20'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Chọn HDV</span>
              </div>
              <div className="flex-1 h-1 bg-white/20 rounded-full mx-2">
                <div className={`h-full bg-white rounded-full transition-all ${
                  step >= 2 ? 'w-full' : 'w-0'
                }`} />
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-white' : 'text-white/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2 ? 'bg-white text-[#02A0AA]' : 'bg-white/20'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Chi tiết</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 ? (
              // Step 1: Select Guide
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chọn Hướng dẫn viên
                  </h3>
                  {itineraryLocation && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{itineraryLocation}</span>
                    </div>
                  )}
                </div>

                {loadingGuides ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#02A0AA]" />
                  </div>
                ) : guides.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-900 font-medium mb-2">
                      {itineraryLocation 
                        ? `Chưa có hướng dẫn viên tại ${itineraryLocation}` 
                        : 'Hiện không có hướng dẫn viên nào'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {itineraryLocation 
                        ? 'Vui lòng chọn khu vực khác hoặc liên hệ admin để được hỗ trợ'
                        : 'Vui lòng thử lại sau'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {guides.map((guide) => (
                      <button
                        key={guide._id}
                        onClick={() => handleGuideSelect(guide)}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#02A0AA] hover:bg-[#02A0AA]/5 transition-all text-left relative"
                      >
                        {/* Verified badge */}
                        {guide.licenseVerified && (
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Đã xác thực
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#02A0AA] to-[#029ca6] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {guide.name?.charAt(0) || 'G'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-lg mb-1">
                              {guide.name || 'Hướng dẫn viên'}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-medium">{guide.rating || 5.0}</span>
                              </div>
                              {guide.totalTours > 0 && (
                                <span className="text-gray-400">• {guide.totalTours} tours</span>
                              )}
                              {guide.location && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {guide.location}
                                </span>
                              )}
                            </div>

                            {guide.languages && guide.languages.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {guide.languages.map((lang, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                                  >
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            )}

                            {guide.specialties && guide.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {guide.specialties.slice(0, 3).map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-[#02A0AA]/10 text-[#02A0AA] text-xs rounded-full"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                                {guide.specialties.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                    +{guide.specialties.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {guide.bio && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {guide.bio}
                              </p>
                            )}

                            {guide.coverageAreas && guide.coverageAreas.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                <span className="font-medium">Khu vực:</span> {guide.coverageAreas.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Step 2: Enter Request Details
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-[#02A0AA]/5 border border-[#02A0AA]/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#02A0AA] to-[#029ca6] flex items-center justify-center text-white font-bold">
                      {selectedGuide?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedGuide?.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {selectedGuide?.rating || 5.0} • {selectedGuide?.totalTours || 0} tours
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Ngân sách (VND) *
                    </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        value={formData.budget}
                        onChange={(e) => handleBudgetChange(e.target.value)}
                        onFocus={() => setFormData((f) => ({ ...f, budget: formatNumber(f.budget) }))}
                        onBlur={() => setFormData((f) => ({ ...f, budget: formatDisplay(f.budget) }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
                        placeholder="2,000,000"
                      />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Số người *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.numberOfPeople}
                      onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày dự kiến *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent"
                    placeholder="0912345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Yêu cầu đặc biệt
                  </label>
                  <textarea
                    rows={4}
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02A0AA] focus:border-transparent resize-none"
                    placeholder="Ví dụ: Cần hướng dẫn viên biết tiếng Anh, có kinh nghiệm với trẻ em..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Hướng dẫn viên sẽ xem xét và có thể đề xuất giá phù hợp hơn. 
                  Bạn có thể thương lượng trước khi chấp nhận.
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={step === 1 ? onClose : handleBack}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              disabled={submitting}
            >
              {step === 1 ? 'Hủy' : 'Quay lại'}
            </button>

            {step === 2 && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || !selectedGuide || !formData.budget || !formData.preferredDate}
                className="flex items-center gap-2 px-6 py-2 bg-[#02A0AA] text-white rounded-lg hover:bg-[#029ca6] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Gửi yêu cầu
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      )}
    </AnimatePresence>
  );
}
