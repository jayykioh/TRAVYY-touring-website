# 📊 Vector Data Flow & Caching Architecture

## ❓ Câu Hỏi: Vector Lấy Từ Đâu?

**Bạn hỏi:** 
- Vectors lấy từ meta.json hay embedding-client?
- Nếu AI sync zones từ MongoDB, sau này cập nhập zones có tự cập nhập không?

**Trả lời:** ✅ Hệ thống **TỰ ĐỘNG** cập nhập + lấy từ **FAISS INDEX** (không phải meta.json)

---

## 🔄 Data Flow Chi Tiết

```
┌─────────────────────────────────────────────────────────────────┐
│                    VECTOR DATA SOURCES                           │
└─────────────────────────────────────────────────────────────────┘

INITIAL SYNC (Server Startup)
═══════════════════════════════════════════════════════════════════
┌────────────────┐
│   MongoDB      │ (49 active zones)
│   Database     │
└────────┬───────┘
         │ 1. Backend fetches zones
         ▼
┌────────────────────────┐
│ touring-be/server.js   │
│ checkServices()        │
│ await syncZones(true)  │ ← Auto-sync on startup
└────────────┬───────────┘
             │ 2. Call POST /upsert
             ▼
┌──────────────────────────────┐
│ Python app.py /upsert        │
│ - Remove old metadata        │
│ - Add new metadata           │
│ - Rebuild FAISS index        │ ← VECTORS created here!
│ - Save faiss.index + meta.json
└──────────────────┬───────────┘
                   │ 3. FAISS Index created
                   ▼
        ┌──────────────────────┐
        │ ai/index/            │
        ├──────────────────────┤
        │ faiss.index    ← 49 vectors (MAIN)
        │ meta.json      ← 49 items (BACKUP)
        └──────────────────────┘


SERVING QUERIES (Zone Discovery)
═══════════════════════════════════════════════════════════════════
┌────────────────────────┐
│  Frontend (React)      │
│  Select vibes + text   │
└────────────┬───────────┘
             │ POST /api/discover
             │ {vibes, freeText, userLocation}
             ▼
┌────────────────────────┐
│  touring-be/routes/    │
│  discover.routes.js    │
└────────────┬───────────┘
             │ 1. Call Python /search
             │ with query + filters
             ▼
┌──────────────────────────────┐
│  Python app.py /search       │
│  Search in MEMORY index      │ ← Uses FAISS (not meta.json!)
│  - Load FAISS vectors        │
│  - Encode query              │
│  - Find top-k                │
│  - Return hits with scores   │
└──────────────────┬───────────┘
                   │ Response with zones
                   ▼
┌────────────────────────┐
│  Backend receives      │
│  10 zones + scores     │
│  Apply proximity bonus │
│  Return to frontend    │
└────────────┬───────────┘
             │
             ▼
┌────────────────────────┐
│  Frontend displays     │
│  Ranked zone list      │
└────────────────────────┘


LATER UPDATE (Admin updates zones in MongoDB)
═══════════════════════════════════════════════════════════════════
┌────────────────────┐
│  Admin Portal      │
│  Update zone data  │
└────────────┬───────┘
             │ Save to MongoDB
             ▼
┌────────────────────┐
│  MongoDB Database  │ (Zone updated)
└────────────┬───────┘
             │ ⚠️ BUT: FAISS index still has OLD vectors!
             │
             │ Option 1: Manual sync (on-demand)
             │ Option 2: Auto-sync on interval
             │ Option 3: Webhook trigger
             ▼
┌────────────────────────┐
│  Call POST /upsert     │
│  with updated zones    │
└────────────┬───────────┘
             │ 1. Remove old: old_zone_id
             │ 2. Add new: new_zone_data
             │ 3. Rebuild FAISS completely
             │ 4. Save to disk
             ▼
        ┌──────────────────────┐
        │ FAISS Index Updated  │
        │ 49 new vectors       │
        │ (reflects latest DB) │
        └──────────────────────┘
```

---

## 🔑 KEY INSIGHT: Vectors Lấy Từ Đâu?

### ❌ Vectors KHÔNG lấy từ meta.json

```python
# WRONG: meta.json chỉ là backup
with open("meta.json") as f:
    metadata = json.load(f)
    # This is metadata (payload, text), NOT vectors
```

