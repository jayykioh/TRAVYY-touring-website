import { useContext } from "react";
import { ItineraryContext } from "../context/itinerary-context";

export function useItinerary() {
  const ctx = useContext(ItineraryContext);
  if (!ctx) throw new Error("useItinerary must be used within ItineraryProvider");
  return ctx;
}
