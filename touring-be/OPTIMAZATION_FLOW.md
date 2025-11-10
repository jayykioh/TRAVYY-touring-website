# 🚀 Itinerary Optimization Flow

## Overview
Complete journey from zone selection to AI-optimized itinerary with map visualization.

## 1️⃣ **Zone Selection & POI Discovery**

### Frontend: `ZoneDetail.jsx`
```javascript
// User selects zone with vibes (e.g., ["food", "photo", "beach"])
useEffect(() => {
  const fetchPOIs = async () => {
    const vibes = location.state?.prefs?.vibes || [];
    const url = `/api/zones/${zoneId}/pois?vibes=${vibes.join(',')}&limit=10`;
    const response = await fetch(url);
    const data = await response.json();
    setPOIs(data.pois); // Each POI has: {place_id, name, lat, lng, loc, location}
  };
  fetchPOIs();
}, [zoneId]);
```

### Backend: `routes/zones.js`
```javascript
router.get('/:zoneId/pois', async (req, res) => {
  const { vibes, limit } = req.query;
  const zone = await Zone.findById(req.params.zoneId);
  
  // Call Goong API
  const pois = await searchNearbyPOIs(
    zone.center.lat,
    zone.center.lng,
    zone.radius || 5000,
    { vibes: vibes.split(','), limit: parseInt(limit) || 20 }
  );
  
  res.json({ success: true, pois });
});
```

### Goong API: `services/ai/libs/goong.js`
```javascript
async function searchNearbyPOIs(lat, lng, radius, options) {
  // 1. Generate search terms from vibes
  const searchTerms = generateSearchTerms(options.vibes);
  // ["quán ăn", "nhà hàng", "điểm tham quan", "bãi biển"]
  
  // 2. Call Autocomplete API for each term
  for (const term of searchTerms) {
    const predictions = await autoComplete({
      input: term,
      lat, lng, radius,
      limit: Math.ceil(options.limit / searchTerms.length)
    });
    // Predictions: [{place_id, description, types}]
  }
  
  // 3. Get full details (with coordinates) for each place_id
  const details = await batchGetPlaceDetails(placeIds);
  
  // 4. Return normalized POIs with ALL coordinate formats
  return pois.map(detail => ({
    place_id: detail.place_id,
    name: detail.name,
    address: detail.formatted_address,
    lat: detail.geometry.location.lat,
    lng: detail.geometry.location.lng,
    loc: { lat: ..., lng: ... },      // Goong format
    location: { lat: ..., lng: ... }, // Google format
    geometry: { location: { lat, lng } },
    types: detail.types,
    rating: detail.rating
  }));
}
```

## 2️⃣ **Itinerary Creation (Draft)**

### Frontend: User clicks "Add to Itinerary"
```javascript
const toggleAddPoi = async (poi) => {
  // 1. Check if logged in
  if (!isAuth) {
    navigate('/login');
    return;
  }
  
  // 2. Create or get draft itinerary
  let itinerary = await fetch('/api/itinerary', {
    method: 'POST',
    body: JSON.stringify({
      zoneId,
      zoneName: zone.name,
      preferences: { vibes, pace: 'moderate', bestTime: 'morning' }
    })
  });
  
  // 3. Add POI to itinerary
  await fetch(`/api/itinerary/${itinerary._id}/items`, {
    method: 'POST',
    body: JSON.stringify({ poi })
  });
};
```

### Backend: `routes/itinerary.routes.js`
```javascript
// POST /api/itinerary/:id/items
router.post('/:id/items', authJwt, async (req, res) => {
  const { poi } = req.body;
  const itinerary = await Itinerary.findById(req.params.id);
  
  // ✅ CRITICAL: Extract coordinates from ALL possible sources
  const newItem = {
    poiId: poi.place_id || poi.id,
    name: poi.name,
    address: poi.address || poi.vicinity,
    location: {
      lat: poi.geometry?.location?.lat || poi.lat || poi.location?.lat || 0,
      lng: poi.geometry?.location?.lng || poi.lng || poi.location?.lng || 0
    },
    types: poi.types,
    rating: poi.rating
  };
  
  itinerary.items.push(newItem);
  itinerary.isOptimized = false;
  await itinerary.save();
  
  res.json({ success: true, itinerary });
});
```

