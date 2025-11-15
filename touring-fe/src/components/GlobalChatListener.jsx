import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/context';
import ChatPopup from '../guide/components/chat/ChatPopup';

/**
 * GlobalChatListener: Listens for a site-wide CustomEvent 'open-traveller-chat'
 * and opens the ChatPopup component (similar to guide's chat system).
 * Passes userRole to ensure ChatPopup fetches correct data based on user type.
 */
export default function GlobalChatListener() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handler = () => {
      setIsPopupOpen(true);
    };

    window.addEventListener('open-traveller-chat', handler);
    return () => window.removeEventListener('open-traveller-chat', handler);
  }, []);

  return (
    <>
      {isPopupOpen && (
        <ChatPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          userRole={user?.role}
        />
      )}
    </>
  );
}
