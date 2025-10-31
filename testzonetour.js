#!/usr/bin/env node
/**
 * Link Preview (Embedded Data) — NO DB, NO deps
 * Chạy: node link-preview.embedded.test.js
 *
 * Logic test:
 * 1) Nối theo legacy slug:  tour.zones = ['<zoneId slug>']
 * 2) Nối theo title hint (regex → zoneId)
 * 3) Nối theo hình học: locations[].{lat,lng} ∈ zones.geometry (Polygon)
 *
 * Kết quả in ra console (proposed zoneIds theo slug) để bạn kiểm tra nhanh.
 */

/* ----------------- EMBEDDED SAMPLE DATA ----------------- */
// Zones mẫu (lấy gần giống dữ liệu của bạn)
const ZONES = [
  {
    _id: "68f6f058b34c380f4ecf0f4d",
    id: "dn-cu-lao-cham",
    name: "Cù Lao Chàm",
    center: { lat: 15.946334, lng: 108.512439 },
    isActive: true,
    geometry: {
      type: "Polygon",
      // geoJSON: [[ [lng,lat], ... ]]
      coordinates: [[
        [108.512439, 15.973283],
        [108.523165, 15.971232],
        [108.532258, 15.965390],
        [108.538333, 15.956647],
        [108.540467, 15.946334],
        [108.538333, 15.936021],
        [108.532258, 15.927278],
        [108.523165, 15.921436],
        [108.512439, 15.919385],
        [108.501713, 15.921436],
        [108.492620, 15.927278],
        [108.486545, 15.936021],
        [108.484411, 15.946334],
        [108.486545, 15.956647],
        [108.492620, 15.965390],
        [108.501713, 15.971232],
        [108.512439, 15.973283],
      ]]
    }
  },
  {
    _id: "68f6f303b34c380f4ecf0f64",
    id: "hue-lang-co",
    name: "Vịnh Lăng Cô & Đầm Lập An",
    center: { lat: 16.2435, lng: 108.0818 },
    isActive: true,
    // polygon demo đơn giản quanh center để test point-in-polygon
    geometry: {
      type: "Polygon",
      coordinates: [[
        [108.0600, 16.2600],
        [108.1000, 16.2600],
        [108.1000, 16.2300],
        [108.0600, 16.2300],
        [108.0600, 16.2600],
      ]]
    }
  },
  {
    _id: "68f6efe2b34c380f4ecf0e99",
    id: "hue-thien-mu",
    name: "Chùa Thiên Mụ",
    center: { lat: 16.3213, lng: 107.5735 },
    isActive: true,
    geometry: { type: "Polygon", coordinates: [] } // không cần polygon cho test này
  }
];

// Tours mẫu (trộn nhiều trường hợp)
const TOURS = [
  {
    _id: "69f001a1b8a9c3b8a4f1b105",
    title: "Tour Cù Lao Chàm 1 Ngày (Đi từ Đà Nẵng)",
    zones: [],              // legacy slugs trống
    zoneIds: [],            // sẽ đề xuất
    locations: [{           // có tọa độ nằm trong polygon Cù Lao Chàm
      coordinates: { lat: 15.9465, lng: 108.5122 }
    }],
    tags: ["Nature","Relaxation"],
    isHidden: false
  },
  {
    _id: "69f001a1b8a9c3b8a4f1b120",
    title: "Tour Thánh Địa Mỹ Sơn Nửa Ngày (Từ Đà Nẵng)",
    zones: ["qna-my-son"],  // legacy slug KHÁC ví dụ
    zoneIds: [],
    locations: [{           // toạ độ không nằm trong 2 polygon trên
      coordinates: { lat: 15.7730, lng: 108.1230 }
    }],
    tags: ["History","Culture"],
    isHidden: false
  },
  {
    _id: "69f001a1b8a9c3b8a4f1b130",
    title: "Trải nghiệm biển Lăng Cô & Đầm Lập An 1 Ngày",
    zones: [],              // không có legacy
    zoneIds: [],
    locations: [{           // nằm trong polygon Lăng Cô (demo)
      coordinates: { lat: 16.2450, lng: 108.0800 }
    }],
    tags: ["Nature","Beach"],
    isHidden: false
  },
  {
    _id: "69f001a1b8a9c3b8a4f1b140",
    title: "City Tour Huế: Chùa Thiên Mụ - Đại Nội",
    zones: ["hue-thien-mu"],// legacy slug đúng
    zoneIds: [],
    locations: [],          // không có tọa độ
    tags: ["Culture","History"],
    isHidden: false
  },
  {
    _id: "69f001a1b8a9c3b8a4f1b150",
    title: "Lặn san hô ở Cù Lao Chàm (Snorkeling)",
    zones: [],              // không có legacy
    zoneIds: [],
    locations: [],          // không có toạ độ → thử nối theo title
    tags: ["Nature"],
    isHidden: false
  },
];

