/**
 * PostHog configuration
 * Define event types, weights, and mapping rules
 */

// Event types tracked in PostHog
const EVENT_TYPES = {
  // Tour events
  TOUR_VIEW: 'tour_view',
  TOUR_CLICK: 'tour_click',
  TOUR_BOOKMARK: 'tour_bookmark',
  TOUR_BOOKING: 'tour_booking_complete',
  
  // Blog events
  BLOG_VIEW: 'blog_view',
  BLOG_READ_COMPLETE: 'blog_read_complete', // Scroll 100%
  
  // Itinerary
  ITINERARY_CREATE: 'itinerary_create',
  ITINERARY_OPTIMIZE: 'itinerary_optimize',
  
  // Zone events (if needed)
  ZONE_VIEW: 'zone_view',
  ZONE_BOOKMARK: 'zone_bookmark'
};

// Event weights (giống Facebook engagement scoring)
const EVENT_WEIGHTS = {
  // High engagement (conversion actions)
  [EVENT_TYPES.TOUR_BOOKING]: 5.0,
  [EVENT_TYPES.ITINERARY_OPTIMIZE]: 3.0,
  
  // Medium engagement
  [EVENT_TYPES.TOUR_BOOKMARK]: 2.5,
  [EVENT_TYPES.ZONE_BOOKMARK]: 2.0,
  [EVENT_TYPES.BLOG_READ_COMPLETE]: 1.5,
  
  // Low engagement (browsing)
  [EVENT_TYPES.TOUR_VIEW]: 0.5,
  [EVENT_TYPES.TOUR_CLICK]: 0.8,
  [EVENT_TYPES.BLOG_VIEW]: 0.3,
  [EVENT_TYPES.ZONE_VIEW]: 0.3
};

// Required properties for each event type
const EVENT_SCHEMAS = {
  [EVENT_TYPES.TOUR_VIEW]: {
    required: ['tourId'],
    optional: ['vibes', 'provinces', 'duration']
  },
  [EVENT_TYPES.TOUR_BOOKING]: {
    required: ['tourId', 'totalPrice'],
    optional: ['vibes', 'provinces', 'adults', 'children']
  },
  [EVENT_TYPES.BLOG_VIEW]: {
    required: ['blogSlug'],
    optional: ['vibes', 'provinces', 'duration']
  }
};

// Time decay (events older than 7 days have less weight)
const TIME_DECAY_DAYS = 30; // 30-day half-life

module.exports = {
  EVENT_TYPES,
  EVENT_WEIGHTS,
  EVENT_SCHEMAS,
  TIME_DECAY_DAYS,
  
  // PostHog API config
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
  POSTHOG_HOST: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID
};
