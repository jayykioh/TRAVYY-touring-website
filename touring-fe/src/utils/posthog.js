/**
 * PostHog Analytics Utility
 * Centralized event tracking for frontend
 * 
 * Usage:
 * 1. Initialize in main.jsx: initPostHog()
 * 2. Track events: trackEvent('tour_view', { tourId: '123' })
 * 3. Identify user: identifyUser(user._id, { email: user.email })
 * 4. Reset on logout: resetPostHog()
 */

import posthog from 'posthog-js';
import { POSTHOG_KEY } from "@/config/clientEnv";

let isInitialized = false;

/**
 * Initialize PostHog client
 * Call this once in main.jsx after app mount
 */
export function initPostHog() {
  if (isInitialized) return;

  const apiKey = POSTHOG_KEY || process.env.POSTHOG_KEY || process.env.POSTHOG_API_KEY;
  const apiHost = "https://us.posthog.com"; // luôn dùng host chính, không dùng us.i.posthog.com nữa

  if (!apiKey) {
    console.warn("⚠️ PostHog API key missing – analytics disabled.");
    return;
  }

  try {
    posthog.init(apiKey, {
      api_host: apiHost,

      // --- Capture: TẮT HOÀN TOÀN autocapture ---
      autocapture: false,              // ❌ Tắt autocapture (clicks, form submits)
      capture_pageview: false,         // ❌ Tắt pageview tự động
      capture_pageleave: false,        // ❌ Tắt pageleave

      // --- Privacy ---
      disable_session_recording: true,
      cross_subdomain_cookie: false,

      // --- Persistence ---
      persistence: "localStorage",

      // --- FIX QUAN TRỌNG: không nén payload ---
      disable_compression: true,

      // --- Person Profiles (để phân tích user behavior) ---
      person_profiles: "always",

      // --- Batch gửi nhanh (debug/live) ---
      batch_size: 1,
      batch_flush_interval_ms: 500,

      // --- Debug callback ---
      loaded: () => {
        console.log("✅ PostHog initialized");
        console.log("📌 Distinct ID:", posthog.get_distinct_id());
        console.log("📌 Using ingestion host:", posthog.config.api_host);
        isInitialized = true;
      },

      // --- Debug lỗi request ---
      on_request_error: (err) => {
        console.error("❌ PostHog request failed:", err);
      }
    });

  } catch (err) {
    console.error("❌ PostHog init error:", err);
  }
}

/**
 * Track a custom event
 * @param {string} eventName - Event name (e.g., 'tour_view')
 * @param {object} properties - Event properties (e.g., { tourId: '123' })
 */
export function trackEvent(eventName, properties = {}) {
  if (!isInitialized) {
    console.warn('PostHog not initialized. Skipping event:', eventName);
    return;
  }

  try {
    const eventData = {
      ...properties,
      // Add timestamp
      timestamp: new Date().toISOString(),
      // Add source
      source: 'touring-fe',
    };
    
    // 🔍 Debug: Log full payload
    console.log(`📊 Tracked: ${eventName}`, eventData);
    console.log('🔍 PostHog instance state:', {
      distinctId: posthog.get_distinct_id(),
      sessionId: posthog.get_session_id(),
      config: posthog.config
    });
    
    posthog.capture(eventName, eventData);
  } catch (error) {
    console.error('❌ Track event failed:', eventName, error);
  }
}

/**
 * Identify a user (call after login)
 * @param {string} userId - User ID (MongoDB _id)
 * @param {object} traits - User traits (e.g., { email, name, createdAt })
 */
export function identifyUser(userId, traits = {}) {
  if (!isInitialized) {
    console.warn('PostHog not initialized. Skipping identify:', userId);
    return;
  }

  try {
    posthog.identify(userId, {
      ...traits,
      // Add platform
      platform: 'web',
    });
    console.log(`👤 Identified user: ${userId}`);
  } catch (error) {
    console.error('❌ Identify user failed:', userId, error);
  }
}

/**
 * Reset PostHog (call on logout)
 * Clears user ID and generates new distinct_id
 */
