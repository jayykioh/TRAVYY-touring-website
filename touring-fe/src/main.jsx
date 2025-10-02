import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";   
import App from "./App";
import AuthProvider from "./auth/AuthContext";
import { Toaster } from "sonner";
import CartProvider from "./components/CartContext";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
         <CartProvider>
        <App />
        <Toaster  richColors closeButton />
         </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