## 3️⃣ **View Draft Itinerary**

### Frontend: `ItineraryView.jsx`
```javascript
// User navigates to /itinerary/view/:id
useEffect(() => {
  const fetchItinerary = async () => {
    const data = await withAuth(`/api/itinerary/${id}`);
    setItinerary(data.itinerary);
    
    // ✅ LOG: Check coordinates
    console.log('Items with coordinates:', data.itinerary.items.map(item => ({
      name: item.name,
      lat: item.location?.lat,
      lng: item.location?.lng,
      hasCoords: !!(item.location?.lat && item.location?.lng)
    })));
  };
  fetchItinerary();
}, [id]);
```

## 4️⃣ **AI Optimization (Main Flow)**

### Frontend: User clicks "Optimize with AI"
```javascript
const handleOptimize = async () => {
  // 1. Validate (at least 2 POIs with coordinates)
  const validItems = itinerary.items.filter(
    item => item.location?.lat && item.location?.lng
  );
  if (validItems.length < 2) {
    alert('Need at least 2 locations');
    return;
  }
  
  // 2. Call backend optimize endpoint
  const data = await withAuth(`/api/itinerary/${itinerary._id}/optimize-ai`, {
    method: 'POST'
  });
  
  // 3. Navigate to result page
  navigate(`/itinerary/result/${data.itinerary._id}`, {
    state: { itinerary: data.itinerary }
  });
};
```

### Backend: `routes/itinerary.routes.js`
```javascript
// POST /api/itinerary/:id/optimize-ai
router.post('/:id/optimize-ai', authJwt, async (req, res) => {
  const itinerary = await Itinerary.findById(req.params.id);
  
  // ========== STEP 1: Extract Coordinates ==========
  const items = itinerary.items.filter(i => i.location?.lat && i.location?.lng);
  const points = items.map(i => [i.location.lng, i.location.lat]); // [lng, lat]
  
  console.log('📍 Points for Goong API:', points);
  
  // ========== STEP 2: Call Goong Trip V2 API ==========
  const tripData = await tripV2(points, { vehicle: 'car', roundtrip: false });
  /*
  Response format:
  {
    code: "Ok",
    trips: [{
      distance: 2630 (meters),
      duration: 420 (seconds),
      geometry: "w{r~C...encoded_polyline...", // ✅ CRITICAL
      legs: [
        { distance: 1200, duration: 180, steps: [...] },
        { distance: 1430, duration: 240, steps: [...] }
      ]
    }],
    waypoints: [
      { location: [lng, lat], waypoint_index: 0 },
      { location: [lng, lat], waypoint_index: 1 },
      ...
    ]
  }
  */
  
  const trip = tripData.trips[0];
  
  console.log('✅ Trip data:', {
    distance: `${(trip.distance / 1000).toFixed(2)} km`,
    duration: `${Math.round(trip.duration / 60)} min`,
    hasGeometry: !!trip.geometry,
    geometryLength: trip.geometry?.length,
    geometryPreview: trip.geometry?.substring(0, 50)
  });
  
  // ========== STEP 3: Save Route Polyline ==========
  // ✅ CRITICAL: Save the encoded polyline for frontend
  itinerary.routePolyline = trip.geometry;
  itinerary.totalDistance = Math.round((trip.distance / 1000) * 100) / 100;
  itinerary.totalDuration = Math.round(trip.duration / 60);
  
  console.log('💾 Saving polyline:', {
    hasPolyline: !!itinerary.routePolyline,
    length: itinerary.routePolyline?.length
  });
  
  // ========== STEP 4: Build Timeline ==========
  const zoneBestTime = itinerary.preferences?.bestTime || 'anytime';
  const { start, end } = getZoneTimeWindow(zoneBestTime);
  let currentTime = toMin(start); // Convert to minutes
  
  items.forEach((item, idx) => {
    const leg = trip.legs?.[idx - 1];
    const travelMin = leg ? Math.round(leg.duration / 60) : 0;
    const stayMin = estimateDurationByCategory(item, itinerary.preferences?.pace);
    
    // Add travel time from previous POI
    if (idx > 0) currentTime += travelMin;
    
    item.startTime = fromMin(currentTime);
    item.endTime = fromMin(currentTime + stayMin);
    item.duration = stayMin;
    item.timeSlot = timeSlotFromMinute(currentTime);
    item.travelFromPrevious = leg ? {
      distance: Math.round((leg.distance / 1000) * 100) / 100,
      duration: travelMin,
      mode: travelMin < 5 ? 'walking' : 'driving'
    } : undefined;
    
    currentTime += stayMin;
  });
  
  itinerary.items = items;
  
  // ========== STEP 5: AI Insights (Optional, 3s timeout) ==========
  let aiInsights = null;
  try {
    const prompt = buildItineraryPrompt(itinerary, {
      distance: trip.distance,
      duration: trip.duration,
      legs: trip.legs
    });
    
    aiInsights = await Promise.race([
      callLLMAndParse(prompt),
      new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), 3000))
    ]);
    
    if (aiInsights) {
      itinerary.aiInsights = aiInsights;
      console.log('✅ AI insights generated');
    }
  } catch (error) {
    console.warn('⚠️ LLM timeout, using fallback');
    itinerary.aiInsights = generateFallbackInsights();
  }
  
  itinerary.isOptimized = true;
  itinerary.optimizedAt = new Date();
  await itinerary.save();
  
  console.log('💾 Final itinerary saved:', {
    id: itinerary._id,
    itemsCount: itinerary.items.length,
    hasPolyline: !!itinerary.routePolyline,
    polylineLength: itinerary.routePolyline?.length,
    hasAiInsights: !!itinerary.aiInsights
  });
  
  res.json({ success: true, itinerary });
});
```

