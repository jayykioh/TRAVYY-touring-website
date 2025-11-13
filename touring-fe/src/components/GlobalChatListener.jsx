import React, { useEffect, useState } from 'react';
import ChatPopup from '../guide/components/chat/ChatPopup';

/**
 * GlobalChatListener: Listens for a site-wide CustomEvent 'open-traveller-chat'
 * and opens the ChatPopup component (similar to guide's chat system).
 */
export default function GlobalChatListener() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsPopupOpen(true);
    };

    window.addEventListener('open-traveller-chat', handler);
    return () => window.removeEventListener('open-traveller-chat', handler);
  }, []);

  return (
    <ChatPopup
      isOpen={isPopupOpen}
      onClose={() => setIsPopupOpen(false)}
    />
  );
}
