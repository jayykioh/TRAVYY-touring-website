// components/GoongMapPanel.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

/**
 * GoongMapPanel — bản đầy đủ có SearchBox
 *
 * Props:
 * - center: {lng,lat} (default Hà Nội)
 * - zoom: number
 * - pois: [{ id|place_id, name, loc:{lng,lat}, ... }]
 * - selectedPoiId: string|null
 * - onPoiClick: (poi) => void
 * - markerVariant: "dot" | "pin" | "emoji"
 * - emoji: string
 * - showSearch: boolean (default true)
 * - rsApiKey: string (REST key cho Autocomplete/Place Detail) — mặc định lấy VITE_GOONG_API_KEY
 * - mapTilesKey: string (MapTiles key cho style) — mặc định lấy VITE_GOONG_MAPTILES_KEY
 */
export default function GoongMapPanel({
  center = { lng: 105.83991, lat: 21.028 },
  zoom = 12,
  pois = [],
  selectedPoiId = null,
  onPoiClick,
  markerVariant = "dot",
  emoji = "📍",
  showSearch = true,
  rsApiKey = import.meta.env.VITE_GOONG_API_KEY,
  mapTilesKey = import.meta.env.VITE_GOONG_MAPTILES_KEY,
}) {
  const mapRef = useRef(null);
  const map = useRef(null);
  const markersRef = useRef(new Map());
  const searchMarkerRef = useRef(null);

  const styleUrl = useMemo(
    () =>
      `https://tiles.goong.io/assets/goong_map_web.json?api_key=${mapTilesKey}`,
    [mapTilesKey]
  );

  const getId = (p) => p?.place_id || p?.id;

  // --- init map ---
  useEffect(() => {
    if (!mapRef.current || map.current) return;

    goongjs.accessToken = mapTilesKey;

    const m = new goongjs.Map({
      container: mapRef.current,
      style: styleUrl,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
      pitchWithRotate: true,
      dragRotate: true,
    });

    m.addControl(new goongjs.NavigationControl({ visualizePitch: true }), "top-right");
    map.current = m;

    return () => {
      // cleanup markers
      markersRef.current.forEach((mrk) => mrk.remove());
      markersRef.current.clear();
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
        searchMarkerRef.current = null;
      }
      m.remove();
      map.current = null;
    };
  }, []);

  // --- smooth center/zoom when props changed ---
  useEffect(() => {
    if (!map.current) return;
    map.current.easeTo({
      center: [center.lng, center.lat],
      zoom,
      duration: 500,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  }, [center.lng, center.lat, zoom]);

  // --- create marker element ---
  const createMarkerEl = (poi) => {
    const el = document.createElement("div");
    el.className = `poi-marker ${markerVariant === "pin" ? "poi-marker--pin" : ""} ${
      markerVariant === "emoji" ? "poi-marker--emoji" : ""
    }`;
    el.dataset.id = getId(poi) ?? "";

    if (markerVariant === "emoji") {
      el.textContent = emoji;
    } else {
      const halo = document.createElement("div");
      halo.className = "poi-marker__halo";
      const ripple = document.createElement("div");
      ripple.className = "poi-marker__ripple";
      const core = document.createElement("div");
      core.className = "poi-marker__dot";
      el.appendChild(halo);
      el.appendChild(ripple);
      el.appendChild(core);
    }

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onPoiClick?.(poi);
    });

    return el;
  };

  // --- mount/unmount markers from pois ---
  useEffect(() => {
    if (!map.current) return;

    const currentIds = new Set(pois.map(getId));
    // remove stale
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // add new
    for (const poi of pois) {
      if (!poi?.loc?.lat || !poi?.loc?.lng) continue;
      const id = getId(poi);
      if (!id || markersRef.current.has(id)) continue;

      const el = createMarkerEl(poi);
      const marker = new goongjs.Marker({ element: el, offset: [0, -16] })
        .setLngLat([poi.loc.lng, poi.loc.lat])
        .addTo(map.current);
      markersRef.current.set(id, marker);
    }
  }, [pois, markerVariant, emoji, onPoiClick]);

  // --- highlight selected poi ---
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (id === selectedPoiId) el.classList.add("poi-marker--selected");
      else el.classList.remove("poi-marker--selected");
    });

    if (selectedPoiId) {
      const sel = pois.find((p) => getId(p) === selectedPoiId);
      if (sel?.loc?.lng && sel?.loc?.lat) {
        map.current.easeTo({
          center: [sel.loc.lng, sel.loc.lat],
          zoom: Math.max(15, map.current.getZoom()),
          duration: 600,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        });
      }
    }
  }, [selectedPoiId, pois]);

  // --- search handling (pin riêng) ---
  const handleSearchPick = ({ lng, lat}) => {
    if (!map.current) return;
    // remove old search marker
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    // create search marker (green)
    const el = document.createElement("div");
    el.className = "poi-marker poi-marker--search";
    const core = document.createElement("div");
    core.className = "poi-marker__dot";
    el.appendChild(core);

    const marker = new goongjs.Marker({ element: el, offset: [0, -16] })
      .setLngLat([lng, lat])
      .addTo(map.current);
    searchMarkerRef.current = marker;

    map.current.easeTo({
      center: [lng, lat],
      zoom: Math.max(14, map.current.getZoom()),
      duration: 500,
    });
  };

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Search overlay */}
      {showSearch && (
        <div className="absolute top-3 left-3 w-[320px] z-20">
          <GoongSearchBox
            apiKey={rsApiKey}
            onSelect={(p) => handleSearchPick(p)}
            placeholder="Tìm địa điểm..."
          />
        </div>
      )}

      {/* Inline CSS for markers (dot style) */}
      <style>{`
        .poi-marker{
          position: relative;
          width: 18px; height: 18px;
          transform: translate(-50%, -100%);
          pointer-events: auto;
          contain: layout paint size;
        }
        .poi-marker__dot{
          width: 18px; height: 18px;
          border-radius: 9999px;
          background: linear-gradient(135deg,#0ea5e9,#2563eb);
          border: 2px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,.18);
        }
        .poi-marker__halo{
          position: absolute; inset: -6px;
          border-radius: 9999px;
          background: rgba(37,99,235,.15);
        }
        .poi-marker__ripple{
          position: absolute; inset: -10px;
          border-radius: 9999px;
          border: 2px solid rgba(37,99,235,.2);
          animation: ripple 1.8s infinite;
        }
        @keyframes ripple{
          0%{ transform: scale(0.6); opacity: .6; }
          100%{ transform: scale(1.6); opacity: 0; }
        }
        .poi-marker--selected .poi-marker__dot{
          outline: 3px solid rgba(59,130,246,.5);
          outline-offset: 2px;
        }
        .poi-marker--emoji{
          font-size: 18px;
          transform: translate(-50%,-100%);
        }
        .poi-marker--search .poi-marker__dot{
          background: linear-gradient(135deg,#22c55e,#16a34a);
        }
      `}</style>
    </div>
  );
}

