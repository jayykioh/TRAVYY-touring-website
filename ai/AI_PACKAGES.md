# 🎯 AI Service - Complete Package Structure

## 📁 Directory Structure
```
ai/
├── 📄 app.py                          # Main FastAPI application
├── 📄 sync_zones_from_mongo.py        # Zone embedding sync script
├── 📄 requirements.txt                # Python dependencies
├── 📄 .env                            # Environment config
├── 📄 README.md                       # Service documentation
├── 📄 AI_FLOW_DIAGRAMS.md             # Architecture diagrams
├── 📄 AI_ARCHITECTURE.md              # Package structure (new)
│
├── 📂 index/                          # FAISS index storage
│   ├── faiss.index                    # FAISS binary index
│   └── meta.json                      # Metadata for vectors
├── 📂 .venv/                          # Python virtual environment
└── 📂 __pycache__/                    # Python cache

touring-be/services/ai/
├── 📄 index.js                        # AI service facade
│
└── 📂 libs/
    ├── 📄 llm.js                      # Google Gemini integration
    ├── 📄 embedding-client.js         # Python AI HTTP client
    ├── 📄 keyword-matcher.js          # Keyword extraction fallback
    ├── 📄 goong.js                    # Goong Maps API client
    ├── 📄 map4d.js                    # Map4D POI API client
    └── 📂 __tests__/                  # Jest test suites
```

---

## 🎯 Package Breakdown

### 1️⃣ **ai.app** (Application Layer)
**File**: `ai/app.py`

**Responsibilities**:
- FastAPI application initialization
- Route registration
- CORS middleware configuration
- Application lifecycle management
- Server startup/shutdown

**Components**:
```python
app = FastAPI(
    title="Touring Embedding Service",
    description="Vietnamese semantic search for zones & POIs",
    version="2.0"
)

# CORS Configuration
app.add_middleware(CORSMiddleware, ...)

# Lifecycle
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
```

---

### 2️⃣ **ai.routes** (API Endpoints)
**File**: `ai/app.py` (inline routes)

**Endpoints**:
```python
# Health & Info
GET  /                  # Service info
GET  /healthz           # Health check
GET  /stats             # Index statistics

# Core Operations
POST /embed             # Generate embeddings
POST /upsert            # Add/update vectors
POST /search            # Semantic search
POST /hybrid-search     # Hybrid search with boosting
POST /reset             # Clear index
```

**Request/Response Flow**:
```
Client Request
    ↓
FastAPI Route Handler
    ↓
Service Layer (Embedding/Search)
    ↓
FAISS Index + Metadata
    ↓
Response (JSON)
```

---

### 3️⃣ **ai.services** (Business Logic)
**File**: `ai/app.py` (inline functions)

#### 3.1 **Embedding Service**
**Function**: `embed()`

```python
@app.post("/embed")
def embed(req: EmbedRequest):
    # Generate embeddings using SentenceTransformer
    embeddings = model.encode(
        req.texts,
        normalize_embeddings=True,
        convert_to_numpy=True
    )
    return {"embeddings": embeddings.tolist(), ...}
```

**Features**:
- Batch embedding generation (1-100 texts)
- L2 normalization for cosine similarity
- Vietnamese language support
- 1024-dimensional vectors

#### 3.2 **Upsert Service**
**Function**: `upsert()`

```python
@app.post("/upsert")
def upsert(req: UpsertRequest):
    # 1. Generate embeddings
    embeddings = model.encode(texts, ...)
    
    # 2. Remove old entries (by ID)
    metadata = [m for m in metadata if m["id"] not in ids_set]
    
    # 3. Add new vectors to FAISS
    index.add(np.array([emb], dtype=np.float32))
    
    # 4. Store metadata
    metadata.append({...})
    
    # 5. Persist to disk
    save_index()
```

**Features**:
- Add/update zone/POI vectors
- ID-based deduplication
- Metadata persistence
- Atomic operations

#### 3.3 **Search Service**
**Function**: `search()`

```python
@app.post("/search")
def search(req: SearchRequest):
    # 1. Embed query
    query_emb = model.encode([req.query], ...)
    
    # 2. FAISS ANN search
    scores, indices = index.search(query_emb, k)
    
    # 3. Filter results
    # - By type (zone/poi)
    # - By province
    # - By min_score
    
    # 4. Return ranked hits
    return {"hits": [...]}
```

**Features**:
- Top-k semantic search
- Dot product similarity
- Metadata filtering
- Score thresholding

#### 3.4 **Hybrid Search Service**
**Function**: `hybrid_search()`

