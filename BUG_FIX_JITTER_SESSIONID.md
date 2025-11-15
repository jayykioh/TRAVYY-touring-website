# 🐛 BUG FIX #2 - Jitter & SessionId Architecture

## 🔴 Problem 1: Infinite Loop Jitter

### Symptom
```
POST /api/track/tour-view 200 49.638 ms - 323  ← Lần 1
POST /api/track/tour-view 200 67.879 ms - 323  ← Lần 2 (1s sau)
POST /api/track/tour-view 200 149.478 ms - 323 ← Lần 3 (1s sau)
... (20+ lần trong 5 giây!)
```

User mở 1 tour detail → gửi 20+ tracking requests → jittery UX

### Root Cause
**React useEffect dependency hell**:
```jsx
useEffect(() => {
  trackTourView(tour._id, 0);  // ❌ Call tracking
}, [routeId, user.token, trackTourView, tour, viewStartTime]);
//                                       ^^^^  ^^^^^^^^^^^^
//                                       Re-triggers when tour loads!
```

**Flow**:
1. User opens tour → `useEffect` runs → `trackTourView()` called
2. Tour data loads → `tour` state changes → `useEffect` re-runs
3. Tracking called again → backend saves
4. (Repeat 20x as React reconciles)

### Fix
**Use `useRef` to track if we've already sent initial view**:
```jsx
const hasTrackedInitialView = useRef(false);

useEffect(() => {
  // Reset flag when navigating to new tour
  hasTrackedInitialView.current = false;
  
  async function load() {
    // ... fetch tour data
    
    // ✅ Track ONLY ONCE per page load
    if (!hasTrackedInitialView.current && user?.token) {
      trackTourView(tourData._id, 0);
      hasTrackedInitialView.current = true;
    }
  }
  
  load();
}, [routeId]); // ✅ Only re-run when routeId changes (different tour)
```

**Result**: 1 tour view = 1 tracking request ✅

---

## 🔴 Problem 2: SessionId Architecture Confusion

### User Question
> "Tại sao mình có JWT rồi mà còn phải lưu sessionId?"

### Answer: They serve DIFFERENT purposes

| Aspect | JWT (Authentication) | sessionId (Analytics) |
|--------|---------------------|----------------------|
| **Purpose** | WHO is the user? | ONE browsing session |
| **Lifetime** | 30 minutes (token refresh) | 30 minutes (rolling per request) |
| **Persistence** | Local storage | Cookie (httpOnly) |
| **Example** | `user_68ff2dda114f8ca0df42815f` | `sess_a3f9...1763000123` |

### Real-World Example

**Scenario**: User browses tours
```
10:00 AM - User logs in
          → JWT = "user123"
          → sessionId = "sess_a3f9..."

10:05 AM - View tour A
          → Save: { userId: "user123", tourId: "A", sessionId: "sess_a3f9..." }

10:08 AM - View tour B
          → Save: { userId: "user123", tourId: "B", sessionId: "sess_a3f9..." }
          
10:12 AM - Book tour B (×3 weight!)
          → Save: { userId: "user123", tourId: "B", action: "booking", sessionId: "sess_a3f9..." }

11:00 PM - User closes browser, goes to bed

---

Next day 9:00 AM - User returns
          → JWT = "user123" (same user)
          → sessionId = "sess_x7k2..." (NEW session!)

9:05 AM - View tour C
          → Save: { userId: "user123", tourId: "C", sessionId: "sess_x7k2..." }
```

### Why SessionId Matters

**Metrics Enabled**:

1. **Session Duration**
   ```sql
   SELECT sessionId, MAX(timestamp) - MIN(timestamp) as duration
   FROM interactions
   GROUP BY sessionId
   -- Result: sess_a3f9 = 12 minutes
   ```

2. **Bounce Rate** (1 interaction per session)
   ```sql
   SELECT COUNT(*) FROM (
     SELECT sessionId, COUNT(*) as interactions
     FROM interactions
     GROUP BY sessionId
     HAVING interactions = 1
   )
   -- Result: 30% bounce rate
   ```

3. **Conversion Funnel**
   ```sql
   -- Tours viewed → bookings in SAME session
   SELECT 
     COUNT(DISTINCT CASE WHEN action='view' THEN tourId END) as views,
     COUNT(DISTINCT CASE WHEN action='booking' THEN tourId END) as bookings
   FROM interactions
   WHERE sessionId = 'sess_a3f9...'
   -- Result: 5 views → 1 booking = 20% conversion
   ```

4. **Tours per Session**
   ```sql
   SELECT AVG(tours_per_session) FROM (
     SELECT sessionId, COUNT(DISTINCT tourId) as tours_per_session
     FROM interactions
     GROUP BY sessionId
   )
   -- Result: 2.3 tours/session average
   ```

### Implementation

**Backend Middleware** (`middlewares/sessionId.js`):
```js
function sessionIdMiddleware(req, res, next) {
  let sessionId = req.cookies?.tracking_session;

  if (!sessionId) {
    sessionId = `sess_${crypto.randomBytes(16).toString('hex')}_${Date.now()}`;
    
    // Set cookie (30 min, rolling)
    res.cookie('tracking_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000
    });
  } else {
    // Refresh expiry on each request (rolling session)
    res.cookie('tracking_session', sessionId, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000
    });
  }

  req.sessionId = sessionId;
  next();
}
```

**Usage in Routes**:
```js
router.use(sessionIdMiddleware); // Apply to ALL tracking routes

router.post('/tour-view', verifyToken, async (req, res) => {
  const interaction = new TourInteraction({
    userId: req.userId,      // ← WHO (from JWT)
    tourId: req.body.tourId,
    sessionId: req.sessionId // ← WHEN/SESSION (from cookie)
  });
  await interaction.save();
});
```

---

## ✅ Status: FIXED

### Files Changed
1. **Frontend**: `touring-fe/src/pages/TourDetailPage.jsx`
   - Added `useRef(false)` to prevent duplicate tracking
   - Fixed useEffect dependency array

2. **Backend**: `touring-be/middlewares/sessionId.js` (NEW)
   - Cookie-based persistent sessionId (30 min rolling)

3. **Backend**: `touring-be/routes/track.routes.js`
   - Applied sessionId middleware
   - Replaced all `req.sessionID || random()` with `req.sessionId`

### Expected Behavior
- ✅ 1 tour view = 1 tracking request
- ✅ Same session across 30 minutes of browsing
- ✅ New session after browser close/timeout
- ✅ Session analytics queries work correctly

---

**Date Fixed**: January 13, 2025  
**Related**: BUG_FIX_TOUR_INTERACTION.md (userId issue)
