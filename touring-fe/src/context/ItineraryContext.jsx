/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import { ItineraryContext } from "./itinerary-context";
import { useAuth } from "@/auth/context";
import logger from '@/utils/logger';

export default function ItineraryProvider({ children }) {
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy withAuth từ AuthProvider: tự refresh khi 401 + retry
  const { withAuth, isAuth } = useAuth();

  // Auto-load itinerary on mount (and when isAuth changes)
  useEffect(() => {
    if (isAuth) {
      loadCurrentItinerary();
    } else {
      setCurrentItinerary(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  // === Load current itinerary ===
  async function loadCurrentItinerary() {
    if (!isAuth) return null; // chưa login thì thôi
    try {
      setLoading(true);
      const data = await withAuth("/api/itinerary"); // GET
      if (data?.success) {
        const draft = data.itineraries.find((it) => it.status === "draft");
        setCurrentItinerary(draft || null);
        return draft || null;
      }
      return null;
    } catch (error) {
        // withAuth đã refresh hộ; nếu vẫn lỗi thì coi như chưa auth
        logger.error("Error loading itinerary:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // === Create or get itinerary for zone ===
  async function getOrCreateItinerary(zoneId, zoneName, preferences = {}) {
    try {
      if (currentItinerary && currentItinerary.zoneId === zoneId) {
        return currentItinerary;
      }

      const data = await withAuth("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneId, zoneName, preferences }),
      });

      if (data?.success) {
        setCurrentItinerary(data.itinerary);
        return data.itinerary;
      }
      throw new Error(data?.message || "Failed to create itinerary");
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        logger.error("Error creating itinerary:", error);
      }
      throw error;
    }
  }


  // === Add POI ===
  async function addPOI(poi, zoneId, zoneName, preferences) {
    try {
      let itinerary = currentItinerary;
      if (!itinerary || itinerary.zoneId !== zoneId) {
        itinerary = await getOrCreateItinerary(zoneId, zoneName, preferences);
      }
      if (!itinerary) throw new Error("Failed to get itinerary");

      const poiId = poi.place_id || poi.id;
      const exists = itinerary.items?.some((item) => item.poiId === poiId);
      if (exists) throw new Error("POI already in itinerary");

      // Always send itemType for backend
      const data = await withAuth(`/api/itinerary/${itinerary._id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poi: { ...poi, itemType: 'poi' } }),
      });

      if (data?.success) {
        setCurrentItinerary(data.itinerary);
        if (data.warnings?.length > 0) {
          // có thể hiện toast ở đây
          logger.warn("⚠️ Warnings:", data.warnings);
        }
        return data.itinerary;
      }
      throw new Error(data?.message || "Failed to add POI");
    } catch (error) {
      logger.error("Error adding POI:", error);
      throw error;
    }
  }

  // === Add Tour ===
  async function addTour(tour, zoneId, zoneName, preferences) {
    try {
      let itinerary = currentItinerary;
      if (!itinerary || itinerary.zoneId !== zoneId) {
        itinerary = await getOrCreateItinerary(zoneId, zoneName, preferences);
      }
      if (!itinerary) throw new Error("Failed to get itinerary");

      const tourId = tour.tourId || tour.id;
      const exists = itinerary.items?.some((item) => item.poiId === tourId);
      if (exists) throw new Error("Tour already in itinerary");

      // Send itemType and tourId for backend
      const data = await withAuth(`/api/itinerary/${itinerary._id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poi: {
            ...tour,
            itemType: 'tour',
            tourId: tourId,
          },
        }),
      });

      if (data?.success) {
        setCurrentItinerary(data.itinerary);
        if (data.warnings?.length > 0) {
          logger.warn("⚠️ Warnings:", data.warnings);
        }
        return data.itinerary;
      }
      throw new Error(data?.message || "Failed to add tour");
    } catch (error) {
      logger.error("Error adding tour:", error);
      throw error;
    }
  }

  // === Remove POI ===
  async function removePOI(poiId) {
    try {
      if (!currentItinerary) return null;

      const data = await withAuth(
        `/api/itinerary/${currentItinerary._id}/items/${poiId}`,
        { method: "DELETE" }
      );

      if (data?.success) {
        setCurrentItinerary(data.itinerary);
        return data.itinerary;
      }
      throw new Error(data?.message || "Failed to remove POI");
    } catch (error) {
      logger.error("Error removing POI:", error);
      throw error;
    }
  }
  // ✅ FIX: Reorder POIs
  async function reorderPOIs(nextIds) {
    if (!currentItinerary || !nextIds?.length) return;

    // Create map for quick lookup
    const map = Object.fromEntries(
      (currentItinerary.items || []).map((it) => [it.poiId, it])
    );

    // Get reordered items (filter out invalid IDs)
    const nextItems = nextIds.map((id) => map[id]).filter(Boolean);

    // Optimistic update (UI responds immediately)
    const prevItinerary = currentItinerary;
    setCurrentItinerary({
      ...prevItinerary,
      items: nextItems,
      isOptimized: false, // Reset optimization flag
    });

    // Sync with backend
    try {
      const data = await withAuth(
        `/api/itinerary/${prevItinerary._id}/items/reorder`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: nextIds }),
        }
      );

      if (data?.success) {
        // Backend returned updated itinerary, use it
        setCurrentItinerary(data.itinerary);
        logger.info("✅ Order synced with backend");
      } else {
        throw new Error(data?.message || "Failed to reorder");
      }
      } catch (error) {
      logger.error("❌ Reorder failed, rolling back:", error);
      // Rollback to previous state on error
      setCurrentItinerary(prevItinerary);
    }
  }

  // === Utilities ===
  function isPOIInCart(poiId) {
    if (!currentItinerary) return false;
    return currentItinerary.items?.some((item) => item.poiId === poiId);
  }

  function getCartCount() {
    return currentItinerary?.items?.length || 0;
  }

  function toggleCart() {
    setIsOpen((prev) => !prev);
  }

  function openCart() {
    setIsOpen(true);
  }

  function closeCart() {
    setIsOpen(false);
  }

  function clearCart() {
    setCurrentItinerary(null);
    setIsOpen(false);
  }

  const value = {
    currentItinerary,
    setCurrentItinerary,
    isOpen,
    loading,
    addPOI,
    addTour, // new
    removePOI,
    isPOIInCart,
    getCartCount,
    toggleCart,
    openCart,
    closeCart,
    loadCurrentItinerary,
    clearCart,
    reorderPOIs,
    // Helper: is custom tour
    isCustomTour: currentItinerary?.isCustomTour,
    tourGuideRequest: currentItinerary?.tourGuideRequest,
  };

  return (
    <ItineraryContext.Provider value={value}>
      {children}
    </ItineraryContext.Provider>
  );
}
