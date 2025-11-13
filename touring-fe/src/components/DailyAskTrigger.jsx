import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import DailyAskModal from "./DailyAskModal";
import { useAuth } from "../auth/context";

/**
 * DailyAskTrigger - Floating button to trigger daily question
 * 
 * Behavior:
 * - Shows floating button if user not answered today
 * - Hides if user already answered
 * - Animates on mount to grab attention
 * - Click → Open DailyAskModal
 * 
 * Position: Fixed bottom-right corner (like chat widget)
 */

const DailyAskTrigger = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Check if should show button
  useEffect(() => {
    if (!user?.token) {
      setShouldShowButton(false);
      return;
    }

    const lastAnswered = localStorage.getItem("dailyAsk_lastAnswered");
    const today = new Date().toISOString().split("T")[0];

    console.log("🎯 [DailyAskTrigger] Check:", { lastAnswered, today });

    if (lastAnswered !== today) {
      setShouldShowButton(true);
      // Trigger animation after mount
      setTimeout(() => setAnimate(true), 500);
    } else {
      setShouldShowButton(false);
      console.log("✅ [DailyAskTrigger] Already answered, hide button");
    }
  }, [user]);

  // Handle modal close
  const handleClose = () => {
    setShowModal(false);
    // Re-check if should show button (in case user answered)
    const lastAnswered = localStorage.getItem("dailyAsk_lastAnswered");
    const today = new Date().toISOString().split("T")[0];
    setShouldShowButton(lastAnswered !== today);
  };

  // Don't render if user not logged in or already answered
  if (!shouldShowButton) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            console.log("🎯 [DailyAskTrigger] Button clicked");
            setShowModal(true);
          }}
          className={`
            group relative bg-gray-900 hover:bg-gray-800
            text-white rounded-full p-4 shadow-lg 
            hover:shadow-xl hover:scale-105 
            transition-all duration-300
            ${animate ? "animate-bounce" : ""}
          `}
          aria-label="Câu hỏi hôm nay"
        >
          {/* Subtle pulse ring */}
          <span className="absolute inset-0 rounded-full bg-gray-700 animate-ping opacity-20"></span>
          
          {/* Icon */}
          <MessageCircle className="w-6 h-6 relative z-10" />
          
          {/* Badge */}
          <span className="absolute -top-1 -right-1 bg-gray-900 border-2 border-white text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            Trả lời câu hỏi hôm nay
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>

      {/* Modal */}
      {showModal && <DailyAskModal onClose={handleClose} />}
    </>
  );
};

export default DailyAskTrigger;