### ✅ Vectors lấy từ FAISS INDEX (In-Memory)

```python
# CORRECT: Search sử dụng FAISS index
@app.post("/search")
def search(req: SearchRequest):
    # index là in-memory FAISS
    scores, indices = index.search(query_emb, k=10)
    # ↑ Lấy vectors từ index, không từ file!
    
    # meta.json chỉ dùng để get metadata của kết quả
    for idx in indices[0]:
        meta = metadata[idx]  # Lấy payload từ meta.json
```

**Quy trình:**
1. Query embedding → encode text into vector
2. Search vector trong FAISS **in-memory index**
3. Get top-k matches (indices only)
4. Fetch metadata từ `metadata` list (source: meta.json)

---

## ⚙️ Metadata vs Vectors

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COMPONENTS                           │
├─────────────────────────────────────────────────────────────┤
│ METADATA (meta.json)                                        │
│ ────────────────────────                                    │
│ {"id": "zone:da-nang-son-tra",                             │
│  "type": "zone",                                           │
│  "text": "Bán đảo Sơn Trà - Đà Nẵng - yên tĩnh...",        │
│  "payload": {                                               │
│    "name": "Bán đảo Sơn Trà",                              │
│    "province": "DA-NANG",                                  │
│    "description": "...",                                    │
│    "vibes": ["yên tĩnh", "ảnh đẹp"],                       │
│    "coordinates": [-107.95, 16.05]                         │
│  }}                                                          │
│                                                              │
│ VECTORS (faiss.index)                                       │
│ ──────────────────────                                      │
│ [0.023, -0.045, 0.156, ..., -0.089]  ← 1024 dimensions   │
│ (Semantic representation của "text" field)                  │
│                                                              │
│ Relationship:                                                │
│ metadata[i] ←→ vectors[i]                                  │
│ (Cùng index i)                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Auto-Update Mechanism

### Hiện Tại (Current Setup)

```javascript
// touring-be/server.js
checkServices().then(() => {
  // Auto-sync on server startup
  await syncZones(true);  // ← Automatically called!
  app.listen(PORT);
});
```

**When:** Mỗi lần backend server start lại → auto sync  
**Result:** FAISS index luôn match MongoDB

### Full Auto-Sync (Optional Enhancement)

```javascript
// Could add interval-based sync
setInterval(async () => {
  await syncZones(true);  // Re-sync every 30 minutes
}, 30 * 60 * 1000);
```

### Webhook Trigger (Optional Enhancement)

```javascript
// Admin cập nhập zone → trigger sync
app.post("/api/zones/:id", authRequired, async (req, res) => {
  const zone = await Zone.findByIdAndUpdate(req.params.id, req.body);
  
  // Immediately sync updated zone
  await syncZones(true);  // ← Instant update!
  
  res.json(zone);
});
```

---

## 📊 Example: Zone Updated

### Scenario

```
1. Admin updates zone name
   "Bán đảo Sơn Trà" → "Son Tra Peninsula"
   
2. MongoDB saved with new name

3. How does FAISS know?
   → Need to call /upsert again with new data
   → Rebuild vectors with new text
```

### Current Implementation

```python
# touring-be/services/embedding-sync-zones.js
async function syncZones(isAutomatic = false) {
  // 1. Fetch ALL zones from MongoDB
  const zones = await Zone.find({ active: true });
  
  // 2. Send to Python /upsert
  const response = await fetch("http://localhost:8088/upsert", {
    body: JSON.stringify({
      items: zones.map(z => ({
        id: z._id.toString(),
        type: "zone",
        text: z.name + " - " + z.description + "...",  // ← Latest data
        payload: {
          name: z.name,
          province: z.province,
          // ... all latest fields
        }
      }))
    })
  });
  
  // 3. Python rebuilds index with new vectors
  // 4. meta.json + faiss.index updated
}
```

### How Update Works

```
1️⃣  Admin changes zone in MongoDB
    MongoDB: zone.name = "Son Tra Peninsula"

2️⃣  Backend detects change (on next startup or webhook)
    → Call syncZones(true)

3️⃣  Python receives ALL zones (including updated one)
    → Re-embed with new text
    → Rebuild entire FAISS index
    → metadata[i].text has new name
    → vectors[i] is new embedding

4️⃣  Next search query uses updated vectors
    → Results reflect latest zone data
```

