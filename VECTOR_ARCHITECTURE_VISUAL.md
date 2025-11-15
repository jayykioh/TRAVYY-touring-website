# Vector Architecture - Visual Reference

## 🎯 Architecture Overview

```
                        TRAVYY EMBEDDING SYSTEM
                     (Vector Search & Sync)


   ┌─────────────────────────────────────────────────────┐
   │           FRONTEND (React)                          │
   │  User selects: vibes + search text                  │
   └──────────────────┬──────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
   [Query Path]            [Admin Update Path]
         │                         │
         │                    MongoDB Database
         │                    (Zone data)
         │                         │
         ▼                         │
   ┌──────────────────┐            │
   │ Backend (Node)   │            │
   │ discover route   │◄───────────┘
   │ ├─ Combine input │
   │ ├─ Fetch location│
   │ └─ Score zones   │
   └────────┬─────────┘
            │
            │ POST /search
            │
            ▼
   ┌──────────────────┐
   │ Python Service   │
   │ /search endpoint │
   │ ├─ Encode query  │
   │ ├─ Search FAISS  │◄──── VECTORS FROM HERE!
   │ └─ Get metadata  │      (in-memory index)
   └────────┬─────────┘
            │
            │ Results
            ▼
   ┌──────────────────┐
   │ Backend scoring  │
   │ + proximity      │
   └────────┬─────────┘
            │
            ▼
   Frontend displays zones


   ┌──────────────────────────────┐
   │ SYNC PROCESS (On Startup)    │
   │                              │
   │ server.js                    │
   │ ├─ Check services OK         │
   │ ├─ await syncZones(true)◄────┼─ AUTO CALLED!
   │ └─ Listen on port 4000       │
   │         │                    │
   │         ▼                    │
   │ Fetch zones from MongoDB     │
   │         │                    │
   │         ▼                    │
   │ Build items with text        │
   │         │                    │
   │         ▼                    │
   │ Call Python /upsert          │
   │         │                    │
   │         ▼                    │
   │ Re-embed all texts           │
   │         │                    │
   │         ▼                    │
   │ Rebuild FAISS index          │
   │         │                    │
   │         ▼                    │
   │ Save: faiss.index + meta.json│
   │         │                    │
   │         ▼                    │
   │ ✅ Ready for queries!        │
   └──────────────────────────────┘
```

---

## 📊 Memory & Disk Layout

```
DISK (Persistent Storage)
═══════════════════════════════════════════════════════════
ai/index/
├─ faiss.index ········· Binary FAISS index (vectors)
│                        Size: ~4-5MB for 49×1024 vectors
│                        Type: IndexFlatIP(1024)
│
└─ meta.json ··········· JSON metadata backup
                         Size: ~2-3KB (49 items)
                         Backup of zone info


MEMORY (Runtime)
═══════════════════════════════════════════════════════════
Python Process (FastAPI)
├─ index ················ FAISS object (49 vectors)
│                        Loaded from faiss.index
│                        Used for: /search queries
│
├─ metadata[] ··········· List of 49 metadata items
│                        Loaded from meta.json
│                        Used for: Getting zone info
│
├─ model ················ SentenceTransformer
│                        Vietnamese_Embedding_v2
│                        Used for: Encoding texts → vectors
│
└─ logger ··············· Logging system
                         Tracks all operations
                         Writes to: embedding_sync.log
```

---

## 🔄 Query Execution Timeline

```
T=0ms
│
├─ User submits query
│  "Đi Đà Nẵng với người yêu, yên tĩnh"
│
T=5ms
├─ Backend /discover called
│  GET /api/discover
│  {vibes: ["yên tĩnh"], freeText: "đi người yêu"}
│
T=10ms
├─ Backend processing
│  ├─ Combine: vibes + text
│  ├─ Get user location (if exists)
│  └─ Prepare Python call
│
T=20ms
├─ Network to Python /search
│  POST http://localhost:8088/search
│  {query: "...", top_k: 10}
│
T=25ms
├─ Python encoding
│  query text → 1024-dim vector
│  Time: ~5ms (small query)
│
T=30ms
├─ FAISS search ◄──── VECTORS USED HERE
│  query_vector × all_vectors (49)
│  Top-10 scores & indices
│  Time: <1ms (fast in-memory)
│
T=35ms
├─ Get metadata
│  For each top-10 result:
│    metadata[idx] → name, description, vibes
│  Time: ~3ms
│
T=40ms
├─ Python response
│  [{id, score, type, payload}, ...]
│
T=45ms
├─ Network to Backend
│
T=50ms
├─ Backend scoring
│  ├─ Apply proximity bonus (if location set)
│  ├─ Re-sort if needed
│  └─ Return top-10 zones
│
T=100ms
├─ Frontend receives
│  Displays ranked zone list
│
T=200ms
└─ User sees results ✓


TOTAL: ~100-200ms from query to display
```

---

## 🔄 Update/Sync Timeline

