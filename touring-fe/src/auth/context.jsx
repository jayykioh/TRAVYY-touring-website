import { createContext, useContext } from "react";

export const AuthCtx = createContext(null);
export function useAuth() {
  return useContext(AuthCtx);
}
