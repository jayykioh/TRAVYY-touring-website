// libs/goong.js
require("dotenv").config();
const axios = require("axios");
const NodeCache = require("node-cache");

// ✅ Longer cache for POI data (2 hours)
const poiCache = new NodeCache({ stdTTL: 7200 });
const BASE_V1 = "https://rsapi.goong.io";
const BASE_V2 = "https://rsapi.goong.io/v2"; // ✅ Correct with /v2
const KEY = process.env.GOONG_API_KEY;

/**
 * Map vibes to Vietnamese search terms
 */
const VIBE_TO_VIETNAMESE = {
  food: ["quán ăn", "nhà hàng", "cafe"],
  photo: ["điểm tham quan", "check-in"],
  sunset: ["bãi biển", "viewpoint", "hoàng hôn"],
  beach: [
    "bãi biển",
    "resort",
    "bãi tắm",
    "du lịch biển",
    "biển đẹp",
    "đảo",
    "hải sản",
  ],
  nature: ["công viên", "thiên nhiên"],
  culture: ["bảo tàng", "đình chùa", "di tích"],
  shopping: ["trung tâm thương mại", "chợ"],
  nightlife: ["bar", "quán nhậu"],
};

/**
 * Generate MINIMAL Vietnamese search terms
 */
function generateSearchTerms(vibes) {
  const terms = new Set();

  // Get TOP 2 terms per vibe
  for (const vibe of vibes || []) {
    const vietnameseTerms =
      VIBE_TO_VIETNAMESE[(vibe || "").toLowerCase()] || [];
    vietnameseTerms.slice(0, 2).forEach((t) => terms.add(t));
  }

  // Fallback
  if (terms.size === 0) {
    ["điểm tham quan", "quán ăn", "cafe"].forEach((t) => terms.add(t));
  }

  // Max 5 terms
  return Array.from(terms).slice(0, 5);
}

/**
 * Clear all cache (for debugging)
 */
function clearCache() {
  poiCache.flushAll();
  console.log("🗑️  Cache cleared");
}

/**
 * Call Goong API with caching and retry
 */
async function callGoongAPI(url, retries = 2) {
  const cacheKey = `goong_${url}`;
  const cached = poiCache.get(cacheKey);

  // ✅ Always use cache if available
  if (cached) {
    console.log(`   💾 Cache hit`);
    return cached;
  }

  // Rate limit delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        Accept: "application/json",
        "User-Agent": "TouringApp/1.0",
      },
    });

    const data = response.data;

    // ✅ Cache everything (even empty results)
    poiCache.set(cacheKey, data);

    return data;
  } catch (error) {
    if (error?.response?.status === 429 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return callGoongAPI(url, retries - 1);
    }

    console.error(
      `   ❌ Goong error: ${error?.response?.status || error.message}`
    );
    return { predictions: [] };
  }
}

/* =========================
 * V2 IMPLEMENTATION + FALLBACK V1
 * ========================= */

/** --------- V2 ---------- */
async function autoCompleteV2({
  input,
  lat,
  lng,
  radius,
  limit = 10,
  hasDeprecated = false,
}) {
  const url =
    `${BASE_V2}/place/autocomplete` +
    `?input=${encodeURIComponent(input)}` +
    (lat != null && lng != null ? `&location=${lat},${lng}` : "") +
    (radius ? `&radius=${radius}` : "") +
    `&limit=${limit}` +
    (hasDeprecated ? `&has_deprecated_administrative_unit=true` : "") +
    `&api_key=${KEY}`;

  const data = await callGoongAPI(url);
  if (data?.predictions) {
    console.log("   🔎 V2 autocomplete hit");
    return data.predictions;
  }
  return [];
}

async function placeDetailV2(placeId, { hasDeprecated = false } = {}) {
  const url =
    `${BASE_V2}/place/detail` +
    `?place_id=${encodeURIComponent(placeId)}` +
    (hasDeprecated ? `&has_deprecated_administrative_unit=true` : "") +
    `&api_key=${KEY}`;

  const data = await callGoongAPI(url);
  if (data?.result) {
    console.log("   🟢 V2 detail hit");
    return data.result; // may include compound, deprecated_* fields
  }
  return null;
}