export function resetPostHog() {
  if (!isInitialized) return;

  try {
    posthog.reset();
    console.log('🔄 PostHog reset');
  } catch (error) {
    console.error('❌ Reset failed:', error);
  }
}

/**
 * Set user properties (update traits without changing distinct_id)
 * @param {object} properties - User properties to set
 */
export function setUserProperties(properties = {}) {
  if (!isInitialized) return;

  try {
    posthog.people.set(properties);
  } catch (error) {
    console.error('❌ Set user properties failed:', error);
  }
}

/**
 * Get distinct_id (for debugging)
 * @returns {string} Current PostHog distinct_id
 */
export function getDistinctId() {
  if (!isInitialized) return null;
  return posthog.get_distinct_id();
}

// ============================================
// Event Type Helpers (match backend config)
// ============================================

/**
 * Track tour view
 * @param {object} tour - Tour object
 */
export function trackTourView(tour) {
  trackEvent('tour_view', {
    tourId: tour._id,
    tourName: tour.name,
    tourPrice: tour.price,
    tourDuration: tour.duration,
    tourProvince: tour.location?.province || tour.province,
    tourVibes: tour.vibes || [],
  });
}

/**
 * Track tour booking
 * @param {object} booking - Booking object
 */
export function trackTourBooking(booking) {
  trackEvent('tour_booking_complete', {
    tourId: booking.tourId || booking.tour?._id,
    bookingId: booking._id,
    totalPrice: booking.totalPrice,
    participants: booking.participants,
    bookingDate: booking.bookingDate,
  });
}

/**
 * Track tour bookmark
 * @param {object} tour - Tour object
 * @param {boolean} isAdded - Whether bookmark was added (true) or removed (false)
 */
export function trackTourBookmark(tour, isAdded) {
  trackEvent(isAdded ? 'tour_bookmark' : 'tour_unbookmark', {
    tourId: tour._id,
    tourName: tour.name,
    tourPrice: tour.price,
  });
}

/**
 * Track blog view
 * @param {object} blog - Blog object
 */
export function trackBlogView(blog) {
  trackEvent('blog_view', {
    blogId: blog._id,
    blogTitle: blog.title,
    blogVibes: blog.vibes || [],
    blogProvinces: blog.provinces || [],
  });
}

/**
 * Track blog interaction (like, bookmark)
 * @param {object} blog - Blog object
 * @param {string} actionType - 'like' or 'bookmark'
 */
export function trackBlogInteraction(blog, actionType) {
  trackEvent(`blog_${actionType}`, {
    blogId: blog._id,
    blogTitle: blog.title,
  });
}

/**
 * Track daily ask answer
 * @param {object} question - Question object
 * @param {string} answer - User's answer
 */
export function trackDailyAskAnswer(question, answer) {
  trackEvent('daily_ask_answer', {
    questionId: question._id,
    questionText: question.question,
    answer: answer,
    answerDate: new Date().toISOString(),
  });
}

/**
 * Track zone interaction (click on zone card)
 * @param {object} zone - Zone object
 * @param {string} actionType - 'click' or 'skip'
 */
export function trackZoneInteraction(zone, actionType) {
  trackEvent(`zone_${actionType}`, {
    zoneId: zone._id,
    zoneName: zone.name,
    zoneProvince: zone.province,
    zoneVibes: zone.vibes || [],
  });
}

/**
 * Track itinerary optimization request
 * @param {object} itinerary - Itinerary object
 */
export function trackItineraryOptimize(itinerary) {
  trackEvent('itinerary_optimize', {
    itineraryId: itinerary._id,
    dayCount: itinerary.days?.length || 0,
    tourCount: itinerary.tours?.length || 0,
  });
}

export default {
  initPostHog,
  trackEvent,
  identifyUser,
  resetPostHog,
  setUserProperties,
  getDistinctId,
  // Helpers
  trackTourView,
  trackTourBooking,
  trackTourBookmark,
  trackBlogView,
  trackBlogInteraction,
  trackDailyAskAnswer,
  trackZoneInteraction,
  trackItineraryOptimize,
};
