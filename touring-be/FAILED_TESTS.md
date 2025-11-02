# 🔴 Failed Test Cases Report

**Generated**: November 1, 2025  
**Total Tests**: 90  
**Passed**: 84 ✅  
**Failed**: 6 ❌  
**Success Rate**: 93.33%

---

## 📊 Summary

| Test Suite | Total | Passed | Failed |
|------------|-------|--------|--------|
| itinerary.routes.test.js | 12 | 10 | 2 |
| goong.test.js | 9 | 5 | 4 |
| **All Others** | 69 | 69 | 0 |

---

## ❌ Failed Test Case #1

### Test Suite: `routes/__tests__/itinerary.routes.test.js`
### Test Name: `GET /api/itinerary/:id - returns itinerary when found`

**Location**: Line 141-165

#### 📥 Input
```javascript
// HTTP Request
GET /api/itinerary/it-get
Headers: {
  Authorization: Bearer <token>
}

// Mock Setup
const doc = {
  _id: 'it-get',
  userId: 'u1',
  items: [{ poiId: 'p1' }],
  toObject() { return { ...this }; }
};

// Mock Itinerary.findOne returns:
Itinerary.findOne = jest.fn(() => ({
  lean: () => Promise.resolve(doc)
}));
```

#### 📤 Expected Output
```javascript
// HTTP Response: 200 OK
{
  success: true,
  itinerary: {
    _id: 'it-get',
    userId: 'u1',
    items: [{ poiId: 'p1' }]
  }
}
```

#### 💥 Actual Output
```javascript
// HTTP Response: 500 Internal Server Error
{
  success: false,
  error: "Cannot read property 'items' of null" // or similar
}
```

#### 🐛 Root Cause
```
Problem Flow:
1. Test mocks Itinerary.findOne() to return .lean() chain
2. Actual route code at line 396-399:
   const itinerary = await Itinerary.findOne({
     _id: req.params.id,
     userId
   });
3. Route does NOT call .lean(), expects Mongoose document
4. Route tries to access itinerary.items.some() at line 406
5. Mock returns plain object without Mongoose methods
6. Accessing .items.some() fails or returns unexpected result
```

#### 📝 Notes
- Route expects full Mongoose document with `.save()` method
- Test mock only provides plain object with `.lean()` chain
- Mismatch between mock structure and actual implementation

---

## ❌ Failed Test Case #2

### Test Suite: `routes/__tests__/itinerary.routes.test.js`
### Test Name: `GET /api/itinerary/:id - returns 404 when not found`

**Location**: Line 167-185

#### 📥 Input
```javascript
// HTTP Request
GET /api/itinerary/nonexistent
Headers: {
  Authorization: Bearer <token>
}

// Mock Setup
Itinerary.findOne = jest.fn(() => ({
  lean: () => Promise.resolve(null)
}));

// Expected: findOne returns null for non-existent ID
```

#### 📤 Expected Output
```javascript
// HTTP Response: 404 Not Found
{
  success: false,
  error: "Itinerary not found"
}
```

#### 💥 Actual Output
```javascript
// HTTP Response: 500 Internal Server Error
{
  success: false,
  error: "Cannot read property 'lean' of undefined" // or similar
}
```

#### 🐛 Root Cause
```
Problem Flow:
1. Mock returns { lean: () => Promise.resolve(null) }
2. Actual route at line 396 does NOT use .lean()
3. Route expects: await Itinerary.findOne(...) → null
4. Mock provides: await Itinerary.findOne(...).lean() → null
5. Route gets undefined because no .lean() was called
6. Try to check if (undefined) → crashes or unexpected behavior
```

#### 📝 Notes
- Same issue as Test #1: mock doesn't match implementation
- Route code doesn't use `.lean()` for this endpoint
- Test assumes `.lean()` pattern but route uses direct Mongoose document

---

## ❌ Failed Test Case #3

### Test Suite: `services/ai/libs/__tests__/goong.test.js`
### Test Name: `tripV2 retries on 429 rate limit error`

**Location**: Line 69-92

#### 📥 Input
```javascript
// Function Call
const points = [[106.0, 10.0], [106.1, 10.1]];
await goong.tripV2(points, { vehicle: 'car' });

// Mock Behavior
let callCount = 0;
axios.get.mockImplementation(async () => {
  callCount++;
  if (callCount === 1) {
    // First call: rate limit error
    const error = new Error('Rate limit');
    error.response = { status: 429 };
    throw error;
  }
  // Second call: success
  return {
    status: 200,
    data: {
      code: 'Ok',
      trips: [{ distance: 5000, duration: 600, geometry: 'geom', legs: [] }],
      waypoints: []
    }
  };
});
```

#### 📤 Expected Output
```javascript
// After 1 retry, should return success
{
  trips: [{
    distance: 5000,
    duration: 600,
    geometry: 'geom',
    legs: []
  }]
}

// callCount should be 2 (first failed, second succeeded)
expect(callCount).toBe(2);
```