```
T=0s
│
├─ Admin updates zone in MongoDB
│  db.zones.updateOne({...}, {$set: {...}})
│
T=0s
├─ MongoDB saved
│
T=0s (Option A: On startup)
├─ Server restarts
│  $ npm run dev
│
OR (Option B: On webhook)
├─ POST /api/zones/:id triggers sync
│
T=0s
├─ server.js: checkServices().then(...)
│  └─ await syncZones(true)
│
T=0.2s
├─ Fetch zones from MongoDB
│  Zone.find({active: true})
│  Result: 49 zones with latest data
│
T=0.5s
├─ Build sync items
│  For each zone: {id, type, text, payload}
│
T=1s
├─ Network to Python /upsert
│  POST /upsert {items: [49 zones]}
│
T=1.5s
├─ Python processing
│  1. Update metadata (remove old)
│     Time: ~10ms
│
│  2. Add new items
│     Time: ~20ms
│
│  3. Encode all 49 texts
│     Time: ~2000ms ◄──── MAIN TIME!
│     (Batch encoding: 17.1 texts/sec)
│
│  4. Rebuild FAISS
│     index = IndexFlatIP(1024)
│     index.add(embeddings)
│     Time: ~50ms
│
│  5. Save to disk
│     faiss.index
│     meta.json
│     Time: ~200ms
│
T=3.5s
├─ Python response: {ok: true, total: 49}
│
T=4s
├─ Backend logged sync completion
│
T=4s+
├─ Next /search query
│  Uses NEW vectors ✓
│  Results reflect latest zones ✓
│
└─ ✅ SYNC COMPLETE


TOTAL SYNC TIME: ~3.5 seconds
(90% of time: Embedding texts)
```

---

## 🎯 Vector Lookup Mechanism

```
Step 1: User Query
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input: "Đà Nẵng yên tĩnh người yêu"

Step 2: Encode Query
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model: Vietnamese_Embedding_v2
Text → Vector: [0.023, -0.045, 0.156, ..., -0.089]
Dimension: 1024
Size: ~4KB

Step 3: Search in FAISS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Query Vector (1024-dim)
        │
        ├─ Compare with Vector[0] → score 0.95
        │  Vector[0] = Bán đảo Sơn Trà
        │
        ├─ Compare with Vector[1] → score 0.92
        │  Vector[1] = Khu An Thượng
        │
        ├─ Compare with Vector[2] → score 0.88
        │  Vector[2] = Bà Nà Hills
        │
        ├─ ... (46 more comparisons)
        │
        └─ Top 10: [idx0, idx1, idx2, ..., idx9]

Step 4: Fetch Metadata
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For idx=0:
  metadata[0] = {
    "id": "zone:da-nang-son-tra",
    "type": "zone",
    "text": "Bán đảo Sơn Trà ...",
    "payload": {
      "name": "Bán đảo Sơn Trà",
      "province": "DA-NANG",
      "vibes": ["yên tĩnh", "ảnh đẹp"],
      "description": "Thiên nhiên yên tĩnh ...",
      "coordinates": [-107.95, 16.05]
    }
  }

Step 5: Return Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[
  {
    "id": "zone:da-nang-son-tra",
    "score": 0.95,
    "name": "Bán đảo Sơn Trà",
    "province": "DA-NANG",
    "vibes": ["yên tĩnh", "ảnh đẹp"]
  },
  {
    "id": "zone:da-nang-an-thuong",
    "score": 0.92,
    ...
  },
  ...
]
```

---

## 📈 Consistency Verification

```
EVERY SYNC CHECKS:

Before:                 After:
────────────────       ──────────────────
metadata: []           metadata: 49 items
vectors: 0             vectors: 49

Remove old:
metadata = 49 items kept (if some existed)

Add new:
metadata += 49 new items

Rebuild FAISS:
index.ntotal = 49

Verify:
✅ metadata.count == index.ntotal
   49 == 49? YES!

Log:
[Verify] ✅ CONSISTENT (49 = 49)

Save:
faiss.index ✓
meta.json ✓
```

---

## 🚀 Performance Characteristics

```
OPERATION               TIME        NOTES
────────────────────────────────────────────────────────
Query encoding          5-10ms      Text → vector
FAISS search (49 vectors) 1-5ms     IP product x49
Metadata fetch          3-10ms      Get zone info
Network (localhost)     10-20ms     Loop back
TOTAL QUERY             40-50ms     ⚡ Fast!

────────────────────────────────────────────────────────

Embed 1 zone text       40-50ms     ~20 texts/sec
Embed 49 zones          2000-2500ms Total for batch
Rebuild FAISS           50-100ms    Create index + add vectors
Save to disk            200-500ms   Both files
TOTAL SYNC              2.5-3.5s    ⏱️  But offline

────────────────────────────────────────────────────────

Daily queries           ~100-200ms each
Daily syncs             ~3.5s each (maybe once)
```

---

## 🔐 Safety Checks

```
ON EVERY UPSERT:
├─ Check: metadata.count == index.ntotal
├─ Log: Operation details
├─ Verify: All vectors added
└─ Save: Both meta.json + faiss.index

RECOVERY IF MISMATCH:
├─ Read meta.json
├─ Check index.ntotal
├─ If different:
│  ├─ Delete faiss.index
│  ├─ Rebuild from metadata
│  └─ Verify again
└─ Log: Recovery action

MONITORING:
├─ python log_viewer.py compare
├─ python analyze_vectors.py
└─ grep "❌" embedding_sync.log
```

---

**Status:** ✅ All vectors in-memory (FAISS)  
**Speed:** ✅ ~50ms queries, ~3s syncs  
**Consistency:** ✅ Verified on every sync  
**Auto-update:** ✅ On server startup
