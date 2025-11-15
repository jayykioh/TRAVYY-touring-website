const router = require("express").Router();
const Location = require("../models/agency/Location");
const https = require("https");

// Fallback API endpoints
const OPEN_BASE = "https://provinces.open-api.vn/api";
const OPEN_V2 = `${OPEN_BASE}/v2`;
const FALLBACK_API = "https://vapi.vnappmob.com/api/province"; // Backup API

// SSL agent to handle certificate issues (for development)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Allow self-signed certificates
});

async function fetchJSON(url, { timeoutMs = 15000, useFallback = false } = {}) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeoutMs);
  
  try {
    console.log(`[fetchJSON] Fetching: ${url}`);
    const r = await fetch(url, {
      signal: ac.signal,
      headers: { 
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      // @ts-ignore - Node.js fetch supports agent
      agent: url.startsWith("https:") ? httpsAgent : undefined,
    });
    
    console.log(`[fetchJSON] Response status: ${r.status}`);
    if (!r.ok) throw new Error(`Upstream ${r.status} ${r.statusText}`);
    
    const data = await r.json();
    console.log(`[fetchJSON] Success, data length: ${Array.isArray(data) ? data.length : 'object'}`);
    return data;
  } catch (error) {
    console.error(`[fetchJSON] Error: ${error.message}`);
    throw error;
  } finally {
    clearTimeout(id);
  }
}

const isNum = (s) => /^\d+$/.test(String(s));

// (optional) in-memory cache 10 phút
const cache = new Map(); // key -> { data, expireAt }
const TTL_MS = 10 * 60 * 1000;
const getCache = (k) => {
  const v = cache.get(k);
  if (!v) return null;
  if (Date.now() > v.expireAt) {
    cache.delete(k);
    return null;
  }
  return v.data;
};
const setCache = (k, data, ttl = TTL_MS) =>
  cache.set(k, { data, expireAt: Date.now() + ttl });

/** GET /api/location/provinces -> [{ id, name }] */
router.get("/provinces", async (_req, res) => {
  try {
    const key = "provinces";
    const cached = getCache(key);
    if (cached) {
      console.log("[provinces] Serving from cache");
      res.set("Cache-Control", "no-store");
      return res.json(cached);
    }

    console.log("[provinces] Cache miss, fetching from API...");
    let json;
    let out = [];
    
    // Try primary API first
    try {
      json = await fetchJSON(`${OPEN_V2}/p/`);
      out = Array.isArray(json)
        ? json.map((p) => ({ id: String(p.code), name: p.name }))
        : [];
      console.log(`[provinces] Primary API returned ${out.length} provinces`);
    } catch (primaryError) {
      console.warn(`[provinces] Primary API failed: ${primaryError.message}, trying fallback...`);
      
      // Try fallback API
      try {
        const fallbackJson = await fetchJSON(FALLBACK_API);
        out = Array.isArray(fallbackJson?.results)
          ? fallbackJson.results.map((p) => ({ 
              id: String(p.province_id), 
              name: p.province_name 
            }))
          : [];
        console.log(`[provinces] Fallback API returned ${out.length} provinces`);
      } catch (fallbackError) {
        console.error(`[provinces] Fallback API also failed: ${fallbackError.message}`);
        throw new Error(`Both APIs failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
      }
    }
    
    if (!out.length) throw new Error("Empty provinces list from all sources");

    setCache(key, out);
    console.log(`[provinces] Successfully cached ${out.length} provinces`);
    res.set("Cache-Control", "no-store");
    res.json(out);
  } catch (e) {
    console.error("[provinces] Final error:", e);
    res.status(502).json({ 
      error: "PROVINCES_FAILED", 
      message: String(e.message),
      hint: "External province API is unavailable. Please try again later."
    });
  }
});

/** GET /api/location/wards?province_id=79 -> [{ id, name }] */
router.get("/wards", async (req, res) => {
  const { province_id } = req.query;
  if (!isNum(province_id)) {
    return res.status(400).json({
      error: "INVALID_PROVINCE_ID",
      message: "province_id phải là số",
    });
  }
  try {
    const key = `wards:${province_id}`;
    const cached = getCache(key);
    if (cached) {
      res.set("Cache-Control", "no-store");
      return res.json(cached);
    }

    const json = await fetchJSON(`${OPEN_V2}/p/${province_id}?depth=2`);

    // v2 mới: có trực tiếp province.wards; fallback districts[].wards nếu cần
    let wards = Array.isArray(json?.wards)
      ? json.wards.map((w) => ({ id: String(w.code), name: w.name }))
      : [];

    if (!wards.length && Array.isArray(json?.districts)) {
      wards = json.districts.flatMap((d) =>
        Array.isArray(d.wards)
          ? d.wards.map((w) => ({ id: String(w.code), name: w.name }))
          : []
      );
    }

    setCache(key, wards);
    res.set("Cache-Control", "no-store");
    res.json(wards);
  } catch (e) {
    const msg =
      e.name === "AbortError" ? "Upstream timeout" : String(e.message);
    console.error("wards error:", msg);
    res.status(502).json({ error: "WARDS_FAILED", message: msg });
  }
});

router.get("/", async (req, res) => {
  const search = req.query.search || "";
  const results = await Location.find({
    name: { $regex: search, $options: "i" },
  })
    .limit(10)
    .select("name region");
  res.json(results);
});
module.exports = router;