---

## ⚡ Performance Notes

### Fast Path: Query Search
```
Query → Python /search → FAISS (in-memory) → Return
⏱️ Time: ~40-50ms

✅ Fast because:
- Index in memory (loaded once)
- No file I/O
- Direct vector operations
```

### Slow Path: Sync Update
```
MongoDB → Fetch zones → Python /upsert → Re-embed → Rebuild index → Save
⏱️ Time: ~3 seconds (for 49 zones)

✅ OK because:
- Only on startup or admin action
- Not during queries
- Can optimize with async
```

---

## 🎯 Summary: Vector Sources

| Operation | Vector Source | Data Source |
|-----------|---------------|-------------|
| **Search (query)** | FAISS index (in-memory) | Loaded from faiss.index file |
| **Get metadata** | `metadata` list (in-memory) | Loaded from meta.json file |
| **Rebuild index** | Model embedding output | Created fresh on every upsert |
| **Backup/restore** | faiss.index file | Persisted to disk |

---

## 🔐 Consistency Guarantee

```
BEFORE:
  MongoDB: 49 zones (some updated)
  FAISS: 49 old vectors (from previous sync)
  ❌ Mismatch: Data diverged

SYNC HAPPENS:
  1. Fetch all 49 zones from MongoDB
  2. Remove old entries from metadata
  3. Add new entries from MongoDB
  4. Re-embed all text → new vectors
  5. Rebuild FAISS completely
  6. Save both meta.json + faiss.index

AFTER:
  MongoDB: 49 zones (latest)
  FAISS: 49 new vectors (from latest data)
  ✅ Perfect sync: metadata text = zone data
```

---

## 🚀 Recommended Update Strategy

### Option 1: Auto-Sync on Startup (Current) ✅

```javascript
// touring-be/server.js
checkServices().then(() => {
  await syncZones(true);  // Auto-sync
  app.listen(PORT);
});
```

**Pros:** Simple, no extra setup  
**Cons:** Only updates on server restart  
**Best for:** Development, small updates

### Option 2: Interval-Based Sync (Production)

```javascript
// Sync every 30 minutes
setInterval(async () => {
  console.log("📦 Periodic sync starting...");
  await syncZones(true);
}, 30 * 60 * 1000);
```

**Pros:** Regular updates, no server restart needed  
**Cons:** Delayed updates (up to 30 min)  
**Best for:** Production with periodic changes

### Option 3: Webhook Sync (Recommended)

```javascript
// Sync immediately when zone updated
app.post("/api/zones/:id", authRequired, async (req, res) => {
  const updated = await Zone.findByIdAndUpdate(req.params.id, req.body);
  
  // Immediate sync
  await syncZones(true);
  
  res.json(updated);
});
```

**Pros:** Instant updates, no delay  
**Cons:** Extra calls to embedding service  
**Best for:** Production with important changes

---

## 📝 Current Implementation Status

```
✅ Auto-sync on startup: DONE
   - server.js calls syncZones(true) on startup
   
⏳ Interval-based sync: NOT IMPLEMENTED
   - Could add if needed
   
⏳ Webhook sync: NOT IMPLEMENTED
   - Could add for instant updates
   
✅ Logging: DONE
   - All sync operations logged
   - Can monitor with log_viewer.py
```

---

## 🎓 Key Takeaway

**Vectors không lấy từ meta.json, mà từ FAISS index:**

```
Query Flow:
  Frontend → Backend → Python /search → FAISS index → vectors
  
Meta.json Role:
  Only used to get zone metadata (name, description, etc)
  for the search results
  
Update Flow:
  MongoDB zone changed → syncZones() → Python /upsert →
  Rebuild FAISS from scratch → Next search uses new vectors
```

**Sau khi AI sync zones, cập nhập zones sẽ tự động:**
- ✅ Khi server restart (auto-sync on startup)
- ⏳ Có thể thêm interval-based hoặc webhook sync nếu cần instant updates

---

**Current System:** ✅ Works correctly  
**Vectors:** ✅ From FAISS index (in-memory)  
**Auto-update:** ✅ On server startup  
**Optional:** Can add interval/webhook for instant updates
