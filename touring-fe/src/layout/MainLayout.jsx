import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatPopup from "../guide/components/chat/ChatPopup";
import { useAuth } from "../auth/context";

export default function MainLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Hide global ChatPopup on pages where it causes conflicts (e.g. itinerary detail pages)
  const hideGlobalChatOn = ['/itinerary'];
  const isOnHiddenRoute = hideGlobalChatOn.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));

  // Reset chat popup when route changes
  // Do not forcibly close the global ChatPopup on every route change —
  // this caused Chat/Socket/Auth contexts to remount and produced
  // transient token loss. Keep chat state stable across navigation.

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1"><Outlet/></main>
      <Footer />

      {/* Floating Chat Button - Only show for logged-in users */}
      {user && !isOnHiddenRoute && (
        <>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-[9997] group"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Chat Popup - Will render correct UI based on user role */}
          <ChatPopup
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            userRole={user?.role}
          />
        </>
      )}
    </div>
  );
}
