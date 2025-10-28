import os
import json
import math
import time
import hashlib
from typing import List, Optional, Dict, Any

import numpy as np
import faiss
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# =================== Config ===================
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "AITeamVN/Vietnamese_Embedding_v2")
PORT = int(os.getenv("PORT", "8088"))
INDEX_TYPE = os.getenv("INDEX_TYPE", "FLAT").upper()
INDEX_DIR = Path(os.getenv("INDEX_DIR", "./index"))
DIM = 1024

INDEX_DIR.mkdir(exist_ok=True)

# =================== FastAPI App ===================
app = FastAPI(
    title="Touring Embedding Service",
    description="Vietnamese semantic search for travel zones & POIs",
    version="2.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =================== Load Model ===================
print(f"📦 Loading model: {MODEL_NAME}")
t0 = time.time()
model = SentenceTransformer(MODEL_NAME)
print(f"✅ Model loaded in {time.time() - t0:.2f}s")

# =================== FAISS Index ===================
index = None
metadata = []

def load_index():
    global index, metadata
    idx_path = INDEX_DIR / "faiss.index"
    meta_path = INDEX_DIR / "meta.json"
    
    if idx_path.exists():
        print(f"📂 Loading index from {idx_path}")
        index = faiss.read_index(str(idx_path))
    else:
        print(f"🆕 Creating new {INDEX_TYPE} index")
        if INDEX_TYPE == "HNSW":
            index = faiss.IndexHNSWFlat(DIM, 32)
        else:
            index = faiss.IndexFlatIP(DIM)
    
    if meta_path.exists():
        with open(meta_path, 'r', encoding='utf-8') as f:
            metadata.extend(json.load(f))
    
    print(f"✅ Index ready: {index.ntotal} vectors, {len(metadata)} metadata")

def save_index():
    faiss.write_index(index, str(INDEX_DIR / "faiss.index"))
    with open(INDEX_DIR / "meta.json", 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"💾 Saved: {index.ntotal} vectors")

load_index()

# =================== Models ===================
class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, max_items=100)

class UpsertItem(BaseModel):
    id: str
    type: str
    text: str
    payload: Optional[Dict[str, Any]] = None

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
    top_k: int = Field(10, ge=1, le=100)
    filter_type: Optional[str] = None
    filter_province: Optional[str] = None
    boost_vibes: float = Field(1.2, ge=1.0, le=2.0)

# =================== Endpoints ===================

@app.get("/")
def root():
    return {
        "service": "Touring Embedding API",
        "version": "2.0",
        "model": MODEL_NAME,
        "endpoints": ["/healthz", "/embed", "/search", "/hybrid-search", "/upsert"]
    }

@app.get("/healthz")
def health():
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "index_type": INDEX_TYPE,
        "vectors": index.ntotal,
        "metadata": len(metadata)
    }

@app.get("/stats")
def stats():
    return {
        "vectors": index.ntotal,
        "metadata": len(metadata),
        "dimension": DIM,
        "index_type": INDEX_TYPE
    }