### Goong Trip V2 API: `services/ai/libs/goong.js`
```javascript
async function tripV2(points, { vehicle = 'car', roundtrip = false }) {
  // points: [[lng1, lat1], [lng2, lat2], [lng3, lat3]]
  
  // Convert to Goong format: "lat,lng"
  const origin = `${points[0][1]},${points[0][0]}`;
  const destination = `${points[points.length - 1][1]},${points[points.length - 1][0]}`;
  const waypoints = points.slice(1, -1)
    .map(([lng, lat]) => `${lat},${lng}`)
    .join(';');
  
  const url = `https://rsapi.goong.io/v2/trip?` +
    `origin=${origin}&` +
    `destination=${destination}&` +
    (waypoints ? `waypoints=${waypoints}&` : '') +
    `vehicle=${vehicle}&` +
    `roundtrip=${roundtrip}&` +
    `api_key=${GOONG_API_KEY}`;
  
  const response = await axios.get(url, { timeout: 20000 });
  const data = response.data;
  
  if (!data.trips || data.trips.length === 0) {
    throw new Error('No trips returned from Goong API');
  }
  
  return data; // { trips: [...], waypoints: [...] }
}
```

### Gemini LLM: `services/itinerary/optimizer.js`
```javascript
async function callLLMAndParse(prompt) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192, // ✅ Increased for Vietnamese
      responseMimeType: "application/json" // ✅ Force JSON mode
    }
  });
  
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Validate JSON completeness
  const openBraces = (text.match(/\{/g) || []).length;
  const closeBraces = (text.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    throw new Error('Incomplete JSON response');
  }
  
  const parsed = JSON.parse(text);
  
  return {
    summary: parsed.summary,
    perStopReason: parsed.perStopReason, // Array[N]
    tips: parsed.tips // Array[N] of Array[2-3]
  };
}
```

## 5️⃣ **Display Optimized Result**

### Frontend: `ItineraryResult.jsx`
```javascript
useEffect(() => {
  const loadItinerary = async () => {
    const data = await withAuth(`/api/itinerary/${id}`);
    setItinerary(data.itinerary);
    
    // ✅ LOG: Check if polyline exists
    console.log('🗺️ Itinerary loaded:', {
      id: data.itinerary._id,
      hasPolyline: !!data.itinerary.routePolyline,
      polylineLength: data.itinerary.routePolyline?.length,
      itemsCount: data.itinerary.items.length
    });
  };
  loadItinerary();
}, [id]);

