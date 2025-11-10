import React from "react";
import POICard from "./POICard";

export default function POIGrid({
  pois = [],
  selectedId,
  onSelect,
  onViewOnMap,
  dense = false,
  emptyText = "Không có địa điểm phù hợp.",
}) {
  if (!pois.length) {
    return (
      <div className="text-center text-slate-500 py-8">{emptyText}</div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pois.map((poi) => (
        <POICard
          key={poi.id}
          poi={poi}
          selected={selectedId === poi.id}
          dense={dense}
          onSelect={() => onSelect?.(poi)}
          onViewOnMap={() => onViewOnMap?.(poi)}
        />
      ))}
    </div>
  );
}
