// components/GoongSearchBox.jsx
import React, { useEffect, useRef, useState } from "react";

export default function GoongSearchBox({
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

  useEffect(() => {
    if (!q || q.length < minChars) {
      setSuggests([]);
      return;
    }
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(async () => {
      try {
        const url = `${apiBase}/Place/AutoComplete?api_key=${apiKey}&input=${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const data = await res.json();
        setSuggests(data?.predictions || []);
      } catch (e) {
        console.error("AutoComplete error:", e);
        setSuggests([]);
      }
    }, delayMs);
    return () => { if (tRef.current) clearTimeout(tRef.current); };
  }, [q, apiBase, apiKey, minChars, delayMs]);

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
        className="w-full border rounded-lg px-3 py-2 text-sm"
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