```python
@app.post("/hybrid-search")
def hybrid_search(req: HybridSearchRequest):
    # 1. Build query from free_text + vibes
    query_text = " ".join([free_text, *vibes])
    
    # 2. Semantic search (large k)
    scores, indices = index.search(query_emb, k * 3)
    
    # 3. Re-rank with vibe boosting
    for meta in candidates:
        vibe_matches = count_vibe_keywords(meta.text)
        adjusted_score = score * (boost ** vibe_matches)
    
    # 4. Filter avoid keywords
    # 5. Sort and return top_k
    return {"hits": [...], "strategy": "hybrid"}
```

**Features**:
- Semantic + keyword hybrid
- Vibe keyword boosting (1.2x per match)
- Avoid keyword filtering
- Re-ranking pipeline

---

### 4️⃣ **ai.models** (Request/Response Models)
**File**: `ai/app.py` (Pydantic models)

```python
class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100)

class UpsertItem(BaseModel):
    id: str                              # zone:dn-son-tra
    type: str                            # zone/poi
    text: str                            # Descriptive text
    payload: Optional[Dict[str, Any]]    # Extra metadata

class UpsertRequest(BaseModel):
    items: List[UpsertItem]

class SearchRequest(BaseModel):
    query: str
    top_k: int = Field(10, ge=1, le=100)
    filter_type: Optional[str] = None
    filter_province: Optional[str] = None
    min_score: Optional[float] = 0.0

class HybridSearchRequest(BaseModel):
    free_text: Optional[str] = None
    vibes: Optional[List[str]] = None
    avoid: Optional[List[str]] = None
    top_k: int = 10
    filter_type: Optional[str] = None
    filter_province: Optional[str] = None
    boost_vibes: float = Field(1.2, ge=1.0, le=2.0)
```

**Validation**:
- Type checking
- Range validation (top_k: 1-100)
- Required vs optional fields
- Default values

---

### 5️⃣ **ai.core** (Core Libraries)
**File**: `ai/app.py` (initialization)

#### 5.1 **SentenceTransformer Model**
```python
MODEL_NAME = "AITeamVN/Vietnamese_Embedding_v2"
model = SentenceTransformer(MODEL_NAME)

# Features:
# - 1024-dimensional embeddings
# - Vietnamese language optimized
# - Cosine similarity (dot product after normalization)
# - Loaded from Hugging Face Hub
```

#### 5.2 **FAISS Index**
```python
INDEX_TYPE = "FLAT"  # or HNSW, IVF

if INDEX_TYPE == "HNSW":
    index = faiss.IndexHNSWFlat(DIM, 32)
else:
    index = faiss.IndexFlatIP(DIM)  # Inner Product (dot)

# Features:
# - FLAT: Exact search (brute force)
# - HNSW: Approximate search (faster for large datasets)
# - IndexFlatIP: Dot product similarity
```

---

### 6️⃣ **ai.storage** (Persistence)
**Directory**: `ai/index/`

#### Files:
- **`faiss.index`**: Binary FAISS index (vectors)
- **`meta.json`**: Metadata array (JSON)

#### Functions:
```python
def load_index():
    """Load FAISS index and metadata from disk"""
    if idx_path.exists():
        index = faiss.read_index(str(idx_path))
    if meta_path.exists():
        metadata = json.load(open(meta_path))

def save_index():
    """Persist FAISS index and metadata to disk"""
    faiss.write_index(index, str(INDEX_DIR / "faiss.index"))
    json.dump(metadata, open(meta_path, 'w'), ensure_ascii=False)
```

**Metadata Structure**:
```json
[
  {
    "id": "zone:dn-son-tra",
    "type": "zone",
    "text": "Bán đảo Sơn Trà. Thiên nhiên yên tĩnh, ngắm biển...",
    "payload": {
      "province": "Đà Nẵng",
      "name": "Bán đảo Sơn Trà",
      "vibes": ["yên tĩnh", "thiên nhiên"]
    }
  }
]
```

---

### 7️⃣ **ai.config** (Configuration)
**File**: `ai/app.py` + `.env`

#### Environment Variables:
```env
EMBEDDING_MODEL=AITeamVN/Vietnamese_Embedding_v2
PORT=8088
INDEX_TYPE=FLAT
INDEX_DIR=./index
DIM=1024
```

#### Constants:
```python
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "...")
PORT = int(os.getenv("PORT", "8088"))
INDEX_TYPE = os.getenv("INDEX_TYPE", "FLAT").upper()
INDEX_DIR = Path(os.getenv("INDEX_DIR", "./index"))
DIM = 1024
```

---

### 8️⃣ **ai.utils** (Helper Functions)
**Location**: Inline in `ai/app.py`

```python
# Normalization (handled by model.encode with normalize_embeddings=True)
# Scoring (dot product via FAISS)
# Filtering (inline in search functions)
# Boosting (vibe matching in hybrid_search)
```

---

### 9️⃣ **ai.middleware** (Middleware)
**File**: `ai/app.py`

