import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App";
import AuthProvider from "./auth/AuthContext";
import { CartProvider } from "./context/CartContext";
import ItineraryProvider from "./context/ItineraryContext";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "sonner";
import GlobalChatListener from '@/components/GlobalChatListener';

createRoot(document.getElementById("root")).render(
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