@app.post("/embed")
def embed(req: EmbedRequest):
    """Generate embeddings"""
    try:
        embeddings = model.encode(
            req.texts,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        return {
            "embeddings": embeddings.tolist(),
            "dimension": embeddings.shape[1],
            "count": len(req.texts)
        }
    except Exception as e:
        raise HTTPException(500, f"Embedding failed: {str(e)}")

@app.post("/upsert")
def upsert(req: UpsertRequest):
    """Add/update vectors"""
    try:
        texts = [item.text for item in req.items]
        embeddings = model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        # Remove old entries
        ids_set = {item.id for item in req.items}
        global metadata
        old_count = len(metadata)
        metadata = [m for m in metadata if m["id"] not in ids_set]
        removed = old_count - len(metadata)
        
        # Add new
        for item, emb in zip(req.items, embeddings):
            index.add(np.array([emb], dtype=np.float32))
            metadata.append({
                "id": item.id,
                "type": item.type,
                "text": item.text,
                "payload": item.payload or {}
            })
        
        save_index()
        
        return {
            "ok": True,
            "added": len(req.items),
            "removed": removed,
            "total": index.ntotal
        }
    except Exception as e:
        raise HTTPException(500, f"Upsert failed: {str(e)}")

@app.post("/search")
def search(req: SearchRequest):
    """Semantic search"""
    try:
        if index.ntotal == 0:
            return {"hits": []}
        
        query_emb = model.encode(
            [req.query],
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        k = min(req.top_k, index.ntotal)
        scores, indices = index.search(query_emb, k)
        
        hits = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(metadata):
                continue
            
            meta = metadata[idx]
            
            # Filters
            if req.filter_type and meta["type"] != req.filter_type:
                continue
            if req.filter_province:
                prov = meta.get("payload", {}).get("province", "")
                if prov != req.filter_province:
                    continue
            if req.min_score and score < req.min_score:
                continue
            
            hits.append({
                "id": meta["id"],
                "score": float(score),
                "type": meta["type"],
                "text": meta["text"],
                "payload": meta["payload"]
            })
        
        return {"hits": hits}
    except Exception as e:
        raise HTTPException(500, f"Search failed: {str(e)}")

@app.post("/hybrid-search")
def hybrid_search(req: HybridSearchRequest):
    """
    Hybrid search: semantic + keyword boosting
    """
    try:
        if index.ntotal == 0:
            return {"hits": [], "strategy": "empty_index"}
        
        # Build query
        query_parts = []
        if req.free_text:
            query_parts.append(req.free_text)
        if req.vibes:
            query_parts.extend(req.vibes)
        
        if not query_parts:
            return {"hits": [], "strategy": "no_query"}
        
        query_text = " ".join(query_parts)
        
        # Embed
        query_emb = model.encode(
            [query_text],
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        # Search with larger k for re-ranking
        k = min(req.top_k * 3, index.ntotal)
        scores, indices = index.search(query_emb, k)
        
        # Re-rank with vibe boost
        hits = []
        vibes_lower = [v.lower() for v in (req.vibes or [])]
        avoid_lower = [a.lower() for a in (req.avoid or [])]
        
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(metadata):
                continue
            
            meta = metadata[idx]
            text_lower = meta["text"].lower()
            
            # Filter avoid
            if avoid_lower and any(av in text_lower for av in avoid_lower):
                continue
            
            # Filter type/province
            if req.filter_type and meta["type"] != req.filter_type:
                continue
            if req.filter_province:
                prov = meta.get("payload", {}).get("province", "")
                if prov != req.filter_province:
                    continue
            
            # Boost vibes
            adjusted_score = float(score)
            vibe_matches = sum(1 for v in vibes_lower if v in text_lower)
            if vibe_matches > 0:
                adjusted_score *= (req.boost_vibes ** vibe_matches)
            
            hits.append({
                "id": meta["id"],
                "score": adjusted_score,
                "original_score": float(score),
                "vibe_matches": vibe_matches,
                "type": meta["type"],
                "text": meta["text"],
                "payload": meta["payload"]
            })
        
        # Sort and limit
        hits.sort(key=lambda x: x["score"], reverse=True)
        hits = hits[:req.top_k]
        
        return {
            "hits": hits,
            "strategy": "hybrid",
            "query_text": query_text,
            "total_candidates": len(hits)
        }
    except Exception as e:
        raise HTTPException(500, f"Hybrid search failed: {str(e)}")

@app.post("/reset")
def reset():
    """Clear index"""
    global index, metadata
    if INDEX_TYPE == "HNSW":
        index = faiss.IndexHNSWFlat(DIM, 32)
    else:
        index = faiss.IndexFlatIP(DIM)
    metadata = []
    save_index()
    return {"ok": True, "message": "Index reset"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
