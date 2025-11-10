// components/POILoading.jsx
import React from "react";

export default function POILoading({ count = 6 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-white/30 bg-white/70 p-3"
        >
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-md bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 bg-slate-200 rounded" />
              <div className="h-2.5 w-1/2 bg-slate-200 rounded" />
            </div>
            <div className="h-3 w-8 bg-slate-200 rounded" />
          </div>
          <div className="mt-3 h-7 rounded-md bg-slate-100" />
        </div>
      ))}
    </div>
  );
}