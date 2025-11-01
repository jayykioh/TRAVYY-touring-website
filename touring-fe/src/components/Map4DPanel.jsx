/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useEffect, useMemo, useState, memo } from "react";
import { MFMap, MFMarker, MFPolygon } from "react-map4d-map";

/**
 * Props:
 *  - center, zoom
 *  - pois: [{ id|place_id, name, address, location:{lat,lng} | lat,lng, ... }]
 *  - selectedPoiId: string | null
 *  - onPoiClick(poi)
 *  - polygon: [ [lat,lng], ... ]
 */
function Map4DPanel({
  center = { lat: 21.028, lng: 105.83991 },
  zoom = 13,
  pois = [],
  selectedPoiId = null,
  onPoiClick,
  polygon = null,
  fillColor = "#4CAF50",
  fillOpacity = 0.25,
  strokeColor = "#2E7D32",
}) {
  const accessKey = import.meta.env.VITE_MAP4D_API_KEY;

  // ========= View state (để fly/zoom) =========
  const [viewCenter, setViewCenter] = useState(center);
  const [viewZoom, setViewZoom] = useState(zoom);
  useEffect(() => setViewCenter(center), [center]);
  useEffect(() => setViewZoom(zoom), [zoom]);

  // ========= Polygon normalize =========
  const polygonPaths = useMemo(() => {
    if (!Array.isArray(polygon) || polygon.length < 3) return null;
    const paths = polygon
      .map(([lat, lng]) => ({ lat, lng }))
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
    return paths.length >= 3 ? [paths] : null;
  }, [polygon]);

  // ========= Map id -> full poi =========
  const fullById = useMemo(() => {
    const m = new Map();
    pois.forEach((p) => {
      const id = p.place_id || p.id;
      if (id) m.set(id, p);
    });
    return m;
  }, [pois]);

  // ========= Markers (tối giản) =========
  const markers = useMemo(() => {
    return pois
      .map((p) => {
        const lat = p?.lat ?? p?.location?.lat;
        const lng = p?.lng ?? p?.location?.lng;
        if (typeof lat !== "number" || typeof lng !== "number") return null;
        return {
          id: p.place_id || p.id,
          name: p.name,
          address: p.address,
          lat,
          lng,
        };
      })
      .filter(Boolean);
  }, [pois]);

  // ========= Detail cache + active =========
  const [detailCache, setDetailCache] = useState(() => new Map());
  const [activeId, setActiveId] = useState(null);

  // ========= Utils =========
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  // HTML string cho InfoWindow (đẹp + an toàn)
  function renderInfoHTML(marker) {
    const d = detailCache.get(marker.id) || null;
    const name = esc(d?.name || marker.name || "Địa điểm");
    const addr = esc(d?.address || marker.address || "");
    const rating =
      typeof d?.rating === "number" ? `${d.rating.toFixed(1)} ⭐` : "";
    const phone = d?.phone ? esc(d.phone) : "";
    const website = d?.website ? esc(d.website) : "";
    const openNow =
      d?.opening_hours && typeof d.opening_hours.open_now === "boolean"
        ? d.opening_hours.open_now
        : null;

    return `
      <div style="min-width:260px;max-width:320px;padding:12px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.4;">
        <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:#0f172a;">
          ${name}
        </div>

        ${
          addr
            ? `<div style="font-size:13px;color:#64748b;margin-bottom:6px;">📍 ${addr}</div>`
            : ""
        }

        <div style="display:flex;gap:12px;margin-bottom:6px;font-size:13px;">
          ${rating ? `<div style="color:#f59e0b;font-weight:600;">${rating}</div>` : ""}
          ${
            openNow === true
              ? `<div style="color:#16a34a;font-weight:600;">🟢 Đang mở</div>`
              : openNow === false
              ? `<div style="color:#dc2626;font-weight:600;">🔴 Đã đóng</div>`
              : ""
          }
        </div>

        ${
          phone || website
            ? `<div style="font-size:12px;color:#475569;border-top:1px solid #e2e8f0;padding-top:8px;margin-top:8px;">
                ${
                  phone
                    ? `<div style="margin-bottom:4px;">📞 <a href="tel:${phone}" style="color:#0ea5e9;text-decoration:none;">${phone}</a></div>`
                    : ""
                }
                ${
                  website
                    ? `🌐 <a href="${website}" target="_blank" rel="noreferrer" style="color:#0ea5e9;text-decoration:underline;">Xem website</a>`
                    : ""
                }
              </div>`
            : ""
        }

        ${
          !d
            ? `<div style="font-size:12px;color:#94a3b8;font-style:italic;margin-top:8px;">Đang tải thông tin...</div>`
            : ""
        }
      </div>
    `;
  }

  // Load detail từ backend proxy
  async function loadPlaceDetail(placeId) {
    if (!placeId) return null;
    if (detailCache.has(placeId)) return detailCache.get(placeId);

    try {
      const res = await fetch(`/api/zones/poi/${encodeURIComponent(placeId)}/details`);
      if (!res.ok) return null;
      const json = await res.json();
      if (json?.ok && json?.place) {
        const enriched = { ...json.place, __ts: Date.now() }; // __ts giúp đổi key
        setDetailCache((prev) => {
          const next = new Map(prev);
          next.set(placeId, enriched);
          return next;
        });
        return enriched;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  // Khi chọn từ LIST → fly + zoom + mở popup + prefetch
  useEffect(() => {
    if (!selectedPoiId) return;
    const poi = fullById.get(selectedPoiId);
    if (!poi) return;
    const lat = poi?.lat ?? poi?.location?.lat;
    const lng = poi?.lng ?? poi?.location?.lng;
    if (typeof lat !== "number" || typeof lng !== "number") return;

    setViewCenter({ lat, lng });
    setViewZoom((z) => (z < 16 ? 16 : z));
    setActiveId(selectedPoiId);
    loadPlaceDetail(selectedPoiId);
  }, [selectedPoiId, fullById]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: 420 }}>
      <MFMap
        accessKey={accessKey}
        version="2.4"
        options={{ center: viewCenter, zoom: viewZoom, controls: true }}
      >
        {polygonPaths && (
          <MFPolygon
            paths={polygonPaths}
            fillColor={fillColor}
            fillOpacity={fillOpacity}
            strokeColor={strokeColor}
            strokeWidth={2}
            zIndex={0}
            userInteractionEnabled={false}
            draggable={false}
            visible
          />
        )}

        {markers.map((m) => {
          const hasDetail = detailCache.has(m.id);
          const isSelected = m.id === activeId;

          return (
            <MFMarker
              // key động: khi detail về → key đổi → info window refresh
              key={`${m.id}-${hasDetail ? "1" : "0"}`}
              position={{ lat: m.lat, lng: m.lng }}
              title={m.name || ""}
              snippet={m.address || ""}
              showInfoWindow={!!isSelected}
              zIndex={isSelected ? 20 : 10}
              onClick={async () => {
                setActiveId(m.id);
                onPoiClick?.(fullById.get(m.id) || m);
                if (!hasDetail) await loadPlaceDetail(m.id);
              }}
              // ⚠️ Map4D SDK cần HTML string
              infoContents={renderInfoHTML(m)}
              anchor={[0.5, 1]}
            />
          );
        })}
      </MFMap>

      {import.meta.env.DEV && (
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded z-50 max-w-xs">
          <div>Polygon: {polygonPaths ? polygonPaths[0].length : 0} pts</div>
          <div>Markers: {markers.length}</div>
          <div>
            Center: {viewCenter.lat.toFixed(4)}, {viewCenter.lng.toFixed(4)} | z {viewZoom}
          </div>
          <div>ActiveId: {activeId || "-"}</div>
          <div>Cached: {detailCache.size} places</div>
        </div>
      )}
    </div>
  );
}

export default memo(Map4DPanel);
