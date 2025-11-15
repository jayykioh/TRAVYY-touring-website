/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Sparkles, Navigation, ExternalLink, ShoppingCart, Building2, Download, Share2, ChevronDown, ChevronUp, Star, Phone, Globe, Calendar, Users, Camera, Heart, Coffee, Utensils, Plane } from 'lucide-react';
import { useItinerary } from '@/hooks/useIntinerary';
import { useAuth } from '@/auth/context';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Map4DPanel from '@/components/Map4DPanel';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

export default function ItineraryView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentItinerary, loadCurrentItinerary } = useItinerary();
  const { isAuth, withAuth } = useAuth();

  const passed = location.state?.itinerary;
  const itinerary = useMemo(() => passed || currentItinerary, [passed, currentItinerary]);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (!itinerary) loadCurrentItinerary();
  }, []);

  useEffect(() => {
    if (itinerary?.items) {
      console.log('🗺️ ItineraryView - Items with coordinates:',
        itinerary.items.map((item, idx) => ({
          index: idx + 1,
          name: item.name,
          address: item.address,
          location_object: item.location,
          location_lat: item.location?.lat,
          location_lng: item.location?.lng,
          flat_lat: item.lat,
          flat_lng: item.lng,
          loc_object: item.loc,
          loc_lat: item.loc?.lat,
          loc_lng: item.loc?.lng,
        }))
      );
    }
  }, [itinerary]);

  const getCoordinates = (item) => {
    const lat = item.location?.lat || item.lat || item.loc?.lat;
    const lng = item.location?.lng || item.lng || item.loc?.lng;
    return { lat, lng };
  };

  const hasValidCoordinates = (item) => {
    const { lat, lng } = getCoordinates(item);
    return lat && lng && lat !== 0 && lng !== 0;
  };

  const prepareForDistanceMatrix = () => {
    const validItems = itinerary.items.filter(hasValidCoordinates);
    const origins = validItems.map(item => {
      const { lat, lng } = getCoordinates(item);
      return `${lat},${lng}`;
    }).join('|');

    console.log('📍 Distance Matrix Origins:', origins);
    console.log('✅ Valid items:', validItems.length, '/', itinerary.items.length);
    return { origins, validItems };
  };

  const handleBack = () => {
    if (itinerary?.zoneId) {
      navigate(`/zone/${itinerary.zoneId}`);
    } else {
      navigate('/');
    }
  };

  const handleOptimizeClick = () => {
    if (!isAuth) {
      toast.error('Vui lòng đăng nhập để tối ưu hành trình');
      navigate('/login');
      return;
    }
    if (!itinerary?._id) {
      toast.error('Không tìm thấy hành trình. Vui lòng thử lại.');
      return;
    }
    const { validItems } = prepareForDistanceMatrix();
    if (validItems.length < 2) {
      toast.error('Cần ít nhất 2 địa điểm có tọa độ hợp lệ để tối ưu');
      return;
    }
    setShowAlert(true);
  };

  const handleOptimizeConfirm = async () => {
    try {
      setIsOptimizing(true);
      const { validItems } = prepareForDistanceMatrix();
      console.log('🚀 Calling backend optimize-ai for itinerary:', itinerary._id, {
        validCount: validItems.length
      });

      const data = await withAuth(`/api/itinerary/${itinerary._id}/optimize-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      console.log('✅ Optimize result:', data.itinerary);
      toast.success('Tối ưu hành trình thành công!');
      navigate(`/itinerary/result/${data.itinerary._id}`, {
        state: { itinerary: data.itinerary }
      });
    } catch (error) {
      console.error('❌ Optimize error:', error);
      if (error.status === 400) {
        toast.error(error.body?.error || 'Dữ liệu không hợp lệ');
      } else if (error.status === 404) {
        toast.error('Không tìm thấy hành trình');
      } else if (error.status === 500) {
        toast.error('Lỗi server. Vui lòng thử lại sau.');
      } else {
        toast.error('Lỗi khi tối ưu: ' + error.message);
      }
    } finally {
      setIsOptimizing(false);
      setShowAlert(false);
    }
  };

  if (!itinerary) {
    return (
      <div className="min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #1e5a6d 0%, #2d7a8f 50%, #3d9cb0 100%)' }}>
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm hover:text-white mb-6 text-white/90"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="rounded-3xl bg-white/95 backdrop-blur p-8 shadow-2xl">
            <div className="text-center text-slate-600 flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
              Đang tải hành trình...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items = itinerary.items || [];
  const totalItems = items.length;

  // Empty State
  if (totalItems === 0) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #3d7a8f 0%, #4d9aaf 50%, #5dbcc0 100%)' }}>
        <div className="max-w-[1400px] mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[15px] hover:opacity-80 transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Trở về</span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl p-12 text-center relative overflow-hidden"
          >
            {/* Decorative background icons */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <MapPin className="absolute top-10 left-10 w-20 h-20 text-sky-600" />
              <Plane className="absolute top-20 right-20 w-16 h-16 text-blue-600 rotate-45" />
              <Camera className="absolute bottom-20 left-20 w-14 h-14 text-cyan-600" />
              <Coffee className="absolute bottom-10 right-32 w-12 h-12 text-orange-600" />
            </div>

            <div className="relative z-10">
              <div className="mx-auto w-20 h-20 rounded-2xl grid place-items-center bg-gradient-to-br from-sky-50 to-blue-100 shadow-lg">
                <ShoppingCart className="w-10 h-10 text-sky-500" />
              </div>
              <h2 className="mt-6 text-[26px] font-bold text-slate-900">Chưa có địa điểm trong hành trình</h2>
              <p className="mt-3 text-[16px] text-slate-600 max-w-md mx-auto">
                Hãy quay lại và thêm một vài địa điểm trước khi tối ưu hoá lộ trình nhé.
              </p>

              <div className="mt-8 flex items-center justify-center">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white px-8 py-3.5 text-[15px] font-semibold hover:from-sky-600 hover:to-blue-600 transition shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại để thêm địa điểm
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isCustomTour = itinerary.isCustomTour;
  const currentItem = items[currentPageIndex] || items[0];
  const coords = getCoordinates(currentItem);
  const hasCoords = hasValidCoordinates(currentItem);
  const gmapsUrl = hasCoords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden justify-center items-center p-8" style={{ background: 'linear-gradient(135deg, #3d7a8f 0%, #4d9aaf 50%, #5dbcc0 100%)' }}>
      {/* Decorative floating icons in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <Plane className="absolute top-20 left-20 w-24 h-24 text-white animate-pulse" style={{ animationDuration: '3s' }} />
        <MapPin className="absolute top-40 right-32 w-20 h-20 text-white animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <Camera className="absolute bottom-32 left-40 w-16 h-16 text-white animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        <Heart className="absolute bottom-20 right-20 w-14 h-14 text-white animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }} />
        <Coffee className="absolute top-1/3 left-1/4 w-12 h-12 text-white animate-pulse" style={{ animationDuration: '3.8s', animationDelay: '0.8s' }} />
        <Utensils className="absolute top-2/3 right-1/4 w-14 h-14 text-white animate-pulse" style={{ animationDuration: '4.2s', animationDelay: '1.2s' }} />
      </div>

      {/* Floating Decorative Icons - Only on edges, not overlapping card */}
      {/* TOP LEFT - Plane */}
      <div className="absolute left-6 top-12 z-5 pointer-events-none opacity-20">
        <Plane className="w-24 h-24 text-white drop-shadow-lg" />
      </div>
      
      {/* TOP RIGHT - Camera */}
      <div className="absolute right-6 top-12 z-5 pointer-events-none opacity-20">
        <Camera className="w-20 h-20 text-white drop-shadow-lg" />
      </div>

      {/* BOTTOM LEFT - Camera */}
      <div className="absolute left-6 bottom-12 z-5 pointer-events-none opacity-20 rotate-12">
        <Camera className="w-20 h-20 text-white drop-shadow-lg" />
      </div>

      {/* BOTTOM RIGHT - Plane */}
      <div className="absolute right-6 bottom-12 z-5 pointer-events-none opacity-20 -rotate-45">
        <Plane className="w-24 h-24 text-white drop-shadow-lg" />
      </div>

      {/* Header - Back Button + Custom Tour Banner on one line */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-white px-4 py-2 rounded-full shadow-lg transition hover:bg-white/20 backdrop-blur-sm border border-white/30"
        >
          <ArrowLeft className="w-4 h-4" /> Trở về
        </button>

        {/* Custom Tour Banner */}
        {isCustomTour && (
          <div className="bg-white/95 backdrop-blur rounded-xl border-2 border-cyan-400 text-cyan-900 px-4 py-2 flex items-center gap-3 shadow-lg">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-semibold">Chế độ tour tùy chỉnh</span>
          </div>
        )}
      </div>

      {/* Main Card Container - Everything in one frame */}
      <div className="w-full h-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-sky-200/30 to-transparent rounded-br-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-200/30 to-transparent rounded-tl-full pointer-events-none"></div>

        {/* Main Content Container */}
        <div className="flex w-full h-full gap-6 p-8">
        {/* LEFT SECTION - Image or Map */}
          <div className="w-3/5 relative flex flex-col justify-center items-center overflow-hidden">
            {/* Show photo if available, otherwise show interactive map */}
            {currentItem.photos?.[0] ? (
              <motion.div
                key={currentPageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative"
              >
                <img 
                  src={currentItem.photos[0]} 
                  alt={currentItem.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Overlay Info - Positioned at bottom */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/50 to-transparent p-4">
                  <h1 className="text-2xl font-bold text-white mb-1">{currentItem.name}</h1>
                  <p className="text-white/90 flex items-center gap-2 text-sm line-clamp-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {currentItem.address || 'Địa chỉ không xác định'}
                  </p>
                </div>
              </motion.div>
            ) : hasCoords ? (
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative">
                <Map4DPanel
                  center={coords}
                  zoom={15}
                  pois={[{
                    id: currentItem.poiId || currentItem._id,
                    place_id: currentItem.poiId || currentItem._id,
                    name: currentItem.name,
                    address: currentItem.address,
                    lat: coords.lat,
                    lng: coords.lng,
                  }]}
                  selectedPoiId={currentItem.poiId || currentItem._id}
                  polygon={null}
                />
                
                {/* Map Overlay Info - Positioned at bottom left */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 z-10">
                  <h1 className="text-2xl font-bold text-white mb-1">{currentItem.name}</h1>
                  <p className="text-white/90 flex items-center gap-2 text-sm line-clamp-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {currentItem.address || 'Địa chỉ không xác định'}
                  </p>
                </div>
              </div>
            ) : (
              <motion.div
                key={currentPageIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative"
              >
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Không có hình ảnh hoặc vị trí</p>
                  </div>
                </div>
                
                {/* Fallback Overlay Info */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/50 to-transparent p-4">
                  <h1 className="text-2xl font-bold text-white mb-1">{currentItem.name}</h1>
                  <p className="text-white/90 flex items-center gap-2 text-sm line-clamp-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {currentItem.address || 'Địa chỉ không xác định'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

        {/* RIGHT SECTION - Info & Details */}
        <div className="w-2/5 flex flex-col overflow-hidden">
          {/* Title Section - Compact */}
          <div className="mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-sky-600 to-blue-600 shadow-lg">
                {currentPageIndex + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-sky-700 font-semibold flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  ĐIỂM {currentPageIndex + 1}/{totalItems}
                </p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                  itinerary.isOptimized 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {itinerary.isOptimized ? '✓ Tối ưu' : 'Chưa tối ưu'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Info */}
          <div className="bg-gradient-to-br from-sky-50/80 to-blue-50/80 backdrop-blur rounded-xl p-4 mb-3 shadow-lg flex-shrink-0 border border-sky-100">
            <div className="flex items-start gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <h2 className="text-base font-bold text-slate-900 flex-1">{currentItem.name}</h2>
            </div>
            
            <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">
              {currentItem.description || currentItem.address || 'Khám phá điểm đến tuyệt vời này trong hành trình của bạn'}
            </p>

            {/* Additional details */}
            <div className="space-y-1.5">
              {currentItem.address && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span className="line-clamp-1">{currentItem.address}</span>
                </div>
              )}
              
              {currentItem.rating && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{currentItem.rating} / 5.0</span>
                </div>
              )}
            </div>

            {/* Agency Info (if tour) */}
            {currentItem.itemType === 'tour' && currentItem.agency && (
              <div className="bg-cyan-50 rounded-lg p-2 border-l-2 border-cyan-500 mt-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-cyan-900 truncate">{currentItem.agency.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline List */}
          {items.length > 1 && (
            <div className="bg-gradient-to-br from-slate-50/80 to-gray-50/80 backdrop-blur rounded-xl p-4 shadow-lg mb-3 flex-1 overflow-y-auto min-h-0 border border-slate-200 scrollbar-hide">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sky-600" />
                Lộ trình của bạn
              </h3>
              <div className="relative space-y-5">
                {/* Timeline vertical line */}
                <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-400 to-blue-500 opacity-30"></div>
                
                {items.map((item, idx) => (
                  <button
                    key={item.poiId || idx}
                    onClick={() => setCurrentPageIndex(idx)}
                    className={`w-full text-left transition-all relative ${
                      idx === currentPageIndex ? '' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-3 pl-1">
                      {/* Timeline dot */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all ${
                        idx === currentPageIndex
                          ? item.itemType === 'tour'
                            ? 'text-white shadow-lg scale-110 bg-gradient-to-br from-orange-500 to-orange-600'
                            : 'text-white shadow-lg scale-110 bg-gradient-to-br from-sky-500 to-blue-600'
                          : item.itemType === 'tour'
                            ? 'bg-white border-2 border-orange-600 text-slate-700'
                            : 'bg-white border-2 border-sky-400 text-slate-700'
                      }`}>
                        {idx + 1}
                      </div>
                      
                      <div className={`flex-1 min-w-0 pt-0.5 ${idx === currentPageIndex ? 'pb-0' : ''}`}>
                        <p className={`font-semibold text-base truncate ${
                          idx === currentPageIndex ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {item.name}
                        </p>
                        {idx === currentPageIndex && (
                          <p className="text-sm text-slate-500 truncate mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {item.address || 'Địa chỉ không xác định'}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {gmapsUrl && (
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 font-semibold text-sm border-2 border-sky-500 text-sky-700 hover:bg-sky-50 transition shadow"
              >
                <ExternalLink className="w-4 h-4" />
                Xem trên bản đồ
              </a>
            )}
            
            <button
              onClick={handleOptimizeClick}
              disabled={totalItems < 2 || isOptimizing}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white px-4 py-2.5 font-semibold text-sm hover:from-sky-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
            >
              {isOptimizing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Đang tối ưu
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Tối ưu AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* End Main Content Container */}
      </div>
      {/* End Main Card Container */}

      {/* RIGHT SIDE - Page Indicator (Vertical) - CENTERED */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-40">
        {/* Up Button */}
        <button
          onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
          disabled={currentPageIndex === 0}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md shadow-lg hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition border border-white/50"
        >
          <ChevronUp className="w-5 h-5 text-sky-700" />
        </button>

        {/* Page Dots - CENTERED */}
        <div className="flex flex-col items-center gap-2.5 bg-white/50 backdrop-blur-lg rounded-full px-3 py-4 shadow-xl border border-white/40">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPageIndex(idx)}
              className={`rounded-full transition-all ${
                idx === currentPageIndex
                  ? 'w-2.5 h-8 bg-gradient-to-b from-sky-500 to-blue-600 shadow-md'
                  : 'w-2.5 h-2.5 bg-slate-300 opacity-40 hover:opacity-70 hover:bg-sky-400'
              }`}
              title={`Đến điểm ${idx + 1}`}
            />
          ))}
        </div>

        {/* Down Button */}
        <button
          onClick={() => setCurrentPageIndex(Math.min(totalItems - 1, currentPageIndex + 1))}
          disabled={currentPageIndex === totalItems - 1}
          className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md shadow-lg hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition border border-white/50"
        >
          <ChevronDown className="w-5 h-5 text-sky-700" />
        </button>
      </div>

      {/* AlertDialog */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="max-w-md bg-white/98 backdrop-blur-xl border-2 border-sky-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sky-600" />
              Xác nhận tối ưu hành trình
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600 leading-relaxed pt-2">
              Toàn bộ thông tin về lộ trình này chỉ là tham khảo.
              AI sẽ sắp xếp lại thứ tự các điểm dừng dựa trên thuật toán tối ưu khoảng cách.
              <br /><br />
              Bạn có muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="rounded-full px-5 py-2.5 text-sm font-semibold border-2 border-slate-200 hover:bg-slate-50">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleOptimizeConfirm}
              className="rounded-full px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-500 text-white hover:from-sky-600 hover:to-blue-600 disabled:opacity-60 shadow-lg"
              disabled={isOptimizing}
            >
              {isOptimizing ? 'Đang tối ưu...' : 'Tiếp tục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;      /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;              /* Chrome, Safari and Opera */
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}