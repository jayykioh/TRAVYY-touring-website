/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import logger from "../utils/logger";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * MapLibrePanel — phiên bản ổn định, tối ưu hiệu năng
 * Props:
 * - center {lng,lat}
 * - zoom
 * - pois: [{id|place_id, name, order, loc:{lng,lat}}]
 * - routePolyline: string | coords[][] | GeoJSON
 * - routeDistanceText: string
 * - routeDurationText: string
 * - onError?: (err)=>void
 */
export default function MapLibrePanel({
  center = { lng: 105.83991, lat: 21.028 },
  zoom = 13,
  pois = [],
  routePolyline = null,
  routeDistanceText = "",
  routeDurationText = "",
  onError,
}) {
  const mapRef = useRef(null);
  const map = useRef(null);
  const markersRef = useRef(new Map());

  const GOONG_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY;
  const styleUrl = `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_KEY}`;

  // --- Decode polyline auto precision ---
  const decodePolyline = (encoded) => {
    if (!encoded) return [];
    const tryDecode = (factor) => {
      let index = 0, lat = 0, lng = 0, coords = [];
      while (index < encoded.length) {
        let b, shift = 0, result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        const dlat = (result & 1) ? ~(result >> 1) : (result >> 1); lat += dlat;
        shift = 0; result = 0;
        do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
        const dlng = (result & 1) ? ~(result >> 1) : (result >> 1); lng += dlng;
        coords.push([lng / factor, lat / factor]);
      }
      return coords;
    };
    const coords5 = tryDecode(1e5);
    return coords5[0] && Math.abs(coords5[0][0]) <= 180 ? coords5 : tryDecode(1e6);
  };

  const normalizeRoute = (route) => {
    if (!route) return null;
    if (typeof route === "string") {
      const coords = decodePolyline(route);
      if (!coords.length) return null;
      return { type: "Feature", geometry: { type: "LineString", coordinates: coords } };
    }
    if (Array.isArray(route)) {
      return { type: "Feature", geometry: { type: "LineString", coordinates: route } };
    }
    return route;
  };

  // --- Add/Update route line ---
  const applyRoute = (m) => {
    if (!routePolyline) return;
    const srcId = "route-src";
    const layerId = "route-layer";

    if (m.getLayer(layerId)) m.removeLayer(layerId);
    if (m.getSource(srcId)) m.removeSource(srcId);

    const feature = normalizeRoute(routePolyline);
    if (!feature) return;

    const coords = feature.geometry.coordinates.filter(
      (c) => Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90
    );
    if (!coords.length) return;

    m.addSource(srcId, { type: "geojson", data: feature });
    m.addLayer({
      id: layerId,
      type: "line",
      source: srcId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#2563eb", "line-width": 5, "line-opacity": 0.9 },
    });

    const bounds = coords.reduce(
      (b, c) => b.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    m.fitBounds(bounds, { padding: 40, duration: 800 });

    // Popup giữa đường
    const mid = coords[Math.floor(coords.length / 2)];
    if (routeDistanceText || routeDurationText) {
      new maplibregl.Popup({ closeButton: false, offset: 12 })
        .setLngLat(mid)
        .setHTML(
          `<div style="font-size:12px;line-height:1.2">
             📏 ${routeDistanceText}<br/>⏱️ ${routeDurationText}
           </div>`
        )
        .addTo(m);
    }
  };

  // --- Init Map ---
  useEffect(() => {
    if (!mapRef.current || map.current) return;
    try {
      map.current = new maplibregl.Map({
        container: mapRef.current,
        style: styleUrl,
        center: [center.lng, center.lat],
        zoom,
      });

      map.current.on("styleimagemissing", (e) => {
        try {
          if (!map.current.hasImage(e.id)) {
            map.current.addImage(e.id, new ImageData(1, 1));
          }
        } catch (e) {
          logger.debug(e);
        }
      });

      map.current.addControl(new maplibregl.NavigationControl(), "top-right");

      map.current.on("load", () => applyRoute(map.current));
      map.current.on("styledata", () => {
        if (map.current.isStyleLoaded()) applyRoute(map.current);
      });
    } catch (err) {
      logger.error("Map init error:", err);
      onError?.(err);
    }

    return () => {
      if (map.current) {
        markersRef.current.forEach((m) => m.remove());
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // --- Update routePolyline khi props đổi ---
  useEffect(() => {
    if (!map.current) return;
    if (map.current.isStyleLoaded()) applyRoute(map.current);
    else map.current.once("load", () => applyRoute(map.current));
  }, [routePolyline]);

  // --- Markers ---
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    // Clear markers cũ
    markersRef.current.forEach((mrk) => mrk.remove());
    markersRef.current.clear();

    pois.forEach((p) => {
      if (!p?.loc?.lat || !p?.loc?.lng) return;
      const el = document.createElement("div");
      el.className = "marker";
      el.textContent = p.order ?? "";
      new maplibregl.Marker({ element: el, offset: [0, -16] })
        .setLngLat([p.loc.lng, p.loc.lat])
        .addTo(m);
      markersRef.current.set(p.id || p.place_id, el);
    });
  }, [pois]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      <style>{`
        .marker {
          /* khung cơ bản */
          width: 30px;
          height: 30px;
          border-radius: 9999px;

          /* nền & viền */
          background: #2563eb;
          background-image: linear-gradient(135deg, #0ea5e9, #2563eb);
          border: 2px solid #fff;

          /* số thứ tự */
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          display: flex;
          align-items: center;
          justify-content: center;
          text-shadow: 0 1px 1px rgba(0,0,0,0.35);

          /* vị trí neo ở đáy */
          transform: translate(-50%, -100%);

          /* hiệu năng & tương tác */
          user-select: none;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          contain: layout paint size;
          pointer-events: none; /* không chặn pan/zoom */
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
        }

        /* vòng trong subtle để marker nổi khối hơn */
        .marker::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 9999px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  );
}