/** --------- V1 (fallback) ---------- */
async function autoCompleteV1({ input, lat, lng, radius, limit = 10 }) {
  const url =
    `${BASE_V1}/Place/AutoComplete` +
    `?input=${encodeURIComponent(input)}` +
    (lat != null && lng != null ? `&location=${lat},${lng}` : "") +
    (radius ? `&radius=${radius}` : "") +
    `&limit=${limit}` +
    `&api_key=${KEY}`;

  const data = await callGoongAPI(url);
  if (data?.predictions) {
    console.log("   ⚪ V1 autocomplete fallback");
    return data.predictions;
  }
  return [];
}

async function placeDetailV1(placeId) {
  const url =
    `${BASE_V1}/Place/Detail` +
    `?place_id=${encodeURIComponent(placeId)}` +
    `&api_key=${KEY}`;

  const data = await callGoongAPI(url);
  if (data?.result) {
    console.log("   ⚪ V1 detail fallback");
    return data.result;
  }
  return null;
}

/** --------- Unified wrappers (prefer V2) ---------- */
async function autoComplete(params) {
  try {
    const res = await autoCompleteV2(params);
    if (res?.length) return res;
    return await autoCompleteV1(params);
  } catch (e) {
    console.warn("   ⚠️ V2 autocomplete failed → V1", e?.message);
    return await autoCompleteV1(params);
  }
}

async function placeDetail(placeId, opts) {
  try {
    const d = await placeDetailV2(placeId, opts);
    if (d) return d;
    return await placeDetailV1(placeId);
  } catch (e) {
    console.warn("   ⚠️ V2 detail failed → V1", e?.message);
    return await placeDetailV1(placeId);
  }
}

/* =========================
 * HIGH-LEVEL HELPERS
 * ========================= */

/**
 * ✅ Get place details with coordinates (unified)
 */
async function getPlaceDetail(placeId, opts = {}) {
  const detail = await placeDetail(placeId, opts);
  if (detail) return detail;
  return null;
}

/**
 * ✅ Batch fetch place details for multiple place_ids
 */
