import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * FloatingChatButton: Minimal floating chat button that opens the ChatPopup.
 * Used across the site for traveller chat functionality.
 */
const FloatingChatButton = ({ onClick, unreadCount = 0 }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Dispatch a global event so GlobalChatListener can open the popup
      try {
        window.dispatchEvent(new CustomEvent('open-traveller-chat', { detail: { source: 'floating-button' } }));
      } catch {
        // ignore in older browsers
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Open chat"
      className="fixed bottom-6 right-6 z-[9997] w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer relative"
    >
      <MessageCircle className="w-6 h-6" />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-bounce shadow-lg">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </button>
  );
};

export default FloatingChatButton;
