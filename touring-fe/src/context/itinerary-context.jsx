import { createContext } from 'react';

// Central Itinerary context object. Other modules (ItineraryProvider and
// useItinerary hook) import this to share the same Context instance.
export const ItineraryContext = createContext(null);
ItineraryContext.displayName = 'ItineraryContext';

export default ItineraryContext;