async function batchGetPlaceDetails(placeIds, opts = {}) {
  const results = new Map();

  console.log(`   🔄 Fetching details for ${placeIds.length} places...`);

  // Process in batches of 5 to avoid rate limit
  const batchSize = 5;

  for (let i = 0; i < placeIds.length; i += batchSize) {
    const batch = placeIds.slice(i, i + batchSize);

    const promises = batch.map(async (placeId) => {
      const detail = await getPlaceDetail(placeId, opts);
      if (detail) {
        results.set(placeId, detail);
      }
    });

    await Promise.all(promises);

    // Small delay between batches
    if (i + batchSize < placeIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.log(
    `   ✅ Got details for ${results.size}/${placeIds.length} places`
  );

  return results;
}

/* ====== Distance utils & HARD RADIUS FILTER ====== */
function haversineKm(a, b) {
  const R = 6371,
    toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * ✅ Search nearby POIs with Autocomplete (V2 preferred) + Place Detail
 */
async function searchNearbyPOIs(lat, lng, radius, options = {}) {
  const { vibes = [], limit = 20, hasDeprecated = true } = options;

  console.log(
    `   🔍 Goong search: (${lat}, ${lng}) r=${radius}m, vibes=[${vibes.join(
      ", "
    )}]`
  );

  const searchTerms = generateSearchTerms(vibes);
  console.log(`      Search terms: [${searchTerms.join(", ")}]`);

  // Step 1: Get predictions from Autocomplete (V2 → V1)
  const allPredictions = new Map();

  for (const term of searchTerms) {
    const perTermLimit = Math.max(1, Math.ceil(limit / searchTerms.length));

    const preds = await autoComplete({
      input: term,
      lat,
      lng,
      radius,
      limit: perTermLimit,
      hasDeprecated,
    });

    if (Array.isArray(preds)) {
      preds.forEach((pred) => {
        const pid = pred.place_id || pred.placeId || pred.placeID;
        if (pid && !allPredictions.has(pid)) {
          allPredictions.set(pid, {
            ...pred,
            place_id: pid,
            matchedTerm: term,
          });
        }
      });
    }
  }

  console.log(
    `      ✅ Found ${allPredictions.size} predictions from Autocomplete`
  );

  if (allPredictions.size === 0) {
    return [];
  }

  // Step 2: Fetch details for all predictions to get coordinates (V2 → V1)
  const placeIds = Array.from(allPredictions.keys());
  const detailsMap = await batchGetPlaceDetails(placeIds, { hasDeprecated });

  // Step 3: Combine prediction data with details → normalized POIs
  const allPOIs = new Map();

  for (const [placeId, prediction] of allPredictions) {
    const detail = detailsMap.get(placeId);

    const extractedLat = detail?.geometry?.location?.lat;
    const extractedLng = detail?.geometry?.location?.lng;

    // ✅ ADD: Debug log
    if (placeId === allPredictions.keys().next().value) {
      console.log("🔍 [Goong] First POI structure:", {
        placeId,
        prediction_types: prediction?.types,
        detail_geometry: detail?.geometry,
        extractedLat,
        extractedLng,
        detail_keys: detail ? Object.keys(detail) : [],
      });
    }

    if (extractedLat != null && extractedLng != null) {
      const lat = parseFloat(extractedLat);
      const lng = parseFloat(extractedLng);

      const name =
        prediction?.structured_formatting?.main_text ||
        prediction?.description ||
        detail?.name ||
        "Unknown";

      const address =
        prediction?.structured_formatting?.secondary_text ||
        detail?.formatted_address ||
        "";

      const types = prediction?.types || detail?.types || [];

      // ✅ CRITICAL: Make sure we save BOTH formats
      const poiObject = {
        place_id: placeId,
        name,
        address,

        // ✅ ADD: All coordinate formats for compatibility
        lat,
        lng,
        loc: { lat, lng }, // Goong format
        location: { lat, lng }, // Google format
        geometry: {
          // Full format
          location: { lat, lng },
        },

        types,
        rating: detail?.rating,
        matchedTerm: prediction.matchedTerm,
        compound: detail?.compound,
        plus_code: detail?.plus_code,
        source: "goong",
      };

      // ✅ ADD: Log the final POI object
      if (allPOIs.size === 0) {
        console.log("✅ [Goong] First POI saved as:", {
          name: poiObject.name,
          lat: poiObject.lat,
          lng: poiObject.lng,
          loc: poiObject.loc,
          location: poiObject.location,
        });
      }

      allPOIs.set(placeId, poiObject);
    } else {
      console.warn("⚠️ [Goong] POI missing coordinates:", {
        placeId,
        name: prediction?.structured_formatting?.main_text,
        detail_geometry: detail?.geometry,
      });
    }
  }

  return Array.from(allPOIs.values());
}

/**
 * Get distance matrix between multiple points
 * Uses Goong Distance Matrix API v2
 */
async function getDistanceMatrix(origins, destinations) {
  const cacheKey = `matrix_${origins.join("|")}_${destinations.join("|")}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log("   💾 Distance matrix cache hit");
    return cached;
  }

  try {
    const url = `https://rsapi.goong.io/DistanceMatrix?origins=${encodeURIComponent(
      origins.join("|")
    )}&destinations=${encodeURIComponent(
      destinations.join("|")
    )}&vehicle=car&api_key=${process.env.GOONG_API_KEY}`;

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        Accept: "application/json",
        "User-Agent": "TouringApp/1.0",
      },
    });

    const data = response.data;

    if (data.status === "OK") {
      cache.set(cacheKey, data);
      console.log(
        `   ✅ Distance matrix: ${origins.length}x${destinations.length}`
      );
      return data;
    }

    throw new Error(`Goong Distance Matrix error: ${data.status}`);
  } catch (error) {
    console.error("   ❌ Distance matrix error:", error.message);

    // Fallback: Haversine distances
    return {
      rows: origins.map((origin, i) => ({
        elements: destinations.map((dest, j) => {
          const [lat1, lng1] = origin.split(",").map(Number);
          const [lat2, lng2] = dest.split(",").map(Number);
          const distance = calculateDistance(lat1, lng1, lat2, lng2);

          return {
            distance: {
              value: distance * 1000,
              text: `${distance.toFixed(1)} km`,
            },
            duration: {
              value: Math.ceil(distance * 3 * 60),
              text: `${Math.ceil(distance * 3)} min`,
            }, // ~20km/h avg
            status: "OK",
          };
        }),
      })),
    };
  }
}

/**
 * Goong Trip V2 API
 * Optimizes route between multiple points
 * @param {Array} points - Array of [lng, lat] coordinates (min 2 points)
 * @param {Object} options - { vehicle: 'car' | 'bike' | 'taxi', roundtrip: true }
 * @returns {Object} Trip data with optimized route
 *
 * Response format:
 * {
 *   code: "Ok",
 *   trips: [{
 *     distance: 33343.4,  // meters
 *     duration: 10065.2,  // seconds
 *     geometry: "encoded_polyline",
 *     legs: [{ distance, duration, steps, summary }]
 *   }],
 *   waypoints: [{ location, place_id, waypoint_index }]
 * }
 */
async function tripV2(points, { vehicle = "car", roundtrip = false } = {}) {
  if (!points || points.length < 2) {
    throw new Error("Trip requires at least 2 points (origin + destination)");
  }

  // ✅ Convert [lng, lat] to "lat,lng" format
  const origin = `${points[0][1]},${points[0][0]}`;
  const destination = `${points[points.length - 1][1]},${points[points.length - 1][0]}`;

  // Middle points become waypoints
  const waypoints = points
    .slice(1, -1)
    .map(([lng, lat]) => `${lat},${lng}`)
    .join(";");

  const params = new URLSearchParams({
    origin,
    destination,
    vehicle,
    roundtrip: roundtrip.toString(),
    api_key: KEY,
  });

  // Only add waypoints if there are middle points
  if (waypoints) {
    params.append("waypoints", waypoints);
  }

  const url = `${BASE_V2}/trip?${params.toString()}`;

  console.log("🚗 [Goong Trip V2] Request:", {
    pointCount: points.length,
    vehicle,
    roundtrip,
    origin,
    destination,
    waypointsCount: points.length - 2,
    hasWaypoints: !!waypoints,
    url: url.replace(KEY, "API_KEY_HIDDEN"),
  });

  try {
    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        Accept: "application/json",
        "User-Agent": "TouringApp/1.0",
      },
    });

    const data = response.data;

    console.log("📦 [Goong Trip V2] Response:", {
      code: data.code,
      status: response.status,
      hasTrips: !!data.trips,
      tripsCount: data.trips?.length,
      waypointsCount: data.waypoints?.length,
    });

    // ✅ Check for trips[] (correct format)
    if (!data || !data.trips || data.trips.length === 0) {
      console.error("❌ Invalid Trip V2 response:", JSON.stringify(data, null, 2));
      throw new Error(`Goong Trip API error: ${data?.code || "No trips returned"}`);
    }

    const trip = data.trips[0];

    console.log("✅ [Goong Trip V2] Success:", {
      distance: `${(trip.distance / 1000).toFixed(2)} km`,
      duration: `${Math.round(trip.duration / 60)} min`,
      legsCount: trip.legs?.length,
      hasGeometry: !!trip.geometry,
      geometryLength: trip.geometry?.length,
    });

    // ✅ Return full response (includes trips and waypoints)
    return data;
  } catch (error) {
    console.error("❌ [Goong Trip V2] Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      message: error.message,
      url: url.replace(KEY, "API_KEY_HIDDEN"),
    });
    throw error;
  }
}

module.exports = {
  // High-level
  searchNearbyPOIs,
  clearCache,

  // (Optional) export unified wrappers if các service khác cần
  autoComplete,
  placeDetail,
  getPlaceDetail,
  batchGetPlaceDetails,

  // New distance functions
  calculateDistance: haversineKm,
  getDistanceMatrix,
  tripV2, // ✅ Export
};
