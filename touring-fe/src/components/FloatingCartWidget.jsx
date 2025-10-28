/* eslint-disable no-unused-vars */
// components/ItineraryCart.jsx
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Trash2, Sparkles, ChevronRight } from 'lucide-react';
import { useItinerary } from '../hooks/useIntinerary';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// small inline svg
// --- Add these helpers near the top of the file ---
const getAddress = (it) =>
  it?.address || it?.formatted_address || it?.vicinity || "—";

const getTypes = (it) =>
  Array.isArray(it?.types) && it.types.length
    ? it.types.slice(0, 3) // show first 3
    : [];

const getDuration = (it) =>
  typeof it?.duration === "number" && it.duration > 0 ? it.duration : 60; // default 60'

// Optional tiny icons (lightweight SVG)
const ClockMini = (props) => (
  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden {...props}>
    <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm.75 5h-1.5v5l4.25 2.55.75-1.23-3.5-2.07V7Z"/>
  </svg>
);
const PinMini = (props) => (
  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden {...props}>
    <path fill="currentColor" d="M12 2C8.69 2 6 4.69 6 8c0 4.35 5.22 10.47 5.44 10.72.3.34.82.34 1.12 0C12.78 18.47 18 12.35 18 8c0-3.31-2.69-6-6-6Zm0 8.5A2.5 2.5 0 1 1 12 5.5a2.5 2.5 0 0 1 0 5Z"/>
  </svg>
);


/* ===== Sortable item ===== */
function SortableItem({ item, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.poiId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  // ✅ Debug: Log item data
  console.log('🔍 Item data:', {
    name: item.name,
    address: item.address,
    location: item.location,
    types: item.types
  });

  // ✅ Helper: Get photo URL
  const getPhotoUrl = (photoRef) => {
    if (!photoRef) return null;
    if (photoRef.startsWith('http')) return photoRef;
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`;
  };

  const firstPhoto = item.photos?.[0];
  const photoUrl = getPhotoUrl(firstPhoto);
  const primaryType = item.types?.[0]?.replace(/_/g, ' ') || '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border overflow-hidden transition ${
        isDragging 
          ? 'border-[#02A0AA] shadow-lg scale-105' 
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex gap-3 p-3">
        {/* ✅ Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex flex-col items-center justify-center gap-0.5 w-8 flex-shrink-0 select-none cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#02A0AA] transition"
          aria-label="Kéo để sắp xếp"
        >
          <span className="h-1 w-1 rounded-full bg-current block" />
          <span className="h-1 w-1 rounded-full bg-current block" />
          <span className="h-1 w-1 rounded-full bg-current block" />
          <span className="text-[10px] font-bold mt-1 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {index + 1}
          </span>
        </button>

        {/* ✅ Thumbnail (if photo exists) */}
        {photoUrl && (
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
            <img 
              src={photoUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* ✅ Info Section */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
            {item.name}
          </h3>
          
          {/* ✅ Address - ALWAYS SHOW */}
          <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1 line-clamp-1">
            <PinMini className="text-slate-500 flex-shrink-0" />
            <span className="truncate">
              {item.address || 'Địa chỉ không xác định'}
            </span>
          </p>

          {/* ✅ Location Coordinates (for debugging) */}
          {item.location && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              📍 {item.location.lat?.toFixed(4)}, {item.location.lng?.toFixed(4)}
            </p>
          )}

          {/* ✅ Type & Rating */}
          <div className="flex items-center gap-2 mt-1">
            {primaryType && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                {primaryType}
              </span>
            )}
            {item.rating > 0 && (
              <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
                ⭐ {item.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* ✅ Remove button */}
        <button
          onClick={() => onRemove(item.poiId)}
          className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition grid place-items-center"
          aria-label="Xóa địa điểm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ItineraryCart() {
  const navigate = useNavigate();
  const {
    currentItinerary,
    setCurrentItinerary, // fallback
    isOpen,
    getCartCount,
    toggleCart,
    closeCart,
    removePOI,
    reorderPOIs,        // prefer dùng cái này
  } = useItinerary();

  const cartCount = getCartCount();
  const items = currentItinerary?.items || [];
  const itemIds = useMemo(() => items.map(i => i.poiId), [items]);

  // sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    
    console.log('🎯 Drag event:', { 
      active: active?.id, 
      over: over?.id 
    });

    if (!over || active.id === over.id) {
      console.log('⏭️ Skipping: dropped on same position or outside');
      return;
    }

    const oldIndex = itemIds.indexOf(active.id);
    const newIndex = itemIds.indexOf(over.id);
    
    console.log('📍 Indexes:', { oldIndex, newIndex });

    if (oldIndex === -1 || newIndex === -1) {
      console.warn('❌ Invalid indexes');
      return;
    }

    const nextItems = arrayMove(items, oldIndex, newIndex);
    const nextIds = nextItems.map(i => i.poiId);

    console.log('🔄 Reordering:', { 
      from: oldIndex, 
      to: newIndex,
      order: nextIds 
    });

    if (typeof reorderPOIs === 'function') {
      reorderPOIs(nextIds);
    } else {
      console.error('❌ reorderPOIs is not a function!');
      // Fallback
      setCurrentItinerary?.({ ...currentItinerary, items: nextItems });
    }
  }

  const handleViewItinerary = () => {
    closeCart();
    navigate('/itinerary', { state: { itinerary: currentItinerary } });
  };

  const handleRemovePOI = async (poiId) => {
    try { await removePOI(poiId); } catch (e) { /* show toast if cần */ }
  };

  return (
    <>
      {/* Floating button — bottom-right */}
      <motion.button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-[10000] flex items-center gap-2 rounded-full bg-[#02A0AA] text-white px-4 py-3 shadow-2xl hover:bg-[#028a94] transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Mở giỏ hành trình"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-semibold text-sm">Giỏ Hành trình</span>
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold grid place-items-center">
            {cartCount}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              onClick={closeCart}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10001]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[10002] overflow-hidden flex flex-col"
              role="dialog"
              aria-label="Giỏ hành trình"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#02A0AA] to-[#028a94] text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Hành trình của bạn</h2>
                    <p className="text-xs text-white/80">
                      {currentItinerary?.zoneName || 'Chưa có khu vực'} • {cartCount} địa điểm
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition grid place-items-center"
                    aria-label="Đóng giỏ hành trình"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* List + DnD */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                      {items.map((item, index) => (
                        <SortableItem
                          key={item.poiId}
                          item={item}
                          index={index}
                          onRemove={handleRemovePOI}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    Chưa có địa điểm nào. Hãy thêm từ danh sách để bắt đầu.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-4 space-y-3 bg-white">
                <button
                  onClick={handleViewItinerary}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#02A0AA] text-white px-4 py-3 font-semibold hover:bg-[#028a94] transition"
                >
                  <Sparkles className="w-5 h-5" />
                  Tạo hành trình bằng AI
                  <ChevronRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-center text-slate-500">
                  Kéo-thả để sắp xếp thứ tự. AI (tùy chọn) sẽ tối ưu thời lượng & quãng đường dựa trên danh sách này.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