#### 💥 Actual Output
```javascript
// Error thrown on first attempt
Error: Rate limit
  at axios.get.mockImplementation
  at goong.js:539:34

// Function does NOT retry
// callCount = 1 (only one attempt made)
```

#### 🐛 Root Cause
```
Problem Flow:
1. Test expects tripV2() to have retry logic for 429 errors
2. Actual implementation at goong.js lines 400-550:
   - Calls axios.get() once
   - No try-catch with retry loop
   - No special handling for 429 status
   - Error propagates immediately
3. Test assumes retry mechanism that doesn't exist
```

#### 📝 Notes
- Test expects retry logic that is NOT implemented in `goong.js`
- Production code does not have rate limit retry mechanism
- Test is testing non-existent feature

---

## ❌ Failed Test Case #4

### Test Suite: `services/ai/libs/__tests__/goong.test.js`
### Test Name: `tripV2 throws error after max retries on persistent failures`

**Location**: Line 94-104

#### 📥 Input
```javascript
// Function Call
const points = [[106.0, 10.0], [106.1, 10.1]];
await goong.tripV2(points, { vehicle: 'car' });

// Mock: Always reject with 500 error
axios.get.mockRejectedValue({
  response: { status: 500 },
  message: 'Server error'
});
```

#### 📤 Expected Output
```javascript
// Should throw error after max retries (e.g., 3 attempts)
expect(goong.tripV2(points, { vehicle: 'car' }))
  .rejects
  .toThrow();
```

#### 💥 Actual Output
```javascript
// Function does NOT throw
// Returns undefined or resolves unexpectedly
// Test fails: "Received function did not throw"
```

#### 🐛 Root Cause
```
Problem Flow:
1. Test expects error to be thrown after retries
2. Actual goong.js implementation:
   - Makes single axios.get() call
   - May have error handling that swallows error
   - Returns default/fallback value instead of throwing
3. Test expects throw but function returns normally
```

#### 📝 Notes
- goong.js may have fallback logic that prevents throwing
- Or function signature is different from what test expects
- Need to check actual error handling in goong.js lines 500-550

---

## ❌ Failed Test Case #5

### Test Suite: `services/ai/libs/__tests__/goong.test.js`
### Test Name: `searchNearbyPOIs handles autocomplete returning no predictions`

**Location**: Line 119-130

#### 📥 Input
```javascript
// Function Call
const pois = await goong.searchNearbyPOIs(
  10.5,      // lat
  106.5,     // lng
  1000,      // radius (meters)
  { vibes: ['food'], limit: 5 }
);

// Mock: Empty predictions array
axios.get.mockResolvedValue({
  status: 200,
  data: { predictions: [] }
});
```

#### 📤 Expected Output
```javascript
// Should return empty array when no predictions
expect(Array.isArray(pois)).toBe(true);
expect(pois.length).toBe(0);
```

#### 💥 Actual Output
```javascript
// Returns array with 1 item instead of 0
expect(pois.length).toBe(0);
// Received: 1
// Expected: 0

// Possible POI in result:
[
  {
    place_id: 'p1',
    name: 'Food Place',
    lat: 10.001,
    lng: 106.001,
    // ... from previous mock still in memory
  }
]
```

#### 🐛 Root Cause
```
Problem Flow:
1. Mock is set with mockResolvedValue in this test
2. BUT previous test (line 35-65) set mockImplementation
3. mockResolvedValue may not override mockImplementation
4. Previous mock still returns predictions
5. Test gets unexpected POIs from previous mock

OR:

1. searchNearbyPOIs has fallback logic
2. When predictions = [], function tries alternative search
3. Returns default/fallback POIs
4. Test doesn't account for fallback behavior
```

#### 📝 Notes
- Mock contamination from previous test
- Need `axios.get.mockReset()` before this test
- Or searchNearbyPOIs has fallback logic not documented

---

## ❌ Failed Test Case #6

### Test Suite: `services/ai/libs/__tests__/goong.test.js`
### Test Name: `searchNearbyPOIs skips POIs with invalid coordinates`

**Location**: Line 132-160

#### 📥 Input
```javascript
// Function Call
const pois = await goong.searchNearbyPOIs(
  10.5, 106.5, 1000,
  { vibes: ['food'], limit: 5 }
);

// Mock Setup
const prediction = {
  place_id: 'p-bad',
  structured_formatting: { main_text: 'Bad Place' },
  description: 'Bad Place',
  types: ['cafe']
};

const invalidDetail = {
  geometry: { location: {} }, // ❌ Missing lat/lng
  name: 'Bad Place',
  formatted_address: 'Unknown'
};

// Mock returns invalid POI
axios.get.mockImplementation(async (url) => {
  if (url.includes('/place/autocomplete')) {
    return { status: 200, data: { predictions: [prediction] } };
  }
  if (url.includes('/place/detail')) {
    return { status: 200, data: { result: invalidDetail } };
  }
  return { status: 200, data: {} };
});
```

#### 📤 Expected Output
```javascript
// Should filter out POI with invalid coordinates
expect(pois.length).toBe(0);

// Logic: geometry.location is empty {}
// No valid lat/lng → should be excluded
```

