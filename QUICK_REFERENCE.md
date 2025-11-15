# 🚀 Quick Reference - Guide Review System

## 📦 System Overview

```
Backend ✅ COMPLETE | Frontend Components ✅ COMPLETE | Integration ⏳ PENDING
```

---

## 🔌 API Endpoints (Quick Copy)

### Public (No Auth Required)
```javascript
// Get guide profile
GET /api/guide/profile/:guideId

// Get guide reviews  
GET /api/reviews/guide/:guideId
  ?page=1&limit=10&sort=newest&rating=5
```

### Protected (Auth Required)
```javascript
// Get reviewable bookings
GET /api/reviews/reviewable-bookings

// Create guide review
POST /api/reviews/guide
{
  "customTourRequestId": "67...",
  "rating": 5,
  "title": "Great guide!",
  "content": "...",
  "serviceRating": 5,
  "guideRating": 5,
  "valueForMoneyRating": 4
}
```

---

## 🎨 Component Quick Use

### GuideReviewForm
```jsx
import GuideReviewForm from './reviews/GuideReviewForm';

<GuideReviewForm
  reviewItem={{
    bookingId: "67...",
    customTourRequestId: "67...",
    guideId: "67...",
    guideName: "Nguyễn Văn A"
  }}
  onSuccess={() => console.log('Review submitted!')}
  onCancel={() => console.log('Cancelled')}
/>
```

### GuideReviewSection
```jsx
import GuideReviewSection from './reviews/GuideReviewSection';

<GuideReviewSection guideId="67..." />
```

### GuideProfileModal
```jsx
import GuideProfileModal from './reviews/GuideProfileModal';

const [showModal, setShowModal] = useState(null);

<GuideProfileModal
  guideId="67..."
  guideName="Nguyễn Văn A"
  onClose={() => setShowModal(null)}
/>
```

---

## ⚡ Integration Code Snippets

### ProfileReviews.jsx - Add Custom Tour Reviews
```jsx
// Line ~1: Import
import GuideReviewForm from './reviews/GuideReviewForm';

// Line ~800: In pending tab rendering
{pendingBookings.map((item, idx) => {
  if (item.type === 'custom_tour') {
    return (
      <GuideReviewForm
        key={`custom-${item.bookingId}-${idx}`}
        reviewItem={{
          bookingId: item.bookingId,
          customTourRequestId: item.customTourRequestId,
          guideId: item.guideId,
          guideName: item.guideName
        }}
        onSuccess={refreshReviews}
        onCancel={() => {}}
      />
    );
  }
  
  // Regular tour review (existing code)
  return <ReviewModal ... />;
})}
```

### RequestGuideModal.jsx - Add Guide Profile View
```jsx
// Line ~7: Import
import GuideProfileModal from '@/components/reviews/GuideProfileModal';

// Line ~15: Add state
const [showGuideProfile, setShowGuideProfile] = useState(null);

// Line ~335: Make guide name clickable
<h4 
  className="font-semibold text-gray-900 text-lg mb-1 cursor-pointer hover:text-blue-600 transition-colors"
  onClick={(e) => {
    e.stopPropagation();
    setShowGuideProfile({ guideId: guide._id, guideName: guide.name });
  }}
>
  {guide.name || 'Hướng dẫn viên'}
</h4>

// Line ~540: Add modal before closing div
{showGuideProfile && (
  <GuideProfileModal
    guideId={showGuideProfile.guideId}
    guideName={showGuideProfile.guideName}
    onClose={() => setShowGuideProfile(null)}
  />
)}
```

---

## 🧪 Testing Commands

### Backend
```bash
# Start backend
cd touring-be && npm start

# Run verification script
node verify-backend.js <GUIDE_ID>

# With auth token
AUTH_TOKEN=your_token node verify-backend.js <GUIDE_ID>

# Test endpoints manually
curl http://localhost:4000/api/reviews/guide/67...
curl http://localhost:4000/api/guide/profile/67...
```

### Frontend
```bash
# Start frontend
cd touring-fe && npm run dev

# Access in browser
http://localhost:5173
```

---

## 📂 File Locations (Quick Navigation)

### Backend Files
```
touring-be/
├── models/Review.js                    # ✅ Updated
├── controller/
│   ├── reviewController.js             # ✅ Updated
│   └── guide/guide.controller.js       # ✅ Updated
├── routes/
│   ├── reviewRoutes.js                 # ✅ Updated
│   └── guide/guide.routes.js           # ✅ Updated
└── verify-backend.js                   # ✅ New
```

### Frontend Files
```
touring-fe/src/
├── components/
│   ├── ProfileReviews.jsx              # ⏳ Needs update
│   ├── RequestGuideModal.jsx           # ⏳ Needs update
│   └── reviews/
│       ├── GuideReviewForm.jsx         # ✅ New
│       ├── GuideReviewSection.jsx      # ✅ New
│       └── GuideProfileModal.jsx       # ✅ New
```

