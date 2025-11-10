// services/ai/libs/map4d.js
const axios = require("axios");
const NodeCache = require("node-cache");

const MAP4D_API_KEY = process.env.MAP4D_API_KEY;
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });

const map4dClient = axios.create({
  baseURL: "https://api.map4d.vn/sdk",
  timeout: 10000,
});

/**
 * ✅ NEW: Viewbox Search (best for zone-based search)
 * More reliable than radius-based search
 */
async function searchPOIsByViewbox(centerLat, centerLng, radiusMeters, options = {}) {
  const { query, limit = 10, types = '' } = options;
  
  // Convert radius to viewbox bounds
  const latDelta = radiusMeters / 111000; // ~111km per degree
  const lngDelta = radiusMeters / (111000 * Math.cos(centerLat * Math.PI / 180));
  
  const viewbox = `${centerLat - latDelta},${centerLng - lngDelta},${centerLat + latDelta},${centerLng + lngDelta}`;
  
  const cacheKey = `map4d:viewbox:${viewbox}:${query}:${types}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`   ✅ Cache hit for viewbox search`);
    return cached;
  }

  console.log(`   🔍 Map4D Viewbox Search: "${query}"`);
  console.log(`   📍 Viewbox: ${viewbox}`);

  try {
    const response = await map4dClient.get('/place/viewbox-search', {
      params: {
        key: MAP4D_API_KEY,
        viewbox,
        text: query,
        types,
      },
    });

    const data = response.data;
    console.log(`   📦 Response code: ${data.code}, results: ${data.result?.length || 0}`);

    if (data.code !== 'ok' || !Array.isArray(data.result)) {
      console.warn(`   ⚠️ Map4D returned: ${data.code}`);
      return [];
    }

    const pois = data.result
      .filter(place => place.location?.lat && place.location?.lng)
      .map(place => ({
        id: place.id || place.place_id,
        place_id: place.id || place.place_id,
        name: place.name,
        lat: place.location.lat,
        lng: place.location.lng,
        location: { lat: place.location.lat, lng: place.location.lng },
        address: place.address || '',
        types: place.types || [],
        rating: place.rating ?? null,
        source: 'map4d',
      }))
      .slice(0, limit);

    console.log(`   ✅ Returning ${pois.length} POIs`);
    
    if (pois.length > 0) {
      cache.set(cacheKey, pois);
    }

    return pois;

  } catch (err) {
    console.error(`   ❌ Viewbox search error:`, err.response?.data || err.message);
    return [];
  }
}

/**
 * ✅ Fallback: Nearby Search
 */
async function searchPOIsNearby(lat, lng, radiusMeters, options = {}) {
  const { query, limit = 10, types = '' } = options;
  
  const cacheKey = `map4d:nearby:${lat.toFixed(4)}:${lng.toFixed(4)}:${radiusMeters}:${query}:${types}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`   ✅ Cache hit for nearby search`);
    return cached;
  }

  console.log(`   🔍 Map4D Nearby Search: "${query}"`);
  console.log(`   📍 Location: (${lat}, ${lng}) r=${radiusMeters}m`);

  try {
    const response = await map4dClient.get('/place/nearby-search', {
      params: {
        key: MAP4D_API_KEY,
        location: `${lat},${lng}`,
        radius: radiusMeters,
        text: query,
        types,
      },
    });

    const data = response.data;
    console.log(`   📦 Response code: ${data.code}, results: ${data.result?.length || 0}`);

    if (data.code !== 'ok' || !Array.isArray(data.result)) {
      console.warn(`   ⚠️ Map4D returned: ${data.code}`);
      return [];
    }

    const pois = data.result
      .filter(place => place.location?.lat && place.location?.lng)
      .map(place => ({
        id: place.id || place.place_id,
        place_id: place.id || place.place_id,
        name: place.name,
        lat: place.location.lat,
        lng: place.location.lng,
        location: { lat: place.location.lat, lng: place.location.lng },
        address: place.address || '',
        types: place.types || [],
        rating: place.rating ?? null,
        source: 'map4d',
      }))
      .slice(0, limit);

    console.log(`   ✅ Returning ${pois.length} POIs`);
    
    if (pois.length > 0) {
      cache.set(cacheKey, pois);
    }

    return pois;

  } catch (err) {
    console.error(`   ❌ Nearby search error:`, err.response?.data || err.message);
    return [];
  }
}

/**
 * ✅ Unified POI search (tries viewbox first, then nearby)
 */
async function searchPOIsByText(lat, lng, radiusMeters, options = {}) {
  console.log(`\n🔍 [Map4D] Searching POIs...`);
  
  // Try viewbox first (more reliable)
  let pois = await searchPOIsByViewbox(lat, lng, radiusMeters, options);
  
  // Fallback to nearby search
  if (pois.length === 0) {
    console.log(`   🔄 Falling back to nearby search...`);
    pois = await searchPOIsNearby(lat, lng, radiusMeters, options);
  }
  
  return pois;
}

/**
 * Get place details
 */
async function getPlaceDetails(placeId) {
  const cacheKey = `map4d:detail:${placeId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  console.log(`   🔍 Fetching place details: ${placeId}`);

  try {
    const response = await map4dClient.get(`/place/detail/${placeId}`, {
      params: { key: MAP4D_API_KEY },
    });

    const data = response.data;

    if (data.code !== 'ok' || !data.result) {
      console.warn(`   ⚠️ Detail returned: ${data.code}`);
      return null;
    }

    const place = data.result;
    const details = {
      id: place.id,
      name: place.name,
      address: place.address,
      location: place.location,
      phone: place.phone || null,
      website: place.website || null,
      rating: place.rating || null,
      photos: place.photos || [],
      opening_hours: place.opening_hours || null,
      description: place.description || null,
    };

    cache.set(cacheKey, details, 3600);
    return details;

  } catch (err) {
    console.error(`   ❌ Detail error:`, err.response?.data || err.message);
    return null;
  }
}

/**
 * Autocomplete
 */
async function autocompletePlaces(input, lat, lng) {
  if (!input || input.length < 2) return [];

  console.log(`   🔍 Autocomplete: "${input}"`);

  try {
    const response = await map4dClient.get('/autosuggest', {
      params: {
        key: MAP4D_API_KEY,
        text: input,
        location: `${lat},${lng}`,
      },
    });

    const data = response.data;

    if (data.code !== 'ok' || !Array.isArray(data.result)) {
      return [];
    }

    return data.result.map(place => ({
      id: place.id,
      name: place.name,
      address: place.address,
      location: place.location,
    }));

  } catch (err) {
    console.error(`   ❌ Autocomplete error:`, err.message);
    return [];
  }
}

// Legacy
async function searchNearbyPOIs(lat, lng, radiusMeters, options = {}) {
  const { vibes = [], limit = 20 } = options;
  const { getCategoryByVibes } = require('../../zones/poi-categories');
  const category = getCategoryByVibes(vibes);
  
  return searchPOIsByText(lat, lng, radiusMeters, {
    query: category.query,
    limit,
  });
}

module.exports = {
  searchPOIsByText,
  searchPOIsByViewbox,
  searchPOIsNearby,
  getPlaceDetails,
  autocompletePlaces,
  searchNearbyPOIs,
};
