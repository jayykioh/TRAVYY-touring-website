const axios = require('axios');
const { 
  POSTHOG_API_KEY, 
  POSTHOG_HOST,
  POSTHOG_PROJECT_ID,
  EVENT_TYPES 
} = require('../../config/posthog.config');

/**
 * Fetch events from PostHog API
 * Docs: https://posthog.com/docs/api/events
 */
class EventFetcher {
  constructor() {
    this.apiUrl = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/events`;
    // Use Personal API Key for fetching events (not Project API Key)
    this.apiKey = process.env.POSTHOG_PERSONAL_API_KEY || POSTHOG_API_KEY;
    
    // Debug: Log which key is being used
    if (process.env.POSTHOG_PERSONAL_API_KEY) {
      console.log(`🔑 Using Personal API Key: ${this.apiKey.substring(0, 10)}...`);
    } else {
      console.log(`⚠️ POSTHOG_PERSONAL_API_KEY not found, using Project API Key (will fail for fetching events)`);
    }
  }
  
  /**
   * Fetch all events for last 7 days
   * @param {Date} startDate - Start date (default: 7 days ago)
   * @param {Date} endDate - End date (default: now)
   * @returns {Array} Events array
   */
  async fetchEvents(startDate, endDate) {
    if (!this.apiKey || !POSTHOG_PROJECT_ID) {
      throw new Error('PostHog API key or project ID not configured. Check .env file.');
    }
    
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();
    
    console.log(`📥 Fetching PostHog events from ${start.toISOString()} to ${end.toISOString()}`);
    
    try {
      let allEvents = [];
      let nextUrl = this.apiUrl;
      let pageCount = 0;
      
      // PostHog uses cursor pagination
      while (nextUrl) {
        pageCount++;
        console.log(`📄 Fetching page ${pageCount}...`);
        
        const response = await axios.get(nextUrl, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          params: nextUrl === this.apiUrl ? {
            after: start.toISOString(),
            before: end.toISOString(),
            event: Object.values(EVENT_TYPES), // Filter only our events
            limit: 100 // Max per page
          } : undefined, // Don't override params for next page URL
          timeout: 30000
        });
        
        const data = response.data;
        const newEvents = data.results || [];
        allEvents = allEvents.concat(newEvents);
        
        console.log(`📦 Page ${pageCount}: ${newEvents.length} events (total: ${allEvents.length})`);
        
        nextUrl = data.next; // Next page URL
        
        // Safety limit (max 10k events per sync)
        if (allEvents.length >= 10000) {
          console.warn('⚠️ Reached 10k event limit, stopping fetch');
          break;
        }
        
        // Rate limit protection (wait 100ms between requests)
        if (nextUrl) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`✅ Total events fetched: ${allEvents.length} (${pageCount} pages)`);
      return allEvents;
      
    } catch (error) {
      console.error('❌ Failed to fetch PostHog events:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }
  
  /**
   * Transform PostHog event to our format
   * @param {Object} rawEvent - Raw event from PostHog API
   * @returns {Object} Transformed event
   */
  transformEvent(rawEvent) {
    const props = rawEvent.properties || {};
    
    // Extract vibes from various property names
    let vibes = [];
    if (props.vibes) {
      vibes = Array.isArray(props.vibes) ? props.vibes : [props.vibes];
    } else if (props.tourVibes) {
      vibes = Array.isArray(props.tourVibes) ? props.tourVibes : [props.tourVibes];
    } else if (props.blogVibes) {
      vibes = Array.isArray(props.blogVibes) ? props.blogVibes : [props.blogVibes];
    }
    
    // Extract provinces from various property names
    let provinces = [];
    if (props.provinces) {
      provinces = Array.isArray(props.provinces) ? props.provinces : [props.provinces];
    } else if (props.tourProvince) {
      provinces = [props.tourProvince];
    } else if (props.blogProvinces) {
      provinces = Array.isArray(props.blogProvinces) ? props.blogProvinces : [props.blogProvinces];
    }
    
    return {
      eventType: rawEvent.event,
      userId: rawEvent.distinct_id,
      timestamp: new Date(rawEvent.timestamp),
      properties: props,
      
      // Extracted fields
      vibes,
      provinces,
      
      // Entity IDs
      tourId: props.tourId,
      blogSlug: props.blogSlug || props.blogId,
      zoneId: props.zoneId,
      questionId: props.questionId,
      
      // Engagement metrics
      duration: props.duration || 0,
      totalPrice: props.totalPrice || props.tourPrice,
      adults: props.adults,
      children: props.children
    };
  }
  
  /**
   * Test connection to PostHog API
   */
  async testConnection() {
    try {
      const response = await axios.get(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      });
      
      console.log('✅ PostHog connection successful');
      console.log('   Project:', response.data.name);
      return true;
    } catch (error) {
      console.error('❌ PostHog connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new EventFetcher();
