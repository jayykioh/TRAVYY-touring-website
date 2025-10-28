# TRAVYY - AI-Powered Travel Itinerary Creator

## Architecture

# Embedding Service (FastAPI + FAISS)

A high-performance microservice for Vietnamese semantic search using **AITeamVN/Vietnamese_Embedding_v2** (1024-dim, dot product).




┌─────────────────────────────────────────────────────────────┐
│ Frontend (React) │
│ - Vibe selection + Free text input │
│ - Zone discovery & POI exploration │
│ - Itinerary builder with drag-n-drop │
└────────────────────┬────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (Node.js/Express) │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Discovery Service │ │
│ │ - Parse user input (LLM) │ │
│ │ - Hybrid zone matching (Embedding + Keyword) │ │
│ └──────────────────┬───────────────────────────────────┘ │
│ │ │
│ ┌──────────────────▼───────────────────────────────────┐ │
│ │ Zone Service │ │
│ │ - Zone POI finder (Goong Places API) │ │
│ │ - Smart POI scoring (category + vibes) │ │
│ └──────────────────┬───────────────────────────────────┘ │
│ │ │
│ ┌──────────────────▼───────────────────────────────────┐ │
│ │ Itinerary Service │ │
│ │ - Route optimization (Goong Trip V2) │ │
│ │ - Timeline scheduling │ │
│ │ - AI insights generation (LLM) │ │
│ └───────────────────────────────────────────────────────┘ │
└────────────────┬──────────────────────┬─────────────────────┘
│ │
▼ ▼
┌──────────────────────────┐ ┌────────────────────────────┐
│ Python Embedding Service │ │ MongoDB Database │
│ - Vietnamese embeddings │ │ - Users │
│ - FAISS vector search │ │ - Itineraries │
│ - Hybrid search (vibes) │ │ - Sessions │
└──────────────────────────┘ └────────────────────────────┘



## Features
- `/embed`: Batch embeddings (normalized float32).
- `/upsert`: Add/update vectors to FAISS index with metadata persistence.
- `/search`: Top-k ANN search (FLAT/HNSW/IVF).
- `/stats`, `/healthz`, `/reset`.
- CPU-friendly; optional IVF/HNSW for speed with large corpora.
- Dockerfile included.

## Quick Start (Local)
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --reload --port 8088
```

## Docker
```bash
docker build -t embedding-service:latest .
docker run --rm -p 8088:8088 embedding-service:latest
```

## REST Examples
```bash
# Embed
curl -s http://localhost:8088/embed -X POST -H "Content-Type: application/json"   -d '{"texts": ["đi một tuần với người yêu, yên tĩnh, ít ồn, ngắm hoàng hôn"]}'

# Upsert Zones
curl -s http://localhost:8088/upsert -X POST -H "Content-Type: application/json" -d @- <<'JSON'
{
  "items": [
    {
      "id": "zone:da-nang-son-tra",
      "type": "zone",
      "text": "Bán đảo Sơn Trà. Thiên nhiên yên tĩnh, ngắm biển, hoàng hôn, ảnh đẹp.",
      "payload": {"province": "Đà Nẵng", "name": "Bán đảo Sơn Trà"}
    },
    {
      "id": "zone:dn-an-thuong",
      "type": "zone",
      "text": "Khu An Thượng. Ẩm thực, bar club, gần biển, sôi động về đêm, phù hợp cặp đôi.",
      "payload": {"province": "Đà Nẵng", "name": "Khu An Thượng"}
    }
  ]
}
JSON

# Search Zone
curl -s http://localhost:8088/search -X POST -H "Content-Type: application/json" -d @- <<'JSON'
{ "query": "đi một tuần với người yêu, thích yên tĩnh, hoàng hôn", "top_k": 5, "filter_type": "zone" }
JSON
```

## Node integration (touring-be)
```js
// services/embeddingClient.js
import fetch from "node-fetch";
const EMB_URL = process.env.EMBED_URL || "http://localhost:8088";

export async function semanticSearch(query, topK=10, filterType=null) {
  const r = await fetch(EMB_URL + "/search", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ query, top_k: topK, filter_type: filterType })
  });
  return r.json(); // { hits: [ {id, score, type, payload}, ... ] }
}
```

## Tuning
- `INDEX_TYPE`: FLAT (exact), HNSW (fast ANN), IVF (ANN for huge data).
- `BATCH_SIZE`: embedding batch size.
- `HNSW_EF_SEARCH`: ↑ for better recall (slower), ↓ for speed.
- `IVF_NLIST`: number of cells; tune & `index.train` before use.
