import React from 'react';
import { MessageCircle } from 'lucide-react';

// Minimal floating chat button used across the site. Keep markup tiny so
// it won't interfere with layout while resolving imports.
const FloatingChatButton = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // If no onClick provided, do nothing (button will be decorative)
    else {
      // Dispatch a global event so pages that listen can open traveller chat
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
      className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
};

export default FloatingChatButton;
