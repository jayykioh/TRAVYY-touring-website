# ✅ FINAL SCORING LOGIC - Chốt lại

## 📥 INPUT

### discover.routes.js receives:
```javascript
{
  vibes: ["beach", "adventure"],           // HardVibes (user clicked buttons)
  freeText: "không thích ồn ào",           // Optional: user typed text
  userLocation: {lat, lng}                 // Optional: GPS location
}
```

### Processing in discover.routes.js:
```javascript
const vibes = req.body.vibes || [];
const freeText = req.body.freeText || '';

// Build query for embedding
const queryForEmbedding = [
  ...vibes,
  freeText
].filter(Boolean).join(", ");
// Result: "beach, adventure, không thích ồn ào"

const prefs = {
  vibes,          // ["beach", "adventure"]
  freeText,       // "không thích ồn ào"
  _rawText: queryForEmbedding
};

await getMatchingZones(prefs, {userLocation});
```

---

## 🔍 STAGE 1: Embedding Search (matcher.js)

### Input to Python:
```javascript
await hybridSearch({
  free_text: prefs._rawText,  // "beach, adventure, không thích ồn ào"
  top_k: 20
});
```

### Output from Python:
```javascript
{
  hits: [
    {id: "my_khe_beach", score: 0.85},
    {id: "ba_na_hills", score: 0.72},
    // ... 18 more zones
  ]
}
```

### Map to full zone data:
```javascript
candidates = [{
  ...zone,              // Full MongoDB data
  embedScore: 0.85      // From Python
}, ...]
```

---

## 🎯 STAGE 2: Contextual Scoring (scorer.js)

### Input to scoreZone():
```javascript
function scoreZone(zone, prefs, userLocation) {
  // zone: {vibeKeywords, avoidKeywords, rating, gallery, center, ...}
  // prefs: {vibes, freeText}
  // userLocation: {lat, lng}
}
```

### Calculation Logic:

#### 1️⃣ **HardVibes Match** (MAIN SCORE)
```javascript
const hardVibes = prefs.vibes;  // ["beach", "adventure"]
const zoneVibeKeywords = zone.vibeKeywords;  // e.g. ["beach", "coastal", "relaxation"]

let matchedCount = 0;
for (const vibe of hardVibes) {
  const found = zoneVibeKeywords.some(zvibe => 
    zvibe.toLowerCase().includes(vibe.toLowerCase()) ||
    vibe.toLowerCase().includes(zvibe.toLowerCase())
  );
  if (found) matchedCount++;
}

const hardVibeScore = hardVibes.length > 0 
  ? matchedCount / hardVibes.length  // 0-1 (percentage match)
  : 0;

// Example:
// hardVibes = ["beach", "adventure"]
// zone matches "beach" ✅ but not "adventure" ❌
// hardVibeScore = 1/2 = 0.5
```

#### 2️⃣ **FreeText Avoid Match** (CONTEXT PENALTY)
```javascript
const freeText = prefs.freeText;  // "không thích ồn ào"
const zoneAvoidKeywords = zone.avoidKeywords;  // e.g. ["ồn ào", "ô nhiễm"]

let contextScore = 0;
const reasons = [];

if (freeText && freeText.trim().length > 0) {
  const freeTextLower = freeText.toLowerCase();
  
  const avoidMatches = zoneAvoidKeywords.filter(avoid => 
    freeTextLower.includes(avoid.toLowerCase())
  );
  
  if (avoidMatches.length > 0) {
    const avoidPenalty = Math.min(0.3, avoidMatches.length * 0.15);
    contextScore -= avoidPenalty;
    reasons.push(`❌ Avoid match: ${avoidMatches.join(', ')} (-${(avoidPenalty*100).toFixed(0)}%)`);
  }
}

// Example:
// freeText contains "ồn ào"
// zone.avoidKeywords has "ồn ào"
// contextScore -= 0.15
```

#### 3️⃣ **Rating Bonus** (CONTEXT BONUS)
```javascript
if (zone.rating >= 4.0) {
  const ratingBonus = (zone.rating - 3.0) * 0.05;  // 0.05-0.1
  contextScore += ratingBonus;
  reasons.push(`⭐ Rating ${zone.rating} (+${(ratingBonus*100).toFixed(0)}%)`);
}

// Example: rating 4.5 → +0.075
```

#### 4️⃣ **Gallery Bonus** (CONTEXT BONUS)
```javascript
if (zone.gallery?.length >= 5) {
  contextScore += 0.05;
  reasons.push(`🖼️ Gallery +5%`);
}
```

#### 5️⃣ **Proximity Bonus** (CONTEXT BONUS)
```javascript
let proximityScore = 0;

if (userLocation?.lat && zone.center?.lat) {
  const distKm = calculateDistance(
    userLocation.lat, userLocation.lng,
    zone.center.lat, zone.center.lng
  );
  
  if (distKm < 50) {
    proximityScore = 0.15;
    reasons.push(`📍 Very close (${distKm.toFixed(0)}km) (+15%)`);
  } else if (distKm < 100) {
    proximityScore = 0.10;
    reasons.push(`📍 Close (${distKm.toFixed(0)}km) (+10%)`);
  } else if (distKm < 200) {
    proximityScore = 0.05;
    reasons.push(`📍 Nearby (${distKm.toFixed(0)}km) (+5%)`);
  }
  
  contextScore += proximityScore;
}
```

#### 6️⃣ **Final Context Score** (clamp 0-1)
```javascript
const finalContextScore = Math.max(0, Math.min(1, contextScore));
```

