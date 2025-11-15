# 🔌 Guide Review System - Integration Guide

## Overview
Hướng dẫn tích hợp hệ thống review guide vào 2 điểm chính:
1. **ProfileReviews** - Hiển thị form review cho custom tours đã hoàn thành
2. **RequestGuideModal** - Cho phép xem reviews khi chọn guide

---

## 1. ProfileReviews Integration

### 📍 File Location
`touring-fe/src/components/ProfileReviews.jsx`

### 🎯 Goal
Khi user vào Profile → Đánh giá → Chờ đánh giá, hiển thị form để review guide cho custom tours đã hoàn thành.

### ✅ Current State
- Component đã có tab "Chờ đánh giá"
- Đã fetch data từ `/api/reviews/reviewable-bookings`
- Backend trả về `reviewableItems` với `type: 'custom_tour'`

### 📝 Implementation Steps

#### Step 1: Import GuideReviewForm
```jsx
// Add at top of ProfileReviews.jsx
import GuideReviewForm from './reviews/GuideReviewForm';
```

#### Step 2: Update Pending Tab Rendering
Tìm đoạn code render pending bookings (around line 800-900), thay thế bằng:

```jsx
{activeTab === 'pending' ? (
  pendingBookings.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p>Không có tour nào cần đánh giá</p>
    </div>
  ) : (
    <div className="space-y-4">
      {pendingBookings.map((item, idx) => {
        // Check if this is a custom tour that needs guide review
        const isCustomTour = item.type === 'custom_tour';
        
        if (isCustomTour) {
          // Render guide review form for custom tours
          return (
            <div key={`custom-${item.bookingId}-${idx}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Đánh giá hướng dẫn viên
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    Custom Tour
                  </span>
                </div>
              </div>
              
              {/* Guide Review Form */}
              <div className="p-4">
                <GuideReviewForm
                  reviewItem={{
                    bookingId: item.bookingId,
                    customTourRequestId: item.customTourRequestId,
                    guideId: item.guideId,
                    guideName: item.guideName || 'Hướng dẫn viên'
                  }}
                  onSuccess={async () => {
                    // Refresh data after successful review
                    toast.loading('Đang cập nhật...', { id: 'refresh-reviews' });
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const [reviewsData, reviewableData] = await Promise.all([
                      withAuth('/api/reviews/my?limit=50'),
                      withAuth('/api/reviews/reviewable-bookings')
                    ]);
                    
                    setUserReviews([...reviewsData.reviews || []]);
                    
                    const mapped = (reviewableData.bookings || []).map((booking) => {
                      const firstItem = (booking.items && booking.items[0]) || {};
                      return {
                        bookingId: booking._id,
                        tourId: firstItem.tourId?._id || firstItem.tourId,
                        tourInfo: firstItem.tourId || {},
                        bookingDate: firstItem.date || booking.createdAt,
                      };
                    });
                    
                    setPendingBookings([...mapped]);
                    
                    toast.success('Đã thêm đánh giá thành công!', { id: 'refresh-reviews' });
                    setActiveTab('reviewed');
                  }}
                  onCancel={() => {
                    // Optional: add cancel logic
                  }}
                />
              </div>
            </div>
          );
        } else {
          // Render regular tour review form (existing code)
          const tourId = item.tourId;
          const tourInfo = item.tourInfo || {};
          const tourImage = tourInfo.imageItems?.[0]?.imageUrl;
          
          return (
            <div key={`tour-${item.bookingId}-${idx}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Existing regular tour review rendering */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Đặt ngày: {formatDateVN(item.bookingDate)}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                    Chưa đánh giá
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex gap-3">
                  {tourImage && (
                    <div className="w-20 h-20 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                      <img src={tourImage} alt={tourInfo.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {tourInfo.title || 'Tour'}
                    </h3>
                    
                    <button
                      onClick={() => {
                        setReviewModal({
                          isOpen: true,
                          tourId: tourId,
                          tourTitle: tourInfo.title || 'Tour',
                          bookingId: item.bookingId
                        });
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      <Star className="w-4 h-4" />
                      Đánh giá tour này
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      })}
    </div>
  )
) : (
  /* Reviewed tab - existing code */
)}
```

### ⚠️ Important Notes

1. **Data Structure Check**: Backend trả về `reviewableItems` array với custom tours có:
   - `type: 'custom_tour'`
   - `bookingId`
   - `customTourRequestId`
   - `guideId`
   - `guideName`

2. **State Updates**: Sau khi submit review thành công, cần:
   - Refresh cả 2 lists (reviews và pending)
   - Switch sang tab "Đã đánh giá"
   - Show success toast

3. **Error Handling**: GuideReviewForm đã có error handling, chỉ cần handle success case

---

## 2. RequestGuideModal Integration

### 📍 File Location
`touring-fe/src/components/RequestGuideModal.jsx`

### 🎯 Goal
Khi user click vào tên guide trong danh sách, hiển thị modal với thông tin và reviews của guide đó.

### ✅ Current State
- Modal hiển thị danh sách guides
- Guide name hiển thị ở line 335: `{guide.name || 'Hướng dẫn viên'}`
- Guide card có rating và info cơ bản

### 📝 Implementation Steps

#### Step 1: Import Component
```jsx
// Add at top of RequestGuideModal.jsx (around line 7)
import GuideProfileModal from '@/components/reviews/GuideProfileModal';
```

#### Step 2: Add State
```jsx
// Add after existing state declarations (around line 15-25)
const [showGuideProfile, setShowGuideProfile] = useState(null);
```

#### Step 3: Make Guide Name Clickable
Tìm guide name element (around line 333-337), update thành:

```jsx
<h4 
  className="font-semibold text-gray-900 text-lg mb-1 cursor-pointer hover:text-blue-600 transition-colors underline-offset-2 hover:underline"
  onClick={(e) => {
    // Prevent triggering parent card click
    e.stopPropagation();
    
    // Open guide profile modal
    setShowGuideProfile({
      guideId: guide._id,
      guideName: guide.name || 'Hướng dẫn viên'
    });
  }}
  title="Xem đánh giá và thông tin chi tiết"
>
  {guide.name || 'Hướng dẫn viên'}
  {/* Optional: Add icon hint */}
  <span className="text-blue-600 ml-1 text-xs">ⓘ</span>
</h4>
```

#### Step 4: Add Profile Modal
Tìm cuối component (trước closing `</div>` của modal chính), thêm:

```jsx
      {/* Guide Profile Modal - Show guide info and reviews */}
      {showGuideProfile && (
        <GuideProfileModal
          guideId={showGuideProfile.guideId}
          guideName={showGuideProfile.guideName}
          onClose={() => setShowGuideProfile(null)}
        />
      )}
    </div>
  );
}
```

### 🎨 Optional: Add Visual Indicator

Để user biết guide name có thể click, có thể thêm icon hoặc styling:

```jsx
<div className="flex items-center gap-2">
  <h4 
    className="font-semibold text-gray-900 text-lg cursor-pointer hover:text-blue-600 transition-colors group"
    onClick={(e) => {
      e.stopPropagation();
      setShowGuideProfile({ guideId: guide._id, guideName: guide.name });
    }}
  >
    {guide.name || 'Hướng dẫn viên'}
    <MessageSquare className="inline-block w-4 h-4 ml-1 text-gray-400 group-hover:text-blue-600 transition-colors" />
  </h4>
</div>
```

### ⚠️ Important Notes

1. **Event Propagation**: Phải dùng `e.stopPropagation()` để không trigger parent card click (guide selection)

2. **Modal Stacking**: GuideProfileModal sẽ hiển thị trên RequestGuideModal. Đảm bảo z-index đúng:
   - RequestGuideModal: `z-50`
   - GuideProfileModal: `z-[60]` (already set in component)

3. **Guide Selection**: Sau khi đóng GuideProfileModal, user vẫn có thể select guide bình thường

---

## 🧪 Testing Guide

### Test ProfileReviews Integration

1. **Setup**: Complete a custom tour with guide
2. **Navigate**: Profile → Đánh giá → Chờ đánh giá
3. **Verify**: Custom tour shows with GuideReviewForm
4. **Submit**: Fill form and submit review
5. **Check**: 
   - Review appears in "Đã đánh giá" tab
   - Removed from "Chờ đánh giá" tab
   - Toast messages display correctly

### Test RequestGuideModal Integration

1. **Setup**: Create itinerary
2. **Navigate**: Click "Yêu cầu hướng dẫn viên"
3. **Click Guide Name**: Modal opens with guide profile
4. **Check Tabs**: 
   - "Thông tin" shows guide bio
   - "Đánh giá" shows reviews and stats
5. **Close Modal**: Profile modal closes, guide list still visible
6. **Select Guide**: Can still select guide normally

---

## 🔍 Debug Tips

### Check Data Flow

#### ProfileReviews
```javascript
// In useEffect after fetch
console.log('📋 Reviewable items:', reviewableData.reviewableItems);
console.log('🎯 Custom tours:', reviewableData.reviewableItems?.filter(i => i.type === 'custom_tour'));
```

#### RequestGuideModal
```javascript
// In guide name click handler
console.log('👤 Opening profile for guide:', guide._id, guide.name);

// Check if modal state updated
console.log('🔍 showGuideProfile:', showGuideProfile);
```

### Common Issues

**Issue**: GuideReviewForm not showing
- Check `item.type === 'custom_tour'` condition
- Verify backend returns correct `reviewableItems`
- Check import path is correct

**Issue**: Guide profile modal not opening
- Check `showGuideProfile` state updates
- Verify guide has `_id` field
- Check event propagation is stopped

**Issue**: Modal doesn't close
- Check `onClose` prop is passed
- Verify state reset: `setShowGuideProfile(null)`

---

## 📦 File Changes Summary

### Files to Modify

1. **ProfileReviews.jsx**
   - Import: `GuideReviewForm`
   - Update: Pending tab rendering logic
   - Add: Custom tour detection and form rendering

2. **RequestGuideModal.jsx**
   - Import: `GuideProfileModal`
   - Add: `showGuideProfile` state
   - Update: Guide name with click handler
   - Add: Profile modal at end

### New Dependencies
None - All components already exist

---

## ✅ Completion Checklist

- [ ] Import GuideReviewForm in ProfileReviews
- [ ] Add custom tour detection logic
- [ ] Test custom tour review submission
- [ ] Import GuideProfileModal in RequestGuideModal
- [ ] Add clickable guide name
- [ ] Test guide profile modal opening/closing
- [ ] Verify guide selection still works
- [ ] Test on mobile responsive

---

## 🚀 Quick Commands

### Start Development
```bash
# Terminal 1 - Backend
cd touring-be
npm start

# Terminal 2 - Frontend
cd touring-fe
npm run dev
```

### Test API
```bash
# Get reviewable bookings (check for custom tours)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/reviews/reviewable-bookings | jq '.reviewableItems[] | select(.type=="custom_tour")'

# Get guide profile
curl http://localhost:4000/api/guide/profile/GUIDE_ID | jq '.guide'

# Get guide reviews
curl http://localhost:4000/api/reviews/guide/GUIDE_ID | jq '.stats'
```

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check network tab for API calls
3. Verify backend is running and connected to MongoDB
4. Check component imports are correct
5. Review error messages in toast notifications

**Document Version:** 1.0  
**Last Updated:** 2024-01-20