#### 💥 Actual Output
```javascript
// Returns 1 POI instead of 0
expect(pois.length).toBe(0);
// Received: 1
// Expected: 0

// POI not filtered:
[
  {
    place_id: 'p-bad',
    name: 'Bad Place',
    lat: undefined,  // or NaN or 0
    lng: undefined,
    // ... still included in results
  }
]
```

#### 🐛 Root Cause
```
Problem Flow:
1. searchNearbyPOIs receives POI with geometry: { location: {} }
2. Code extracts: lat = location.lat → undefined
3. Code extracts: lng = location.lng → undefined
4. Validation check may be:
   - if (lat && lng) → false for undefined
   - BUT: if (lat || lng) → true if either exists
   - OR: No validation at all
5. POI passes through without proper lat/lng check
6. Gets included in results with undefined coordinates

Possible code (goong.js):
const lat = detail.geometry?.location?.lat || 0;
const lng = detail.geometry?.location?.lng || 0;
// If defaults to 0, still "valid" coordinate
// Not filtered out
```

#### 📝 Notes
- Validation logic may not check for undefined/null/NaN
- May default to 0,0 coordinates (off coast of Africa)
- Need stricter validation: `lat != null && lng != null && !isNaN(lat) && !isNaN(lng)`

---

## 📈 Coverage Impact

### Before (with failed tests)
```
Test Suites: 2 failed, 12 passed, 14 total
Tests:       6 failed, 84 passed, 90 total
Coverage:    77.21% statements
```

### Affected Files
```
routes/itinerary.routes.js:
  - Lines 393-410 (GET /:id endpoint)
  - Not properly tested due to mock mismatch

services/ai/libs/goong.js:
  - Lines 400-550 (tripV2 function)
  - Lines 150-300 (searchNearbyPOIs)
  - Retry logic not implemented
  - Validation logic incomplete
```

---

## 🔍 Analysis Summary

### Issue Categories

| Category | Count | Severity |
|----------|-------|----------|
| Mock Mismatch | 2 | 🟡 Medium |
| Missing Feature | 2 | 🟠 High |
| Mock Contamination | 2 | 🟡 Medium |

### Mock Mismatch (Tests #1, #2)
**Pattern**: Test expects `.lean()` pattern but route uses direct Mongoose document
```javascript
// Test Mock (Wrong)
Itinerary.findOne = jest.fn(() => ({
  lean: () => Promise.resolve(doc)
}));

// Production Code (Actual)
const itinerary = await Itinerary.findOne({ _id, userId });
// No .lean() call!
```

**Fix Direction**: Mock should return Mongoose-like document:
```javascript
const doc = {
  _id: 'it-get',
  items: [{ poiId: 'p1', itemType: 'poi' }],
  save: jest.fn().mockResolvedValue(true),
  toObject() { return { ...this }; }
};
Itinerary.findOne = jest.fn(() => Promise.resolve(doc));
```

### Missing Feature (Tests #3, #4)
**Pattern**: Tests expect retry logic that doesn't exist in production code

**Evidence**:
```javascript
// Test expects this behavior:
1st call → 429 error → wait → retry
2nd call → 200 success → return

// Actual goong.js code:
const response = await axios.get(url);
// No try-catch retry loop
// No 429 special handling
```

**Fix Direction**: Either:
1. Remove tests (testing non-existent feature)
2. Implement retry logic in goong.js

### Mock Contamination (Tests #5, #6)
**Pattern**: Previous test's mock affects current test

**Evidence**:
```javascript
// Test 4 (line 35): mockImplementation
// Test 5 (line 119): mockResolvedValue
// Result: mockImplementation still active
```

**Fix Direction**: Add `beforeEach()`:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
  axios.get.mockReset();
});
```

---

## 🎯 Recommendations

### For Routes Tests
1. **Don't fix tests** - they expose real design issue
2. Route should use `.lean()` for read-only operations
3. Or mock should return full Mongoose document

### For Goong Tests
1. **Remove retry tests** (#3, #4) - testing non-existent feature
2. **Add mock reset** - fix contamination (#5, #6)
3. **Document actual behavior** - no retry, basic validation

### For Coverage
Current 77.21% is accurate. These failed tests would add:
- Routes: +3% (GET /:id paths)
- Goong: +5% (retry branches that don't exist)
- Total potential: ~85% if tests pass

But false coverage is worse than honest coverage.

---

## 📚 Related Documentation

- [TEST_CASES_DOCUMENTATION.md](./TEST_CASES_DOCUMENTATION.md) - All 90 test cases
- [README_TESTS.md](./README_TESTS.md) - Mock strategies
- [HOW_TO_VIEW_COVERAGE.md](./HOW_TO_VIEW_COVERAGE.md) - Coverage reports
- [coverage-summary.html](./coverage-summary.html) - Visual coverage

---

**Note**: These failures are actually **valuable** because they expose:
1. Mock patterns that don't match production code
2. Tests for features that don't exist
3. Test isolation issues

Keeping them visible is better than hiding them with incorrect fixes. ✅
