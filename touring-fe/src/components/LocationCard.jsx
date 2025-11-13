// src/components/LocationCard.jsx
import React from "react";
import { MapPin } from "lucide-react";

export default function LocationCard({
  lat,
  lng,
  title = "Địa điểm",
  className = "",
}) {
  const hasCoord = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <div
      className={`rounded-2xl overflow-hidden backdrop-blur-xl bg-white/60 border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {hasCoord && (
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-full border border-black/10 bg-black/5 hover:bg-black/10 text-gray-800"
          >
            Xem trên Google Maps
          </a>
        )}
      </div>

      {/* Map body */}
      <div className="relative w-full flex-1 bg-gray-100 min-h-[300px]">
        {hasCoord ? (
          <iframe
            title="Blog location"
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&hl=vi&output=embed`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-600 text-sm">Không có dữ liệu địa điểm</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
