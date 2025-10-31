/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

/**
 * Props:
 * - center {lng,lat}
 * - zoom number
 * - pois: [{ id|place_id, loc/location|lng/lat, name, ... }]
 * - selectedPoiId
 * - onPoiClick(poi)
 * - markerVariant: "dot" | "pin" | "emoji"
 * - emoji: string
 * - zones: [{ id, name, geometry: {type:"Polygon", coordinates:[ [ [lng,lat], ... ] ]}}]
 */
export default function GoongMapPanel({
  center = { lng: 105.83991, lat: 21.028 },
  zoom = 12,
  pois = [],
  selectedPoiId = null,
  onPoiClick,
  markerVariant = "dot",
  emoji = "📍",
  zones = [], // ✅ thêm prop zones
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef(new Map());

  // Helper: lấy tọa độ POI
  const getLngLat = (p) => {
    const lng =
      p?.loc?.lng ||
      p?.location?.lng ||
      p?.lng ||
      (p?.geometry && p.geometry.location?.lng);
    const lat =
      p?.loc?.lat ||
      p?.location?.lat ||
      p?.lat ||
      (p?.geometry && p.geometry.location?.lat);
    return typeof lng === "number" && typeof lat === "number"
      ? [lng, lat]
      : null;
  };

  // Fix lỗi Babel ?? + ||
  const getId = (p) => {
    const loc = getLngLat(p);
    return p?.place_id || p?.id || (loc ? loc.join(",") : undefined);
  };

  // ===== 1️⃣ INIT MAP =====
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const mapTilesKey = import.meta.env.VITE_GOONG_MAPTILES_KEY;
    goongjs.accessToken = mapTilesKey;

    const map = new goongjs.Map({
      container: mapRef.current,
      style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${mapTilesKey}`,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
      pitchWithRotate: true,
      dragRotate: true,
    });

    map.addControl(
      new goongjs.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    mapInstance.current = map;

    // click chọn POI gần nhất
    const handleMapClick = (e) => {
      if (!onPoiClick || !pois?.length) return;
      const pt = e.point;
      let best = null;
      let bestDist = 1e9;

      for (const p of pois) {
        const lngLat = getLngLat(p);
        if (!lngLat) continue;
        const screen = map.project(lngLat);
        const dx = screen.x - pt.x;
        const dy = screen.y - pt.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist) {
          bestDist = d2;
          best = p;
        }
      }

      const threshold = 24;
      if (best && Math.sqrt(bestDist) <= threshold) {
        onPoiClick(best);
      }
    };
    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // ===== 2️⃣ SMOOTH CENTER / ZOOM =====
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.easeTo({
      center: [center.lng, center.lat],
      zoom,
      duration: 500,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  }, [center.lng, center.lat, zoom]);

  // ===== 3️⃣ MARKERS =====
  const createMarkerEl = (poi) => {
    const el = document.createElement("div");
    el.className = `poi-marker ${
      markerVariant === "pin" ? "poi-marker--pin" : ""
    } ${markerVariant === "emoji" ? "poi-marker--emoji" : ""}`;
    el.dataset.id = getId(poi) || "";

    if (markerVariant === "emoji") {
      el.textContent = emoji;
    } else {
      const core = document.createElement("div");
      core.className = "poi-marker__dot";
      el.appendChild(core);
    }
    return el;
  };

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const currentIds = new Set(pois.map(getId).filter(Boolean));

    // remove stale
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // add new
    for (const poi of pois) {
      const id = getId(poi);
      if (!id || markersRef.current.has(id)) continue;

      const pair = getLngLat(poi);
      if (!pair) continue;

      const el = createMarkerEl(poi);
      const marker = new goongjs.Marker({ element: el, offset: [0, -16] })
        .setLngLat(pair)
        .addTo(map);
      markersRef.current.set(id, marker);
    }
  }, [pois, markerVariant, emoji]);

  // ===== 4️⃣ HIGHLIGHT SELECTED MARKER =====
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (id === selectedPoiId) el.classList.add("poi-marker--selected");
      else el.classList.remove("poi-marker--selected");
    });

    if (selectedPoiId) {
      const sel = pois.find((p) => getId(p) === selectedPoiId);
      const pair = sel ? getLngLat(sel) : null;
      if (pair) {
        const targetZoom = Math.max(15, map.getZoom());
        map.easeTo({
          center: pair,
          zoom: targetZoom,
          duration: 600,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        });
      }
    }
  }, [selectedPoiId, pois]);

  // ===== 5️⃣ ADD POLYGON (ZONES) - STABLE VERSION =====
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (!zones || zones.length === 0) return;

    const SRC = "zones-src";
    const FILL = "zones-fill";
    const OUT = "zones-outline";

    const applyZones = () => {
      try {
        if (map.getLayer(OUT)) map.removeLayer(OUT);
        if (map.getLayer(FILL)) map.removeLayer(FILL);
        if (map.getSource(SRC)) map.removeSource(SRC);

        const features = zones
          .filter(
            (z) =>
              z?.geometry?.type === "Polygon" &&
              Array.isArray(z.geometry.coordinates)
          )
          .map((z) => ({
            type: "Feature",
            properties: { id: z.id, name: z.name },
            geometry: z.geometry,
          }));

        if (!features.length) return;

        map.addSource(SRC, {
          type: "geojson",
          data: { type: "FeatureCollection", features },
        });

        map.addLayer({
          id: FILL,
          type: "fill",
          source: SRC,
          paint: {
            "fill-color": "#00AEEF",
            "fill-opacity": 0.25,
            "fill-outline-color": "#0077BE",
          },
        });

        map.addLayer({
          id: OUT,
          type: "line",
          source: SRC,
          paint: {
            "line-color": "#0077BE",
            "line-width": 2,
            "line-dasharray": [4, 3],
          },
        });
      } catch (err) {
        console.warn("Polygon render failed:", err);
      }
    };

    const ensureApply = () => {
      if (!map.isStyleLoaded()) map.once("load", applyZones);
      else applyZones();
    };

    ensureApply();

    const handleStyle = () => {
      if (map.isStyleLoaded()) applyZones();
    };
    map.on("styledata", handleStyle);

    return () => {
      map.off("styledata", handleStyle);
    };
  }, [zones]);

  // ===== RETURN MAP UI =====
  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <div ref={mapRef} className="w-full h-full" />
      <style>{`
        .poi-marker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -100%);
          user-select: none;
          pointer-events: none;
          contain: layout paint size;
        }
        .poi-marker--emoji {
          font-size: 18px;
        }
        .poi-marker__dot {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #2563eb;
          background-image: linear-gradient(135deg, #0ea5e9, #2563eb);
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
        }
        .poi-marker--pin .poi-marker__dot {
          width: 22px;
          height: 22px;
          border-radius: 11px 11px 11px 0;
          transform: rotate(45deg);
        }
        .poi-marker--selected .poi-marker__dot {
          box-shadow: 0 0 0 2px #06b6d4, 0 2px 6px rgba(0,0,0,0.18);
        }
      `}</style>
    </div>
  );
}
