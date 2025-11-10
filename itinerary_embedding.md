# 🚀 Touring.vn - AI-Powered Travel Discovery System

## 📦 **Architecture Overview**

```
touring-be/          → Node.js Backend (Express + MongoDB)
  ├── services/
  │   ├── ai/        → AI integration layer
  │   │   └── libs/
  │   │       ├── embedding-client.js  ← FastAPI client
  │   │       ├── llm.js                ← Gemini parser
  │   │       └── keyword-matcher.js    ← Fallback matcher
  │   ├── zones/
  │   │   ├── matcher.js                ← Zone matching logic
  │   │   └── scorer.js                 ← Rule-based scoring
  │   └── embedding-sync-zones.js       ← Sync script
  ├── routes/
  │   └── discover.routes.js            ← /api/discover/parse endpoint
  └── models/
      └── Zones.js

ai/                  → Python FastAPI Service (Embeddings + FAISS)
  ├── app.py         → Main API
  ├── index/         → FAISS index storage
  │   ├── faiss.index
  │   └── meta.json
  └── requirements.txt
```

---

## 🔧 **Setup & Installation**

### **1. Python Embedding Service**

```bash
cd ai
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**Start service:**
```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8088 --reload
```

**Verify:**
```bash
curl http://localhost:8088/healthz
# Expected: {"status":"ok","vectors":39,...}
```

---

### **2. Node.js Backend**

```bash
cd touring-be
npm install
```

**Environment variables (`.env`):**
```env
MONGO_URI=mongodb://localhost:27017/touring
EMBED_SERVICE_URL=http://localhost:8088
GEMINI_API_KEY=your_key_here
PORT=4000
```

**Start backend:**
```bash
npm run dev
```

---

## 📊 **Data Flow - Discovery Endpoint**

### **Request Flow:**

```
1. Frontend POST /api/discover/parse
   ├─ Body: { freeText: "beach, nature, 3 ngày, tiết kiệm" }
   │
2. Backend: discover.routes.js
   ├─ Parse preferences (Gemini LLM → Heuristic fallback)
   │  └─ Extract: vibes, avoid, pace, budget, duration
   │
3. Zone Matcher (matcher.js)
   ├─ Check embedding service availability
   │
   ├─ STRATEGY A: Embedding Search (if service up + index populated)
   │  ├─ Call hybrid-search API
   │  ├─ Get semantic matches (top 20)
   │  └─ Load zones from MongoDB
   │
   ├─ STRATEGY B: Keyword Fallback (if embedding fails)
   │  ├─ Load all zones from MongoDB
   │  └─ Filter by avoid keywords
   │
4. Re-rank with Rule-based Scorer
   ├─ Combine: embedScore * 0.6 + ruleScore * 0.4
   ├─ Boost: hard vibes (+15% each), keywords (+5%)
   ├─ Penalty: avoid matches (-20% each)
   │
5. Return top 10 zones
   └─ Response: { strategy, zones[], reason }
```

---

## 🔄 **Syncing Zones to Embedding Index**

**When to run:**
- First setup (after MongoDB has zones)
- After adding/updating zones in database
- After index corruption

**Command:**
```bash
cd touring-be
node services/embedding-sync-zones.js
```

**Expected output:**
```bash
✅ Connected to MongoDB
📦 Found 39 active zones
✅ Upsert complete: { added: 39, total: 39 }
✅ Index status: { vectors: 39, metadata: 39 }
✅ Test search results: { hits: 5, strategy: 'hybrid' }
```

---

## 🧪 **Testing the Integration**

### **Test 1: Health Check**

```bash
# Backend health
curl http://localhost:4000/api/health

# Expected:
{
  "backend": "ok",
  "mongo": "ok",
  "embedding": {
    "status": "ok",
    "vectors": 39,
    "model": "AITeamVN/Vietnamese_Embedding_v2"
  }
}
```

### **Test 2: Discovery with Embedding**

```bash
curl -X POST http://localhost:4000/api/discover/parse \
  -H "Content-Type: application/json" \
  -d '{
    "freeText": "beach, nature, romantic, 3 ngày, tiết kiệm"
  }'
```

**Expected logs (backend console):**
```bash
✅ [Gemini] Parsed: { vibes: 3, avoid: 0, budget: 'low', duration: 3 }
🔍 [Matcher] Checking embedding service...
✅ [Matcher] Embedding OK → calling hybrid-search...
✅ [EmbedClient] Response: { hits: 12, strategy: 'hybrid' }
📦 [Matcher] Result: 12 hits (hybrid)
   ✅ Mapped 12 candidates