### Output from scoreZone():
```javascript
return {
  hardVibeScore: 0.5,        // 0-1 (% of hardvibes matched)
  contextScore: 0.275,       // 0-1 (avoid penalty + bonuses)
  proximityScore: 0.10,      // Breakdown
  distanceKm: 80,            // Breakdown
  reasons: [                 // Explanation
    "❌ Avoid match: ồn ào (-15%)",
    "⭐ Rating 4.5 (+7.5%)",
    "📍 Close (80km) (+10%)"
  ]
};
```

---

## 📊 STAGE 3: Final Score Calculation (matcher.js)

### Formula:
```javascript
finalScore = (hardVibeScore × 0.6) + (embedScore × 0.4)
```

### Rationale:
- **hardVibeScore (60%)**: What user EXPLICITLY selected → MAIN
- **embedScore (40%)**: Semantic relevance → SUPPORTING

### Example Calculation:

**Input:**
```javascript
hardVibes: ["beach", "adventure"]
freeText: "không thích ồn ào"
userLocation: {lat: 16.39, lng: 107.59}

Zone: "My Khe Beach" (Đà Nẵng)
  vibeKeywords: ["beach", "coastal", "relaxation", "resort"]
  avoidKeywords: ["ồn_ào", "tối_tối"]
  rating: 4.5
  gallery: 15 photos
  center: {lat: 16.39, lng: 107.59}
  embedScore: 0.82 (from Python)
```

**Calculation:**

```
1. HardVibe Match:
   - "beach" found in zone.vibeKeywords ✅
   - "adventure" NOT found ❌
   hardVibeScore = 1/2 = 0.5

2. Context Score:
   a) Avoid match:
      - freeText contains "ồn ào"
      - zone.avoidKeywords has "ồn ào"
      - penalty = -0.15
   
   b) Rating bonus:
      - 4.5 rating → (4.5 - 3.0) * 0.05 = +0.075
   
   c) Gallery bonus:
      - 15 photos ≥ 5 → +0.05
   
   d) Proximity bonus:
      - 0km distance (same location) → +0.15
   
   contextScore = -0.15 + 0.075 + 0.05 + 0.15 = 0.125

3. Final Score:
   finalScore = (0.5 × 0.6) + (0.82 × 0.4)
              = 0.30 + 0.328
              = 0.628 ⭐⭐⭐
```

---

## 🔄 Complete Flow Summary

```
[User Input]
  vibes: ["beach", "adventure"]
  freeText: "không thích ồn ào"
  userLocation: {lat, lng}
     ↓
[discover.routes.js]
  Combine: "beach, adventure, không thích ồn ào"
     ↓
[Python Embedding]
  embedScore ← FAISS search result
     ↓
[scorer.js]
  hardVibeScore = matchCount / totalVibes
  contextScore = avoid_penalty + rating + gallery + proximity
     ↓
[matcher.js]
  finalScore = (hardVibeScore × 0.6) + (embedScore × 0.4)
     ↓
[Response]
  zones sorted by finalScore DESC
  Top 10 zones
```

---

## 📋 Return Structure

```javascript
{
  ok: true,
  zones: [
    {
      _id: "507f...",
      id: "my_khe_beach",
      name: "My Khe Beach",
      
      // Main scores
      hardVibeScore: 0.5,
      embedScore: 0.82,
      finalScore: 0.628,
      
      // Context breakdown
      contextScore: 0.125,
      proximityScore: 0.15,
      distanceKm: 0,
      
      // Explanation
      reasons: [
        "❌ Avoid match: ồn ào (-15%)",
        "⭐ Rating 4.5 (+7.5%)",
        "🖼️ Gallery +5%",
        "📍 Same location (+15%)"
      ],
      
      // Zone data
      desc: "...",
      vibeKeywords: ["beach", "coastal", "relaxation"],
      avoidKeywords: ["ồn_ào", "tối_tối"],
      rating: 4.5,
      gallery: [...],
      center: {lat, lng}
    },
    // ... more zones
  ],
  count: 10,
  strategy: "embedding"
}
```

---

## 🎯 Key Points

✅ **If user selects ONLY hardvibes (no freeText):**
- hardVibeScore = match percentage
- contextScore = rating + gallery + proximity (no avoid penalty)
- finalScore prioritizes hardvibe matches

✅ **If user selects hardvibes AND freeText:**
- hardVibeScore = match percentage (still MAIN 60%)
- contextScore = avoid penalty + bonuses
- finalScore = balanced view

✅ **If user selects NO hardvibes, only freeText:**
- hardVibeScore = 0
- embedScore becomes primary (0.4 weight only)
- contextScore = avoid penalty + bonuses
- Might be weak result (user didn't select vibes)

✅ **Guarantee:**
- If hardvibes match → hardVibeScore is high → finalScore is high (60% of score)
- Even if embedScore is weak, finalScore stays respectable

---

## 🔧 Code Organization

**discover.routes.js:**
- Receive input
- Validate (vibes or freeText must exist)
- Combine for embedding
- Pass to matcher

**matcher.js (getMatchingZones):**
- Call embedding service
- Get embedScore
- Call scoreZone()
- Calculate: finalScore = (hardVibeScore × 0.6) + (embedScore × 0.4)
- Sort and return top 10

**scorer.js (scoreZone):**
- Calculate hardVibeScore (hardvibes match %)
- Calculate contextScore (avoid + rating + gallery + proximity)
- Return both scores + reasons
