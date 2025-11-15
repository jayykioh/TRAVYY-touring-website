// =================== IMPORTANT ===================
// This service is meant to be used with the AuthContext's withAuth function
// Import { useAuth } from '../auth/context' and use auth.withAuth()
// =================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// =================== SECURITY SETTINGS ===================

export const getSecuritySettings = (withAuth) => {
  return withAuth("/api/security/settings");
};

// =================== 2FA FUNCTIONS ===================

export const request2FAEnable = (withAuth) => {
  return withAuth("/api/security/2fa/request-enable", {
    method: "POST",
  });
};

export const enable2FA = (withAuth, token) => {
  return withAuth("/api/security/2fa/enable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
};

export const verify2FA = (withAuth, code, userId = null) => {
  const body = userId ? { token: code, userId } : { token: code };

  return withAuth("/api/security/2fa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

export const disable2FA = (withAuth, password) => {
  return withAuth("/api/security/2fa/disable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
};

// =================== EMAIL VERIFICATION FUNCTIONS ===================

export const requestEmailVerificationToggle = (withAuth, enabled) => {
  return withAuth("/api/security/email-verification/request-toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
};

export const toggleEmailVerification = (withAuth, token) => {
  return withAuth("/api/security/email-verification/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
};

export const sendVerificationCode = (withAuth) => {
  return withAuth("/api/security/email-verification/send-code", {
    method: "POST",
  });
};

export const verifyEmailCode = (withAuth, code) => {
  return withAuth("/api/security/email-verification/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
};