🏆 [Matcher] Top 3: [
  { name: 'Bãi biển Mỹ Khê', embed: '0.78', rule: '0.52', final: '0.68' },
  ...
]
   ✅ Matched 10 zones (strategy: embedding)  ← ✅ AI is working!
```

### **Test 3: Fallback when Service Down**

Stop Python service, then call discovery → should see:
```bash
⚠️ [Matcher] Embedding service down → skipping
🔄 [Matcher] Using keyword matching
   ✅ Matched 10 zones (strategy: keyword)  ← ✅ Graceful fallback
```

---

## 🎯 **Key Features**

### **1. Hybrid Matching Strategy**

| Strategy | Trigger | Method |
|----------|---------|--------|
| **Embedding** | Service up + index populated | Semantic search via FAISS |
| **Keyword** | Service down / empty index | MongoDB query + keyword match |
| **Re-ranking** | Always applied | Rule-based scorer (vibes, avoid, rating) |

### **2. Scoring Algorithm**

```javascript
finalScore = embedScore * 0.6 + ruleScore * 0.4

ruleScore calculation:
  + Hard vibe matches: +15% per match
  + Keywords in text:   +5% per keyword
  + High rating (≥4.0): +0-10% (linear)
  - Avoid keywords:     -20% per match
```

### **3. Parser Fallback Chain**

```
Gemini LLM → Heuristic → Basic extraction
```

**Gemini extracts:**
- Vibes, avoid, pace, budget, duration, groupType
- Handles negation: "không ồn" → avoid: ['noisy']

**Heuristic fallback:**
- Keyword matching for Vietnamese travel terms
- Pattern detection for duration ("3 ngày" → 3)

---

## 📝 **API Endpoints**

### **Backend (Node.js - Port 4000)**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health check |
| `/api/discover/parse` | POST | Parse preferences & match zones |
| `/api/zones` | GET | Get all zones |
| `/api/itinerary` | POST | Create itinerary |

### **Embedding Service (Python - Port 8088)**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/healthz` | GET | Service health |
| `/embed` | POST | Generate embeddings |
| `/upsert` | POST | Add/update vectors |
| `/search` | POST | Basic semantic search |
| `/hybrid-search` | POST | Hybrid search (text + vibes) |

---

## 🐛 **Troubleshooting**

### **Issue: "vectors: 0" in health check**

**Solution:** Run sync script
```bash
node services/embedding-sync-zones.js
```

### **Issue: "fetch is not a function"**

**Solution:** Install node-fetch
```bash
npm install node-fetch@2
```

### **Issue: "MONGO_URI undefined"**

**Solution:** Check `.env` file exists in `touring-be/` with correct path

### **Issue: Embedding always fallback to keyword**

**Check:**
1. Python service running: `curl http://localhost:8088/healthz`
2. Index populated: `vectors > 0`
3. Backend env var: `EMBED_SERVICE_URL=http://localhost:8088`

---

## 📈 **Performance Metrics**

**Current setup (39 zones):**
- Embedding generation: ~2-3s (first time)
- Hybrid search: <100ms
- Total discovery time: 200-300ms (with Gemini) | 50-100ms (heuristic only)

**Scalability:**
- FAISS FLAT index: suitable for <10K vectors
- For >10K: switch to HNSW in `ai/.env`:
  ```env
  INDEX_TYPE=HNSW
  ```

---

## 🔐 **Security Notes**

- Embedding service runs on localhost (no external exposure)
- Gemini API key in `.env` (never commit)
- MongoDB connection string secured
- CORS enabled for frontend origin only

---

## 🚀 **Deployment Checklist**

- [ ] Python service running (port 8088)
- [ ] Node.js backend running (port 4000)
- [ ] MongoDB connected
- [ ] Zones synced to embedding index (`vectors > 0`)
- [ ] Test discovery endpoint returns [`strategy: 'embedding'`](touring-be/routes/discover.routes.js)
- [ ] Frontend can call `/api/discover/parse`

---

## 📞 **Support**

**Logs to check:**
- Backend: `touring-be/logs/` or console output
- Python: uvicorn console output
- MongoDB: `mongod.log`

**Debug mode:**
Enable verbose logging in `ai/app.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## 📚 **References**

- [Sentence Transformers](https://www.sbert.net/)
- [FAISS Documentation](https://github.com/facebookresearch/faiss)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Gemini API](https://ai.google.dev/gemini-api/docs)

---

**Last Updated:** October 28, 2024  
**Version:** 2.0  
**Status:** ✅ Production Ready