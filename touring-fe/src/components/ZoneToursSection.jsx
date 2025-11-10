/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { useItinerary } from "../hooks/useIntinerary";
import TourDetailDialog from "./TourDetailDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BadgeDollarSign, Plus, Check } from "lucide-react";
import { toast } from "sonner";



function MiniTourCard({ tour, added, onAdd, onView }) {
  return (
    <div className="w-full rounded-lg border bg-white hover:bg-slate-50 transition p-3">
      <div className="flex gap-3 items-center">
        <div className="w-16 h-16 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
          {tour.image ? (
            <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-slate-400 text-xs">No image</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900 line-clamp-2 mb-1">{tour.title}</div>
          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 mb-1">
            {typeof tour.durationDays === "number" && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {tour.durationDays}d{tour.durationNights ? `/${tour.durationNights}n` : ""}
              </span>
            )}
            {typeof tour.basePrice === "number" && (
              <span className="inline-flex items-center gap-1">
                <BadgeDollarSign className="w-3.5 h-3.5" />
                {tour.basePrice.toLocaleString("vi-VN")} {tour.currency || "VND"}
              </span>
            )}
            {tour.agency?.name && <span>• {tour.agency.name}</span>}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={onAdd}
              className={`h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition-all ${
                added ? "bg-[#02A0AA] text-white" : "bg-white border border-slate-300 text-slate-700 hover:border-[#02A0AA]"
              }`}
            >
              {added ? <><Check className="w-3.5 h-3.5" /> Đã thêm</> : <><Plus className="w-3.5 h-3.5" /> Thêm</>}
            </button>
            <button
              onClick={onView}
              className="h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1 border border-[#02A0AA] text-[#02A0AA] bg-white hover:bg-[#02A0AA]/10 shadow-sm transition-all"
            >
              Xem tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Props:
 *  - zoneId (string), zoneName (string)
 *  - onMarkersChange?(markers) => [{id,name,address,location:{lat,lng}}] cho Map4DPanel
 *  - categories? override mảng category
 *  - createOrGetDraft(zoneId, zoneName) -> itineraryId
 *  - addPoiToItinerary(itineraryId, poiLike)
 */

export default function ZoneToursSection({
  zoneId,
  zoneName,
  onMarkersChange,
  createOrGetDraft,
  addPoiToItinerary,
}) {
  const [tours, setTours] = useState([]);
  const [viewingTour, setViewingTour] = useState(null);
  const { currentItinerary } = useItinerary();
  // Compute addedSet from currentItinerary
  const addedSet = useMemo(() => {
    const set = new Set();
    if (currentItinerary?.items?.length) {
      for (const item of currentItinerary.items) {
        if (item.itemType === 'tour' && item.poiId) {
          // item.poiId is tourId or 'tour:tourId'
          const tid = String(item.poiId).replace(/^tour:/, '');
          set.add(tid);
        }
      }
    }
    return set;
  }, [currentItinerary]);

  async function loadTours() {
    try {
      const res = await fetch(`/api/zones/${zoneId}/tours`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) {
        const text = await res.text();
        console.warn("Tours fetch non-OK:", res.status, text?.slice(0, 120));
        return;
      }
      const j = await res.json();
      if (j?.ok) setTours(j.tours || []);
    } catch (e) {
      console.error("❌ Load tours error:", e);
      toast.error("Không tải được danh sách tour");
    }
  }

  useEffect(() => {
    async function loadTours() {
      try {
        const res = await fetch(`/api/zones/${zoneId}/tours`, {
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) {
          const text = await res.text();
          console.warn("Tours fetch non-OK:", res.status, text?.slice(0, 120));
          return;
        }
        const j = await res.json();
        if (j?.ok) setTours(j.tours || []);
      } catch (e) {
        console.error("❌ Load tours error:", e);
        toast.error("Không tải được danh sách tour");
      }
    }
    loadTours();
  }, [zoneId]);

  // markers cho Map4DPanel (re-use prop 'pois')
  useEffect(() => {
    const markers = tours
      .map((t) => (t?.location?.lat && t?.location?.lng) ? ({
        id: `tour:${t.id}`,
        name: t.title,
        address: t.agency?.name || "",
        location: t.location
      }) : null)
      .filter(Boolean);

    onMarkersChange?.(markers);
  }, [tours, onMarkersChange]);

  // markers cho Map4DPanel (re-use prop 'pois')
  useEffect(() => {
    const markers = tours
      .map((t) => (t?.location?.lat && t?.location?.lng) ? ({
        id: `tour:${t.id}`,
        name: t.title,
        address: t.agency?.name || "",
        location: t.location
      }) : null)
      .filter(Boolean);

    onMarkersChange?.(markers);
  }, [tours, onMarkersChange]);

  async function handleAdd(tour) {
    try {
      const itineraryId = await createOrGetDraft(zoneId, zoneName);
      // Đảm bảo truyền đúng itemType: 'tour' và tourId
      const poiLike = {
        id: `tour:${tour.id}`,
        name: tour.title,
        address: tour.agency?.name || "Tour",
        location: tour.location || { lat: 0, lng: 0 },
        types: ["tour"],
        rating: 0,
        photos: tour.image ? [tour.image] : [],
        itemType: 'tour',
        tourId: tour.id,
        agency: tour.agency || null,
        basePrice: tour.basePrice,
        currency: tour.currency,
        itinerary: tour.itinerary,
      };
  await addPoiToItinerary(itineraryId, poiLike);
  // No need to openCart or setAddedSet here, handled by context
  toast.success("Đã thêm tour vào hành trình");
    } catch (e) {
      console.error(e);
      toast.error("Không thể thêm tour");
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white/80 border p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-900">{tours.length} tour</h2>
        </div>

        <div className="max-h-[50vh] overflow-auto space-y-2">
          <AnimatePresence>
            {tours.length === 0 ? (
              <div className="text-center text-sm text-slate-600 py-8">Chưa có tour</div>
            ) : (
              tours.map((t) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <MiniTourCard
                    tour={t}
                    added={addedSet.has(t.id)}
                    onAdd={() => handleAdd(t)}
                    onView={() => setViewingTour(t)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
      {viewingTour && (
        <TourDetailDialog tour={viewingTour} open={!!viewingTour} onClose={() => setViewingTour(null)} />
      )}
    </div>
  );
}
