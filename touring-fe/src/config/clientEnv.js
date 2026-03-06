// Central client-side environment replacements.
// NOTE: These are intentionally hardcoded or derived at runtime
// to remove reliance on Vite's `import.meta.env` in source files.

export const IS_DEV = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);
export const IS_PROD = !IS_DEV;

// Analytics / map keys — set to production values here.
// If you prefer to inject these at runtime, replace these strings
// with an alternative mechanism (window.__APP_ENV__, meta tags, etc.).
export const POSTHOG_KEY = ""; // e.g. 'phc_...'
export const GOOGLE_MAPS_API_KEY = "";
export const GOONG_MAPTILES_KEY = "";
export const MAP4D_API_KEY = "";