/* ===========================================
   GoongSearchBox (embedded)
   - Autocomplete (rsapi.goong.io/Place/AutoComplete)
   - Pick -> Place Detail -> emit onSelect({lng,lat,name,place_id})
   =========================================== */
function GoongSearchBox({
  apiBase = "https://rsapi.goong.io",
  apiKey,
  onSelect,
  minChars = 2,
  delayMs = 350,
  className = "",
  placeholder = "Tìm địa điểm...",
}) {
  const [q, setQ] = useState("");
  const [suggests, setSuggests] = useState([]);
  const tRef = useRef(null);
  const boxRef = useRef(null);

  // debounce autocomplete
  useEffect(() => {
    if (!q || q.length < minChars) {
      setSuggests([]);
      return;
    }
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(async () => {
      try {
        const url = `${apiBase}/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(
          q
        )}`;
        const res = await fetch(url);
        const data = await res.json();
        setSuggests(data?.predictions || []);
      } catch (e) {
        console.error("AutoComplete error:", e);
        setSuggests([]);
      }
    }, delayMs);
    return () => {
      if (tRef.current) clearTimeout(tRef.current);
    };
  }, [q, apiBase, apiKey, minChars, delayMs]);

  // click outside to close
  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setSuggests([]);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handlePick = async (sug) => {
    setSuggests([]);
    setQ(sug.description || "");
    try {
      const detailUrl = `${apiBase}/Place/Detail?api_key=${apiKey}&place_id=${sug.place_id}`;
      const res = await fetch(detailUrl);
      const data = await res.json();
      const loc = data?.result?.geometry?.location;
      if (loc?.lng && loc?.lat) {
        onSelect?.({
          place_id: sug.place_id,
          name: data?.result?.name || sug.description,
          lng: loc.lng,
          lat: loc.lat,
        });
      }
    } catch (e) {
      console.error("PlaceDetail error:", e);
    }
  };

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm bg-white/95 backdrop-blur"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {suggests.length > 0 && (
        <div className="absolute z-20 top-full left-0 right-0 bg-white border rounded-lg shadow mt-1 max-h-64 overflow-auto">
          {suggests.map((s) => (
            <button
              key={s.place_id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => handlePick(s)}
            >
              {s.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
