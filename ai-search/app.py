import os
import json
import logging
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import numpy as np

logger = logging.getLogger("uvicorn.error")

AI_EMBED_URL = os.getenv("AI_EMBED_URL")
FAISS_INDEX_PATH = os.getenv("FAISS_INDEX_PATH")
INDEX_METADATA_PATH = os.getenv("INDEX_METADATA_PATH")
VECTOR_DIM = int(os.getenv("VECTOR_DIM", "0") or 0)
PORT = int(os.getenv("PORT", 8089))

app = FastAPI(title="ai-search")

# Lazy loaded
_index = None
_index_loaded = False
_index_ntotal = 0
_metadata: Optional[Dict[str, Any]] = None

class SearchRequest(BaseModel):
    query: str
    k: int = 10

class SearchHit(BaseModel):
    id: int
    score: float
    metadata: Optional[Dict[str, Any]] = None

class SearchResponse(BaseModel):
    hits: List[SearchHit]

@app.on_event("startup")
async def startup_event():
    global _index, _index_loaded, _index_ntotal, _metadata
    logger.info(f"Starting ai-search. AI_EMBED_URL={AI_EMBED_URL}, FAISS_INDEX_PATH={FAISS_INDEX_PATH}")
    try:
        import faiss
        # load index if path provided
        if FAISS_INDEX_PATH and os.path.exists(FAISS_INDEX_PATH):
            _index = faiss.read_index(FAISS_INDEX_PATH)
            _index_loaded = True
            try:
                _index_ntotal = _index.ntotal
            except Exception:
                _index_ntotal = 0
            logger.info(f"FAISS index loaded: {_index_ntotal} vectors")
        else:
            logger.warning("FAISS_INDEX_PATH not provided or file missing; index not loaded")
    except Exception as e:
        logger.error("Failed to import faiss or load index: %s", e)
        _index_loaded = False

    # load metadata mapping if provided
    if INDEX_METADATA_PATH and os.path.exists(INDEX_METADATA_PATH):
        try:
            with open(INDEX_METADATA_PATH, "r", encoding="utf-8") as fh:
                _metadata = json.load(fh)
            logger.info("Loaded index metadata mapping")
        except Exception as e:
            logger.warning("Failed to load index metadata: %s", e)
            _metadata = None

@app.get("/healthz")
async def healthz():
    return {
        "status": "ok",
        "service": "ai-search",
        "ready": _index_loaded,
        "index_loaded": _index_loaded,
        "index_path": FAISS_INDEX_PATH,
        "index_size": _index_ntotal,
        "vector_dim": VECTOR_DIM,
    }

@app.post("/search", response_model=SearchResponse)
async def search(req: SearchRequest):
    if not AI_EMBED_URL:
        raise HTTPException(status_code=500, detail="AI_EMBED_URL not configured")
    if not _index_loaded or _index is None:
        raise HTTPException(status_code=500, detail="FAISS index not loaded")

    # call ai-embed
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            r = await client.post(f"{AI_EMBED_URL.rstrip('/')}/embed", json={"text": req.query})
            r.raise_for_status()
            data = r.json()
            vectors = data.get("vectors")
            if not vectors:
                raise HTTPException(status_code=502, detail="ai-embed returned no vectors")
            qvec = np.array(vectors[0], dtype=np.float32)
        except httpx.RequestError as e:
            logger.error("ai-embed request failed: %s", e)
            raise HTTPException(status_code=502, detail="ai-embed unreachable")
        except httpx.HTTPStatusError as e:
            logger.error("ai-embed returned error: %s", e)
            raise HTTPException(status_code=502, detail="ai-embed returned error")

    # run search
    try:
        D, I = _index.search(np.expand_dims(qvec, axis=0), req.k)
        D = D.tolist()[0]
        I = I.tolist()[0]
        hits = []
        for idx, score in zip(I, D):
            # faiss may return -1 for empty slot
            if idx < 0:
                continue
            meta = None
            if _metadata:
                # metadata keys might be strings
                meta = _metadata.get(str(idx)) or _metadata.get(idx)
            hits.append({"id": int(idx), "score": float(score), "metadata": meta})
        return {"hits": hits}
    except Exception as e:
        logger.error("FAISS search failed: %s", e)
        raise HTTPException(status_code=500, detail="FAISS search failed")