// Title → zoneId gợi ý (regex, không phân biệt hoa thường)
const TITLE_HINTS = {
  "cù lao chàm|cu lao cham": "dn-cu-lao-cham",
  "lăng cô|lap an|lập an|lang co": "hue-lang-co",
  "thiên mụ|thien mu": "hue-thien-mu",
  "mỹ sơn|my son": "qna-my-son"
};
/* ------------------------------------------------------ */


/* ---------------- GEOMETRY UTILS (no deps) ------------ */
function normalizeRing(ring = []) {
  return ring.map(([lng, lat]) => ({ x: lng, y: lat }));
}
function pointInRing(point, ring) {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].x, yi = ring[i].y;
    const xj = ring[j].x, yj = ring[j].y;
    const intersect =
      (yi > y) !== (yj > y) &&
      x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function isPointInPolygon(point, polygonRings) {
  if (!polygonRings || polygonRings.length === 0) return false;
  if (!pointInRing(point, normalizeRing(polygonRings[0]))) return false; // exterior
  for (let i = 1; i < polygonRings.length; i++) {
    if (pointInRing(point, normalizeRing(polygonRings[i]))) return false;  // hole
  }
  return true;
}
/* ------------------------------------------------------ */

function indexZones(zones) {
  const slugToZone = new Map();
  const idToPoly = new Map();
  for (const z of zones) {
    if (z.id) slugToZone.set(z.id, z);
    if (z.geometry?.type === "Polygon") {
      idToPoly.set(z.id, z.geometry.coordinates);
    }
  }
  return { slugToZone, idToPoly };
}

function firstCoord(locs = []) {
  for (const loc of locs) {
    const lat = loc?.coordinates?.lat;
    const lng = loc?.coordinates?.lng;
    if (typeof lat === "number" && typeof lng === "number") {
      return { lat, lng };
    }
  }
  return null;
}

function proposeZonesForTour(tour, zonesIdx) {
  const { slugToZone, idToPoly } = zonesIdx;
  const proposed = new Set();

  // 1) Legacy slugs
  if (Array.isArray(tour.zones)) {
    for (const slug of tour.zones) {
      const z = slugToZone.get(String(slug).trim());
      if (z) proposed.add(z.id);
    }
  }

  // 2) Title hints
  const title = (tour.title || "").toLowerCase();
  for (const pattern in TITLE_HINTS) {
    const re = new RegExp(pattern, "i");
    if (re.test(title)) {
      const zid = TITLE_HINTS[pattern];
      if (slugToZone.get(zid)) proposed.add(zid);
    }
  }

  // 3) Geometry check (nếu có toạ độ)
  const coord = firstCoord(tour.locations);
  if (coord) {
    const p = { x: coord.lng, y: coord.lat };
    for (const z of ZONES) {
      const poly = idToPoly.get(z.id);
      if (!poly) continue;
      try {
        if (isPointInPolygon(p, poly)) {
          proposed.add(z.id);
        }
      } catch { /* ignore bad polygon */ }
    }
  }

  return Array.from(proposed);
}

/* ------------------------- MAIN ------------------------ */
(function main() {
  console.log("🔎 Running Link Preview (Embedded)...");
  const zonesIdx = indexZones(ZONES);

  const rows = TOURS.map(t => {
    const proposed = proposeZonesForTour(t, zonesIdx);
    return {
      tourId: t._id,
      title: t.title,
      legacyZones: Array.isArray(t.zones) ? t.zones : [],
      hasCoord: !!firstCoord(t.locations),
      proposedZoneIds: proposed, // theo slug
    };
  });

  // In bảng gọn
  console.log("—".repeat(80));
  for (const r of rows) {
    console.log(`• ${r.title}`);
    console.log(`  - legacy: [${r.legacyZones.join(", ")}]  | coord: ${r.hasCoord ? "yes" : "no"}`);
    console.log(`  - proposed: [${r.proposedZoneIds.join(", ")}]`);
  }
  console.log("—".repeat(80));

  // Tổng kết nhanh
  const total = rows.length;
  const withAny = rows.filter(r => r.proposedZoneIds.length > 0).length;
  console.log(`📊 Tours: ${total}, proposed > 0: ${withAny}, empty: ${total - withAny}`);
  console.log("✅ Done. (No DB writes)");
})();
