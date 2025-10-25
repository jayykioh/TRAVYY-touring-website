const router = require("express").Router();
const Location = require("../models/agency/Location");
const OPEN_BASE = "https://provinces.open-api.vn/api";
const OPEN_V2 = `${OPEN_BASE}/v2`;

async function fetchJSON(url, { timeoutMs = 8000 } = {}) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      signal: ac.signal,
      headers: { Accept: "application/json" },
    });
    if (!r.ok) throw new Error(`Upstream ${r.status} ${r.statusText}`);
    return await r.json();
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
      res.set("Cache-Control", "no-store");
      return res.json(cached);
    }

    const json = await fetchJSON(`${OPEN_V2}/p/`);
    const out = Array.isArray(json)
      ? json.map((p) => ({ id: String(p.code), name: p.name }))
      : [];
    if (!out.length) throw new Error("Empty provinces");

    setCache(key, out);
    res.set("Cache-Control", "no-store");
    res.json(out);
  } catch (e) {
    console.error("provinces error:", e);
    res
      .status(502)
      .json({ error: "PROVINCES_FAILED", message: String(e.message) });
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
