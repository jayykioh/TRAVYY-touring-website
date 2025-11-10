

const EMBED_URL = process.env.EMBED_SERVICE_URL || 'http://localhost:8088';

/**
 * Helper: Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Generate embeddings for texts
 */
async function embed(texts) {
  const res = await fetchWithTimeout(`${EMBED_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts })
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Embed error: ${res.status} ${text}`);
  }
  
  return res.json();
}

/**
 * Upsert items to embedding index
 */
async function upsert(items) {
  const res = await fetchWithTimeout(`${EMBED_URL}/upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  }, 30000);
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upsert error: ${res.status} ${text}`);
  }
  
  return res.json();
}

/**
 * Basic semantic search
 */
async function search(query, options = {}) {
  const { top_k = 10, filter_type, filter_province, min_score } = options;
  
  const res = await fetchWithTimeout(`${EMBED_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      top_k,
      filter_type,
      filter_province,
      min_score
    })
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search error: ${res.status} ${text}`);
  }
  
  return res.json();
}

/**
 * Enhanced hybrid search with vibes + free text
 */
async function hybridSearch(options = {}) {
  const {
    free_text,
    vibes = [],
    avoid = [],
    top_k = 10,
    filter_type,
    filter_province,
    boost_vibes = 1.2
  } = options;
  
  console.log('🔌 [EmbedClient] Calling hybrid-search:', {
    url: `${EMBED_URL}/hybrid-search`,
    free_text: free_text?.substring(0, 50),
    vibes: vibes.slice(0, 3),
    avoid: avoid.slice(0, 2),
    filter_type
  });
  
  try {
    const res = await fetchWithTimeout(`${EMBED_URL}/hybrid-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        free_text,
        vibes,
        avoid,
        top_k,
        filter_type,
        filter_province,
        boost_vibes
      })
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    
    const result = await res.json();
    console.log(`✅ [EmbedClient] Response:`, {
      hits: result.hits?.length || 0,
      strategy: result.strategy
    });
    
    return result;
  } catch (error) {
    console.error('❌ [EmbedClient] hybridSearch error:', error.message);
    throw error;
  }
}

/**
 * ✅ FIX: Get service health with proper error handling
 */
async function health() {
  try {
    const res = await fetchWithTimeout(`${EMBED_URL}/healthz`, {}, 3000);
    
    if (!res.ok) {
      return { 
        status: 'error', 
        error: `HTTP ${res.status}`,
        url: EMBED_URL
      };
    }
    
    // ✅ Parse JSON response
    const data = await res.json();
    
    // ✅ Validate response structure
    if (!data || typeof data.status === 'undefined') {
      return {
        status: 'error',
        error: 'Invalid response format',
        url: EMBED_URL,
        raw: data
      };
    }
    
    return data;
    
  } catch (error) {
    return { 
      status: 'error', 
      error: error.message,
      url: EMBED_URL
    };
  }
}

/**
 * ✅ FIX: Check if embedding service is available
 */
async function isAvailable() {
  try {
    const h = await health();
    
    const available = h.status === 'ok';
    
    if (available) {
      console.log(`🔍 [EmbedClient] Service check: ✅ OK`, {
        model: h.model,
        vectors: h.vectors,
        url: EMBED_URL
      });
    } else {
      console.log(`🔍 [EmbedClient] Service check: ❌ DOWN`, {
        error: h.error,
        url: EMBED_URL
      });
    }
    
    return available;
    
  } catch (error) {
    console.log(`🔍 [EmbedClient] Service check: ❌ ERROR -`, error.message);
    return false;
  }
}

// ✅ Export all functions
module.exports = {
  embed,
  upsert,
  search,
  hybridSearch,
  health,
  isAvailable
};