### Documentation
```
Root/
├── GUIDE_REVIEW_SYSTEM_COMPLETE.md    # Full documentation
├── INTEGRATION_GUIDE.md                # Step-by-step integration
├── SUMMARY.md                          # Overview summary
└── QUICK_REFERENCE.md                  # This file
```

---

## 🔍 Debug Helpers

### Check Backend Route Registration
```bash
# Should see review and guide routes
curl http://localhost:4000/api/reviews/guide/000000000000000000000000
curl http://localhost:4000/api/guide/profile/000000000000000000000000
```

### Check Database
```javascript
// In MongoDB shell
db.reviews.find({ reviewType: 'custom_tour' }).pretty()
db.reviews.getIndexes()
db.guides.findOne({}, { rating: 1, totalReviews: 1 })
```

### Check Frontend Components
```javascript
// In browser console
// Check if components imported
import('./components/reviews/GuideReviewForm.jsx')
import('./components/reviews/GuideProfileModal.jsx')
```

---

## ⚠️ Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Reviews not showing | Check `reviewType: 'custom_tour'` and `status: 'approved'` |
| Can't create review | Verify booking exists and is completed, check auth token |
| Modal not opening | Check state updates, verify `e.stopPropagation()` |
| Rating not updating | Check `updateGuideRating()` is called after review creation |
| Import errors | Check file paths, component exports |

---

## 📋 Integration Checklist

### Step 1: ProfileReviews
- [ ] Import GuideReviewForm
- [ ] Add custom tour detection (`item.type === 'custom_tour'`)
- [ ] Render GuideReviewForm for custom tours
- [ ] Test submission and refresh

### Step 2: RequestGuideModal
- [ ] Import GuideProfileModal
- [ ] Add state for modal
- [ ] Make guide name clickable
- [ ] Add modal before closing div
- [ ] Test modal opens/closes

### Step 3: Testing
- [ ] Complete custom tour
- [ ] See in "Chờ đánh giá"
- [ ] Submit review
- [ ] See in "Đã đánh giá"
- [ ] Click guide name in selection
- [ ] See reviews in modal

---

## 🎯 Status Dashboard

| Component | Status | File |
|-----------|--------|------|
| Review Model | ✅ Ready | `models/Review.js` |
| Create Guide Review | ✅ Ready | `controller/reviewController.js` |
| Get Guide Reviews | ✅ Ready | `controller/reviewController.js` |
| Get Guide Profile | ✅ Ready | `controller/guide/guide.controller.js` |
| Review Routes | ✅ Ready | `routes/reviewRoutes.js` |
| Guide Routes | ✅ Ready | `routes/guide/guide.routes.js` |
| GuideReviewForm | ✅ Ready | `components/reviews/GuideReviewForm.jsx` |
| GuideReviewSection | ✅ Ready | `components/reviews/GuideReviewSection.jsx` |
| GuideProfileModal | ✅ Ready | `components/reviews/GuideProfileModal.jsx` |
| ProfileReviews Integration | ⏳ TODO | `components/ProfileReviews.jsx` |
| RequestGuideModal Integration | ⏳ TODO | `components/RequestGuideModal.jsx` |

---

## 🚀 Next Steps

1. **Integrate ProfileReviews** (15 min)
   - Add GuideReviewForm for custom tours
   - Test review submission

2. **Integrate RequestGuideModal** (15 min)
   - Add GuideProfileModal
   - Make guide names clickable

3. **Test End-to-End** (30 min)
   - Complete tour → Review → Display
   - Check all edge cases

4. **Polish & Deploy** (60 min)
   - UI refinements
   - Mobile testing
   - Production deployment

---

## 📞 Need Help?

- **Full Docs:** `GUIDE_REVIEW_SYSTEM_COMPLETE.md`
- **Integration Guide:** `INTEGRATION_GUIDE.md`
- **Summary:** `SUMMARY.md`
- **Backend Test:** `touring-be/verify-backend.js`

---

## ✨ Key Features

- ⭐ 5-star rating system
- 📝 Detailed reviews (service, guide, value)
- 📷 Image uploads (max 5)
- 📊 Rating statistics with distribution
- 🔍 Filter & sort reviews
- 📱 Mobile responsive
- 🔒 Duplicate review prevention
- 🔔 Notification integration
- ✅ Verified reviews support

---

**System Status:** 90% Complete - Ready for Integration  
**Time to Complete:** ~1 hour  
**Difficulty:** Easy - Just copy & paste integration code

---

**Quick Links:**
- [Full System Docs](./GUIDE_REVIEW_SYSTEM_COMPLETE.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Summary](./SUMMARY.md)

**Version:** 1.0 | **Updated:** 2024-01-20
