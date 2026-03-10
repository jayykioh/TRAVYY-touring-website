"""
ai-embed: Lightweight embedding + FAISS search service.

Architecture:
  - Embeddings: HuggingFace Inference API (no local model, ~0 MB RAM)
  - Vector storage: FAISS IndexFlatIP in-memory (~1 MB for 100 zones)
  - Total RAM: ~80 MB (vs 500 MB with local PyTorch model)

Endpoints:
  GET  /healthz         Health + vector count
  POST /embed           Embed text(s) via HF API
  POST /upsert          Rebuild FAISS index from items (full replace)
  POST /search          Basic semantic search
  POST /hybrid-search   Weighted free_text + vibes search
"""

import os
import math
from typing import Any, Dict, List, Optional, Union

import faiss
import httpx
import logging
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# =================== Config ===================

EMBED_PROVIDER = os.getenv("EMBED_PROVIDER", "hf_inference")
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_NAME = os.getenv(
    "MODEL_NAME",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
PORT = int(os.getenv("PORT", 8088))

# =================== App ===================

app = FastAPI(title="ai-embed", description="HF-backed embedding + FAISS search")
logger = logging.getLogger("uvicorn.error")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://travyytouring.page",
        "https://www.travyytouring.page",
        "https://api.travyytouring.page",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================== FAISS state (in-memory, rebuilt on /upsert) ===================

_index: Optional[faiss.Index] = None
_meta: List[Dict[str, Any]] = []  # [{id, type, payload}]
_dim: Optional[int] = None

# =================== Pydantic models ===================


class EmbedRequest(BaseModel):
    # Accept both 'text' (old) and 'texts' (new) field names
    text: Optional[Union[str, List[str]]] = None
    texts: Optional[Union[str, List[str]]] = None


class EmbedResponse(BaseModel):
    vectors: List[List[float]]


class UpsertItem(BaseModel):
    id: str
    type: Optional[str] = "zone"
    text: str
    vector: Optional[List[float]] = None  # pre-computed — skips HF API call
    payload: Optional[Dict[str, Any]] = {}


class UpsertRequest(BaseModel):
    items: List[UpsertItem]


class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 10
    filter_type: Optional[str] = None
    filter_province: Optional[str] = None
    min_score: Optional[float] = None


class HybridSearchRequest(BaseModel):
    free_text: Optional[str] = ""
    vibes: Optional[List[str]] = []
    avoid: Optional[List[str]] = []
    top_k: Optional[int] = 10
    filter_type: Optional[str] = None
    filter_province: Optional[str] = None
    boost_vibes: Optional[float] = 1.2


# =================== HF Inference helper ===================


def _normalize_texts(texts: List[str]) -> List[str]:
    out = []
    for t in texts:
        s = str(t).strip() if t else ""
        out.append(" ".join(s.split()))
    return out


import asyncio

async def _get_embeddings(texts: List[str]) -> List[List[float]]:
    """Embed texts via HuggingFace Inference API with retry. Returns list of float vectors."""
    texts = _normalize_texts(texts)

    if not HF_TOKEN:
        raise HTTPException(status_code=500, detail="HF_TOKEN is not configured")

    # HF Inference API for feature-extraction (embeddings)
    # POST /models/{model_id} with {"inputs": [...]} returns list of vectors directly
    url = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": texts}

    last_err = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                r = await client.post(url, json=payload, headers=headers)
                # 503 = model loading, retry with backoff
                if r.status_code == 503:
                    retry_after = int(r.headers.get("X-Wait-For-Model", "20"))
                    logger.warning(f"HF model loading, waiting {retry_after}s (attempt {attempt+1})")
                    await asyncio.sleep(min(retry_after, 30))
                    last_err = Exception(f"503 model loading (attempt {attempt+1})")
                    continue
                r.raise_for_status()
                data = r.json()

                # Feature-extraction endpoint returns list of vectors directly
                if isinstance(data, list):
                    if data and isinstance(data[0], list):
                        return data
                    elif data and isinstance(data[0], (int, float)):
                        return [data]
                # Fallback: OpenAI-compatible format (some HF endpoints)
                elif isinstance(data, dict) and "data" in data:
                    return [item.get("embedding") or item.get("vector") for item in data["data"]]
                elif isinstance(data, dict) and "embedding" in data:
                    return [data["embedding"]]
                raise ValueError(f"Unexpected HF response shape: {str(data)[:200]}")
        except (httpx.HTTPError, ValueError) as e:
            last_err = e
            if attempt < 2:
                await asyncio.sleep(2 ** attempt)  # 1s, 2s backoff
            continue

    logger.error("HF inference failed after 3 attempts: %s", str(last_err))
    raise HTTPException(status_code=502, detail=f"HuggingFace inference failed: {str(last_err)}")


# =================== FAISS helpers ===================


def _rebuild_index(vecs: np.ndarray):
    global _index, _dim
    _dim = vecs.shape[1]
    new_idx = faiss.IndexFlatIP(_dim)
    new_idx.add(vecs)
    _index = new_idx


# =================== Endpoints ===================


@app.get("/healthz")
async def healthz():
    vectors = _index.ntotal if _index is not None else 0
    return {
        "status": "ok",
        "service": "ai-embed",
        "ready": vectors > 0,   # only ready once index is populated
        "model": MODEL_NAME,
        "vectors": vectors,
        "metadata": len(_meta),
    }


@app.post("/embed", response_model=EmbedResponse)
async def embed(req: EmbedRequest):
    raw = req.texts if req.texts is not None else req.text
    if raw is None:
        raise HTTPException(status_code=422, detail="Provide 'text' or 'texts' field")
    texts = raw if isinstance(raw, list) else [raw]
    vectors = await _get_embeddings(texts)
    return {"vectors": vectors}


@app.post("/upsert")
async def upsert(req: UpsertRequest):
    global _meta

    items = req.items
    if not items:
        return {"added": 0, "removed": 0, "total": 0}

    # Partition: items with pre-computed vectors vs items needing HF API
    items_with_vec = [i for i in items if i.vector]
    items_need_embed = [i for i in items if not i.vector]

    all_vecs: List[List[float]] = []
    all_items: List[UpsertItem] = []

    # Use pre-computed vectors (no HF API call)
    for item in items_with_vec:
        all_vecs.append(item.vector)
        all_items.append(item)

    # Call HF API only for items without cached vectors
    if items_need_embed:
        texts = [i.text for i in items_need_embed]
        new_vecs = await _get_embeddings(texts)
        all_vecs.extend(new_vecs)
        all_items.extend(items_need_embed)

    vecs = np.array(all_vecs, dtype=np.float32)
    faiss.normalize_L2(vecs)

    _rebuild_index(vecs)
    _meta = [{"id": i.id, "type": i.type, "payload": i.payload} for i in all_items]

    logger.info(
        f"Upserted {len(all_items)} items (cached={len(items_with_vec)}, "
        f"embedded={len(items_need_embed)}) dim={_dim}"
    )
    return {"added": len(all_items), "removed": 0, "total": len(all_items)}


@app.post("/search")
async def search(req: SearchRequest):
    if _index is None or _index.ntotal == 0:
        return {"hits": [], "strategy": "semantic"}

    vecs = await _get_embeddings([req.query])
    q = np.array(vecs, dtype=np.float32)
    faiss.normalize_L2(q)

    k = min(req.top_k, _index.ntotal)
    scores, indices = _index.search(q, k)

    hits = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0:
            continue
        if req.min_score and score < req.min_score:
            continue
        meta = _meta[idx]
        if req.filter_type and meta.get("type") != req.filter_type:
            continue
        if req.filter_province and meta.get("payload", {}).get("province") != req.filter_province:
            continue
        hits.append({"id": meta["id"], "score": float(score), "payload": meta.get("payload", {})})

    return {"hits": hits, "strategy": "semantic"}


@app.post("/hybrid-search")
async def hybrid_search(req: HybridSearchRequest):
    if _index is None or _index.ntotal == 0:
        return {"hits": [], "strategy": "hybrid"}

    if not req.free_text and not req.vibes:
        return {"hits": [], "strategy": "hybrid"}

    # Embed free_text + each vibe in one batch call
    embed_inputs = [req.free_text or ""] + (req.vibes or [])
    vectors = await _get_embeddings(embed_inputs)

    all_vecs = np.array(vectors, dtype=np.float32)
    faiss.normalize_L2(all_vecs)

    # Weighted combination: free_text vector + boost * mean(vibe vectors)
    if req.vibes and len(vectors) > 1:
        text_vec = all_vecs[0]
        vibe_avg = np.mean(all_vecs[1:], axis=0)
        combined = text_vec + req.boost_vibes * vibe_avg
        norm = np.linalg.norm(combined)
        if norm > 0:
            combined = combined / norm
        q = combined.reshape(1, -1).astype(np.float32)
    else:
        q = all_vecs[[0]]

    # Fetch extra candidates for post-filtering
    k = min(req.top_k * 3, _index.ntotal)
    scores, indices = _index.search(q, k)

    avoid_set = {a.lower() for a in (req.avoid or [])}

    hits = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0:
            continue
        meta = _meta[idx]
        payload = meta.get("payload", {})

        if req.filter_type and meta.get("type") != req.filter_type:
            continue
        if req.filter_province and payload.get("province") != req.filter_province:
            continue

        # Skip zones whose vibes overlap with avoid list
        if avoid_set:
            item_vibes = {v.lower() for v in payload.get("vibes", [])}
            if item_vibes & avoid_set:
                continue

        vibe_matches = []
        if req.vibes:
            item_vibes = {v.lower() for v in payload.get("vibes", [])}
            vibe_matches = [v for v in req.vibes if v.lower() in item_vibes]

        hits.append({
            "id": meta["id"],
            "score": float(score),
            "payload": payload,
            "vibe_matches": vibe_matches,
        })

        if len(hits) >= req.top_k:
            break

    return {"hits": hits, "strategy": "hybrid"}