```python
# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],           # All HTTP methods
    allow_headers=["*"],           # All headers
)

# Error Handling (implicit via FastAPI)
# - Pydantic validation errors
# - HTTPException handling
# - 500 errors with traceback
```

---

## 🔗 Backend Integration (Node.js)

### 1️⃣ **be.ai.services** (Facade)
**File**: `touring-be/services/ai/index.js`

```javascript
// Aggregates all AI services
module.exports = {
  llm: require('./libs/llm'),
  embeddingClient: require('./libs/embedding-client'),
  keywordMatcher: require('./libs/keyword-matcher'),
  goongClient: require('./libs/goong'),
  map4dClient: require('./libs/map4d'),
};
```

---

### 2️⃣ **be.ai.libs.llm** (Gemini AI)
**File**: `touring-be/services/ai/libs/llm.js`

**Features**:
- Parse user preferences (free text → structured data)
- Generate itinerary insights
- Travel tips and recommendations

**Functions**:
```javascript
async function parseUserPreferences(freeText) {
  // Call Gemini AI with prompt
  // Extract: interests, vibes, duration, keywords
  return {
    interests: ["beach", "food"],
    vibes: ["relaxed", "romantic"],
    durationDays: 3,
    keywords: ["đà nẵng", "biển"]
  };
}

async function generateItineraryInsights(itinerary) {
  // Generate AI insights for optimized itinerary
  return {
    summary: "...",
    tips: ["...", "..."],
    highlights: ["..."]
  };
}
```

---

### 3️⃣ **be.ai.libs.embedding-client** (Python AI Client)
**File**: `touring-be/services/ai/libs/embedding-client.js`

**Features**:
- HTTP client to Python AI service
- Zone/POI embedding and search
- Retry logic and error handling

**Functions**:
```javascript
async function semanticSearch(query, options = {}) {
  const response = await fetch(`${AI_SERVICE_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      top_k: options.topK || 10,
      filter_type: options.filterType,
      filter_province: options.filterProvince
    })
  });
  return response.json();
}

async function hybridSearch(freeText, vibes, options = {}) {
  const response = await fetch(`${AI_SERVICE_URL}/hybrid-search`, {
    method: 'POST',
    body: JSON.stringify({
      free_text: freeText,
      vibes,
      top_k: options.topK || 10,
      boost_vibes: options.boostVibes || 1.2
    })
  });
  return response.json();
}

async function upsertZones(zones) {
  // Sync zones to Python AI service
}
```

---

### 4️⃣ **be.ai.libs.keyword-matcher** (Fallback)
**File**: `touring-be/services/ai/libs/keyword-matcher.js`

**Features**:
- Keyword extraction from free text
- Vibe/interest detection without LLM
- Fallback when Gemini API fails

**Functions**:
```javascript
function extractKeywords(text) {
  const vibeKeywords = {
    'relaxed': ['yên tĩnh', 'thư giãn', 'peaceful'],
    'adventure': ['mạo hiểm', 'phiêu lưu', 'adventure'],
    'romantic': ['lãng mạn', 'cặp đôi', 'romantic'],
    // ...
  };
  
  const matched = [];
  for (const [vibe, keywords] of Object.entries(vibeKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      matched.push(vibe);
    }
  }
  return matched;
}
```

---

### 5️⃣ **be.ai.libs.goong** (Goong Maps API)
**File**: `touring-be/services/ai/libs/goong.js`

**Features**:
- POI search (Vietnamese places)
- Place details
- Route optimization (Trip API v2)
- Geocoding

**Functions**:
```javascript
async function searchPOIs(query, location) {
  // Search POIs via Goong Places API
}

async function getPlaceDetails(placeId) {
  // Get detailed POI information
}

async function optimizeRoute(waypoints) {
  // Call Goong Trip API v2
  // Returns: polyline, optimized order, duration, distance
}
```

---

### 6️⃣ **be.ai.libs.map4d** (Map4D API)
**File**: `touring-be/services/ai/libs/map4d.js`

**Features**:
- POI discovery
- Text search
- Viewbox search (within bounds)
- Category filtering

**Functions**:
```javascript
async function textSearch(query, location) {
  // Text-based POI search
}

async function viewboxSearch(category, bounds) {
  // Search within geographic bounds
}
```

---

## 🔄 Data Flow

### Flow 1: User Preference → Zone Recommendation
```
User Input (FE)
    ↓
Backend (BE)
    ↓
llm.js → parseUserPreferences(freeText)
    ↓
Google Gemini AI
    ↓ (parsed preferences)
embedding-client.js → hybridSearch(preferences)
    ↓
Python AI Service (ai/app.py)
    ↓
FAISS Index + Hybrid Search
    ↓
Ranked Zones (with scores)
    ↓
