import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
// Initialize client logger (patches console based on NODE_ENV)
import "./initClientLogger";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App";
import AuthProvider from "./auth/AuthContext";
import { CartProvider } from "./context/CartContext";
import ItineraryProvider from "./context/ItineraryContext";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "sonner";
import GlobalChatListener from '@/components/GlobalChatListener';
import { initPostHog } from "./utils/posthog";

// Initialize PostHog on app mount
function AppWithAnalytics() {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
        <SocketProvider>
            <ItineraryProvider>
              <CartProvider>
                <App />
              <GlobalChatListener />
                <Toaster richColors closeButton />
              </CartProvider>
            </ItineraryProvider>
        </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<AppWithAnalytics />);
