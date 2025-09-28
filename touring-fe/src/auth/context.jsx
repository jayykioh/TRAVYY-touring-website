import { createContext, useContext } from "react";

export const AuthCtx = createContext(null);

// Hook tiện dùng ở mọi component
export function useAuth() {
  return useContext(AuthCtx);
}