// Build markers for map
const poisForMap = items.map((item, idx) => ({
  place_id: item.poiId,
  name: item.name,
  order: idx + 1,
  loc: { lat: item.location.lat, lng: item.location.lng }
}));

return (
  <div>
    {/* Timeline with AI insights */}
    <div className="timeline">
      {items.map((item, idx) => (
        <div key={item.poiId}>
          {/* Show travel segment */}
          {idx > 0 && item.travelFromPrevious && (
            <div>🚗 {item.travelFromPrevious.distance} km • {item.travelFromPrevious.duration} min</div>
          )}
          
          {/* Show POI card */}
          <div>
            <h3>#{idx + 1} {item.name}</h3>
            <p>⏰ {item.startTime} – {item.endTime}</p>
            
            {/* AI reason */}
            <div>💡 {ai.perStopReason[idx]}</div>
            
            {/* AI tips */}
            <ul>
              {(ai.tips[idx] || []).map(tip => <li>✓ {tip}</li>)}
            </ul>
          </div>
        </div>
      ))}
    </div>
    
    {/* Map with route */}
    <MapLibrePanel
      center={poisForMap[0]?.loc}
      pois={poisForMap}
      routePolyline={itinerary.routePolyline} // ✅ Pass encoded polyline
    />
  </div>
);
```

### Frontend: `GoongMapLibre.jsx`
```javascript
useEffect(() => {
  if (!map.current || !mapReady) return;
  
  // ✅ LOG: Polyline received
  console.log('🗺️ Applying route:', {
    hasPolyline: !!routePolyline,
    type: typeof routePolyline,
    length: routePolyline?.length
  });
  
  // 1. Decode polyline
  const coords = decodePolyline(routePolyline);
  console.log('✅ Decoded:', coords.length, 'coordinates');
  
  // 2. Create GeoJSON feature
  const feature = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: coords // [[lng, lat], [lng, lat], ...]
    }
  };
  
  // 3. Add to map
  map.current.addSource('route-src', {
    type: 'geojson',
    data: feature
  });
  
  map.current.addLayer({
    id: 'route-layer',
    type: 'line',
    source: 'route-src',
    paint: {
      'line-color': '#2563eb',
      'line-width': 5
    }
  });
  
  // 4. Fit bounds
  const bounds = coords.reduce(
    (b, c) => b.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );
  map.current.fitBounds(bounds, { padding: 50 });
  
  console.log('✅ Route displayed on map');
}, [routePolyline, mapReady]);
```

## Key Takeaways

### ✅ Critical Success Factors:
1. **Coordinates**: Store in ALL formats (`lat`, `lng`, `loc`, `location`, `geometry`)
2. **Polyline**: Save `trip.geometry` from Goong Trip V2 response
3. **Map Timing**: Wait for `mapReady` before adding route layer
4. **LLM**: Use `maxOutputTokens: 8192` + validate JSON completeness
5. **Fallback**: Always provide fallback insights if LLM fails

### ❌ Common Pitfalls:
1. Missing coordinates in POI data → Can't optimize
2. Map layers added before style loaded → Route invisible
3. LLM response truncated → JSON parse fails
4. No timeout on LLM → Request hangs
5. Wrong coordinate format for Goong API → Trip fails

### 📊 Expected Logs (Success):
```
📍 Calling Trip V2 with 3 points
✅ Trip data: { distance: '2.63 km', duration: '7 min', hasGeometry: true, geometryLength: 200 }
💾 Saving polyline: { hasPolyline: true, length: 200 }
🤖 Calling Gemini: gemini-2.0-flash-exp
✅ LLM Response in 3.45s
✅ Valid response: { summaryLength: 142, perStopReasonCount: 3, tipsCount: 3 }
💾 Final itinerary saved: { hasPolyline: true, hasAiInsights: true }
🗺️ Applying route: { hasPolyline: true, length: 200 }
✅ Decoded: 87 coordinates
✅ Route displayed on map
```