import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";   
import App from "./App";
import AuthProvider from "./auth/AuthContext";
import { Toaster } from "sonner";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster  richColors closeButton />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
