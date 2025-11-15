import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App";
import AuthProvider from "./auth/AuthContext";
import { CartProvider } from "./context/CartContext";
import ItineraryProvider from "./context/ItineraryContext";
import { Toaster } from "sonner";
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
          <ItineraryProvider>
            <CartProvider>
              <App />
              <Toaster richColors closeButton />
            </CartProvider>
          </ItineraryProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<AppWithAnalytics />);
