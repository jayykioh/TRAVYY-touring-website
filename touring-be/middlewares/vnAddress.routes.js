const router = require("express").Router();

const OPEN_BASE = "https://provinces.open-api.vn/api";
const OPEN_V2   = `${OPEN_BASE}/v2`; // dùng bản v2 mới

async function fetchJSON(url, { timeoutMs = 8000 } = {}) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ac.signal, headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error(`Upstream ${r.status} ${r.statusText}`);
    return await r.json();
  } finally {
    clearTimeout(id);
  }
}

const isNum = (s) => /^\d+$/.test(String(s));

/** Provinces (v2): GET /v2/p/ -> [{code, name, ...}] */
router.get("/provinces", async (_req, res) => {
  try {
    const json = await fetchJSON(`${OPEN_V2}/p/`);
    const out = Array.isArray(json)
      ? json.map(p => ({ id: String(p.code), name: p.name }))
      : [];
    if (!out.length) throw new Error("Empty provinces");
    res.set("Cache-Control", "no-store");
    res.json(out);
  } catch (e) {
    console.error("provinces error:", e);
    res.status(502).json({ error: "PROVINCES_FAILED", message: String(e.message) });
  }
});

router.get("/wards", async (req, res) => {
  const { province_id } = req.query;
  if (!isNum(province_id)) {
    return res.status(400).json({ error: "INVALID_PROVINCE_ID", message: "province_id phải là số" });
  }

  try {
    // v2 mới: depth=2 đã có wards trực tiếp dưới province
    const json = await fetchJSON(`${OPEN_V2}/p/${province_id}?depth=2`);

    // 1) Ưu tiên cấu trúc mới: province.wards = [...]
    let wards = Array.isArray(json?.wards)
      ? json.wards.map((w) => ({
          id: String(w.code),
          name: w.name,
          // không còn district ở UI → không bắt buộc trả về
        }))
      : [];

    // 2) Fallback cấu trúc cũ: province.districts[].wards[]
    if (wards.length === 0 && Array.isArray(json?.districts)) {
      wards = json.districts.flatMap((d) =>
        Array.isArray(d.wards)
          ? d.wards.map((w) => ({
              id: String(w.code),
              name: w.name,
              // giữ lại districtName nếu muốn hiển thị cho dễ chọn
              // districtName: d.name,
            }))
          : []
      );
    }

    // 3) Đừng trả 404 cho rỗng → để FE tự xử lý
    res.set("Cache-Control", "no-store");
    return res.json(wards);
  } catch (e) {
    const msg = e.name === "AbortError" ? "Upstream timeout" : String(e.message);
    console.error("wards error:", msg);
    return res.status(502).json({ error: "WARDS_FAILED", message: msg });
  }
});


module.exports = router;
