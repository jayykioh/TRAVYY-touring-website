import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TravellerChatBox from '@/components/TravellerChatBox';
import { useItinerary } from '@/hooks/useIntinerary';
import { toast } from 'sonner';

/**
 * GlobalChatListener: Listens for a site-wide CustomEvent 'open-traveller-chat'
 * and, when fired, will open the TravellerChatBox using the currently loaded
 * itinerary (from ItineraryContext). If no itinerary is present it shows a
 * toast prompting the user to open/create one.
 *
 * Designed to be resilient: if ItineraryProvider not mounted yet, gracefully
 * degrades instead of crashing.
 */
export default function GlobalChatListener() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [itineraryData, setItineraryData] = useState(null);

  // Always call hook (conditional call is error), but guard inside useEffect
  let currentItinerary = null;
  try {
    ({ currentItinerary } = useItinerary());
  } catch {
    // Provider not mounted; that's ok, we'll use local state fallback
    console.warn('[GlobalChatListener] ItineraryProvider not available, will use fallback');
  }

  useEffect(() => {
    const handler = (ev) => {
      // prefer explicit requestId if provided in detail
      const explicit = ev?.detail?.requestId;
      if (explicit) {
        setRequestId(explicit);
        setOpen(true);
        setItineraryData(null);
        return;
      }

      // Try to use context first
      if (currentItinerary && currentItinerary._id) {
        setRequestId(currentItinerary._id);
        setItineraryData(currentItinerary);
        setOpen(true);
      } else {
        // Fallback: try localStorage (itinerary may have been saved)
        try {
          const saved = localStorage.getItem('currentItinerary');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed._id) {
              setRequestId(parsed._id);
              setItineraryData(parsed);
              setOpen(true);
              return;
            }
          }
        } catch {
          // ignore parse errors
        }

        toast('Không tìm thấy hành trình hiện tại. Vui lòng mở một hành trình trước.');
      }
    };

    window.addEventListener('open-traveller-chat', handler);
    return () => window.removeEventListener('open-traveller-chat', handler);
  }, [currentItinerary, navigate]);

  if (!open) return null;

  // Use either context itinerary or fallback data
  const itinerary = currentItinerary || itineraryData || {};

  return (
    <div className="fixed inset-0 z-[20000] flex items-end justify-center pointer-events-none">
      <div className="w-full max-w-3xl p-4 pointer-events-auto">
        <TravellerChatBox
          requestId={requestId}
          guideName={itinerary?.tourGuideRequest?.guideName || 'Tour Guide'}
          onClose={() => setOpen(false)}
          tourInfo={{
            tourName: itinerary?.name || itinerary?.zoneName || '',
            name: itinerary?.name || '',
            location: itinerary?.zoneName || '',
            departureDate: itinerary?.preferredDate || '',
            numberOfGuests: itinerary?.numberOfPeople || 1,
            duration: itinerary?.totalDuration ? `${Math.floor(itinerary.totalDuration / 60)}h ${itinerary.totalDuration % 60}m` : '',
            itinerary: (itinerary?.items || []).map(i => ({ title: i.name, time: i.arrivalTime || '', description: i.description })),
            totalPrice: itinerary?.estimatedCost
          }}
        />
      </div>
    </div>
  );
}
