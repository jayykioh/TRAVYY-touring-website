import os
import asyncio
from typing import List, Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import logging

EMBED_PROVIDER = os.getenv("EMBED_PROVIDER", "hf_inference")
HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_NAME = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
PORT = int(os.getenv("PORT", 8088))

app = FastAPI(title="ai-embed")
logger = logging.getLogger("uvicorn.error")

# Lazy-loaded local model
_local_model = None

class EmbedRequest(BaseModel):
    text: Union[str, List[str]]

class EmbedResponse(BaseModel):
    vectors: List[List[float]]

@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting ai-embed service. provider={EMBED_PROVIDER}, model={MODEL_NAME}")
    global _local_model
    if EMBED_PROVIDER == "local":
        try:
            # Import lazily
            from sentence_transformers import SentenceTransformer
            _local_model = SentenceTransformer(MODEL_NAME)
            logger.info("Local embedding model loaded")
        except Exception as e:
            logger.error("Failed to load local model: %s", e)
            _local_model = None

@app.get("/healthz")
async def healthz():
    ready = True
    if EMBED_PROVIDER == "local" and _local_model is None:
        ready = False
    return {"status": "ok", "service": "ai-embed", "ready": ready, "model_name": MODEL_NAME}


def _normalize_texts(texts: List[str]) -> List[str]:
    out = []
    for t in texts:
        if t is None:
            out.append("")
            continue
        s = str(t).strip()
        # collapse whitespace
        s = " ".join(s.split())
        out.append(s)
    return out


@app.post("/embed", response_model=EmbedResponse)
async def embed(req: EmbedRequest):
    texts = req.text if isinstance(req.text, list) else [req.text]
    texts = _normalize_texts(texts)

    if EMBED_PROVIDER == "hf_inference":
        if not HF_TOKEN:
            raise HTTPException(status_code=500, detail="HF_TOKEN is not configured")
        url = "https://api-inference.huggingface.co/embeddings"
        headers = {"Authorization": f"Bearer {HF_TOKEN}"}
        payload = {"model": MODEL_NAME, "input": texts}
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                r = await client.post(url, json=payload, headers=headers)
                r.raise_for_status()
                data = r.json()
                # Expected shape: { "data": [{ "embedding": [...] }, ...] }
                # or HF may return {"embedding": [...] } for single input
                vectors = []
                if isinstance(data, dict) and "data" in data:
                    for item in data["data"]:
                        vectors.append(item.get("embedding") or item.get("vector"))
                elif isinstance(data, dict) and "embedding" in data:
                    vectors = [data["embedding"]]
                elif isinstance(data, list):
                    # Some HF endpoints return list of vectors directly
                    vectors = data
                else:
                    raise HTTPException(status_code=500, detail=f"Unexpected HF response: {data}")
                # ensure numeric lists
                return {"vectors": vectors}
            except httpx.HTTPError as e:
                logger.error("HF inference request failed: %s", str(e))
                raise HTTPException(status_code=502, detail="HuggingFace inference failed")
    elif EMBED_PROVIDER == "local":
        if _local_model is None:
            raise HTTPException(status_code=500, detail="Local model not available")
        try:
            vectors = _local_model.encode(texts, show_progress_bar=False, convert_to_numpy=False)
            # Ensure list of lists
            vectors_out = [list(v) for v in vectors]
            return {"vectors": vectors_out}
        except Exception as e:
            logger.error("Local embedding failed: %s", e)
            raise HTTPException(status_code=500, detail="Local embedding failed")
    else:
        raise HTTPException(status_code=500, detail=f"Unknown EMBED_PROVIDER={EMBED_PROVIDER}")