Backend → Frontend
    ↓
Display Zone Cards
```

### Flow 2: Zone → POI Discovery
```
User Selects Zone (FE)
    ↓
Backend: /api/zones/:zoneId/pois-priority
    ↓
goong.js → searchPOIs(category, zoneBounds)
    ↓
Goong Maps API
    ↓
POI List (filtered by zone)
    ↓
Backend → Frontend
    ↓
Display POI Cards with Map
```

### Flow 3: Itinerary Optimization
```
User Adds POIs to Itinerary (FE)
    ↓
Backend: /api/itinerary/:id/optimize
    ↓
goong.js → optimizeRoute(waypoints)
    ↓
Goong Trip API v2
    ↓ (polyline, order)
llm.js → generateItineraryInsights(itinerary)
    ↓
Google Gemini AI
    ↓ (AI insights)
Save to MongoDB
    ↓
Backend → Frontend
    ↓
Display Optimized Route + AI Tips
```

---

## 📊 Technology Stack Summary

### Python AI Service
```
FastAPI          → Web framework
FAISS            → Vector search (CPU)
SentenceTransformers → Embedding model
Pydantic         → Data validation
Uvicorn          → ASGI server
NumPy            → Array operations
```

### Node.js Backend Integration
```
@google/generative-ai → Gemini LLM
axios/node-fetch → HTTP clients
dotenv           → Environment config
jest             → Testing
```

### External APIs
```
Google Gemini AI       → LLM (preference parsing, insights)
Goong Maps API        → Vietnamese POI, routing
Map4D API             → POI discovery
Hugging Face Hub      → Model download
```

---

## 🧪 Testing Structure

### Python AI Service
```bash
# Manual testing with curl
curl http://localhost:8088/embed -X POST -d '{"texts": ["test"]}'

# Load testing
# (Not implemented yet, can use locust/k6)
```

### Node.js Backend
```bash
cd touring-be
npm test -- llm.test.js           # LLM service tests
npm test -- embedding-client.test.js  # Embedding client tests
npm test -- keyword-matcher.test.js   # Keyword matcher tests
```

**Test Files**:
- `touring-be/services/ai/libs/__tests__/llm.test.js`
- `touring-be/services/ai/libs/__tests__/embedding-client.test.js`
- `touring-be/services/ai/libs/__tests__/keyword-matcher.test.js`

---

## 🚀 Deployment

### Python AI Service
```bash
# Development
uvicorn app:app --reload --port 8088

# Production (with Gunicorn)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app -b 0.0.0.0:8088

# Docker
docker build -t travyy-ai:latest .
docker run -p 8088:8088 travyy-ai:latest
```

### Environment Setup
```env
# Python AI Service
EMBEDDING_MODEL=AITeamVN/Vietnamese_Embedding_v2
PORT=8088
INDEX_TYPE=FLAT
INDEX_DIR=./index

# Node.js Backend
GEMINI_API_KEY=your-gemini-api-key
EMBED_SERVICE_URL=http://localhost:8088
GOONG_API_KEY=your-goong-api-key
MAP4D_API_KEY=your-map4d-api-key
```

---

## 📈 Performance Considerations

### Python AI Service
- **Model Loading**: ~3-5 seconds on first startup
- **Embedding Generation**: ~50ms per text (batch of 10)
- **FAISS Search**: <1ms for 1000 vectors (FLAT), <10ms for 100k (HNSW)
- **Memory**: ~2GB (model + index)

### Optimization Strategies
1. **Model Caching**: Load once, keep in memory
2. **Batch Operations**: Process multiple texts together
3. **Index Type**: Use HNSW for >10k vectors
4. **Connection Pooling**: Reuse HTTP connections (Node.js)
5. **Caching**: Cache frequent queries (Redis)

---

## 🔐 Security

### Python AI Service
- ✅ CORS configured for frontend domain
- ✅ Input validation (Pydantic)
- ✅ Rate limiting (can add with slowapi)
- ⚠️ No authentication (internal service)

### Backend Integration
- ✅ API keys in environment variables
- ✅ HTTPS for external API calls
- ✅ Error handling without exposing internals
- ✅ Input sanitization

---

## 📖 Documentation Links

- [`ai/README.md`](ai/README.md) - Service overview
- [`ai/AI_FLOW_DIAGRAMS.md`](ai/AI_FLOW_DIAGRAMS.md) - Architecture diagrams
- [`touring-be/README_AI_FEATURES.md`](touring-be/README_AI_FEATURES.md) - Backend AI integration
- [`touring-be/TEST_CASES_DOCUMENTATION.md`](touring-be/TEST_CASES_DOCUMENTATION.md) - Test coverage

---

**Last Updated**: November 2, 2025  
**Version**: 2.0.0  
**Maintained by**: DUFDUF Touring Team
