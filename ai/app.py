# ===============================================
# === IMPORT CÁC THƯ VIỆN CẦN THIẾT ===
# ===============================================
import os
import json
import math
import time
import hashlib
from typing import List, Optional, Dict, Any

import numpy as np
import faiss  # Thư viện tìm kiếm vector của Facebook
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field # Thư viện để định nghĩa API models
from sentence_transformers import SentenceTransformer # Thư viện model AI
from dotenv import load_dotenv # Thư viện để tải file .env
from pathlib import Path

# (Giả sử bạn có file logger này)
from embedding_logger import logger 

# Tải các biến môi trường (ví dụ: PORT) từ file .env
load_dotenv()

# =================== Config ===================
# Cấu hình cho service
# ===============================================

# Tên model AI dùng để tạo embedding
MODEL_NAME = os.getenv("EMBEDDING_MODEL", "AITeamVN/Vietnamese_Embedding_v2")
# Cổng (port) mà service sẽ chạy
PORT = int(os.getenv("PORT", "8088"))
# Loại index FAISS (FLAT = đơn giản nhất, HNSW = nhanh hơn cho
# dữ liệu lớn)
INDEX_TYPE = os.getenv("INDEX_TYPE", "FLAT").upper()
# Thư mục để lưu trữ các file index
INDEX_DIR = Path(os.getenv("INDEX_DIR", "./index"))
# Số chiều của vector (model này là 1024)
DIM = 1024

# Tạo thư mục index nếu nó chưa tồn tại
INDEX_DIR.mkdir(exist_ok=True)

# =================== FastAPI App ===================
# Khởi tạo ứng dụng web API
# ===============================================
app = FastAPI(
    title="Touring Embedding Service",
    description="Vietnamese semantic search for travel zones & POIs",
    version="2.0"
)

# Cấu hình CORS (Cross-Origin Resource Sharing)
# Cho phép các trang web khác (ví dụ: React app) gọi API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://travyytouring.page",
        "https://www.travyytouring.page",
        "https://api.travyytouring.page",
    ],
    allow_credentials=True,
    allow_methods=["*"], # Cho phép tất cả các phương thức (GET, POST,...)
    allow_headers=["*"], # Cho phép tất cả các header
)

# =================== Load Model ===================
# Tải model AI khi service khởi động
# ===============================================
print(f"📦 Loading model: {MODEL_NAME}")
t0 = time.time()
# Đây là lúc model AI được tải vào bộ nhớ (RAM/VRAM)
model = SentenceTransformer(MODEL_NAME)
print(f"✅ Model loaded in {time.time() - t0:.2f}s")

# =================== FAISS Index ===================
# Khởi tạo "database" vector (FAISS) và metadata
# ===============================================

# 'index' sẽ lưu các vector
index = None 
# 'metadata' sẽ lưu thông tin đi kèm (id, text, payload)
metadata = [] 

def load_index():
    """Hàm tải index và metadata từ file."""
    global index, metadata
    idx_path = INDEX_DIR / "faiss.index" # Đường dẫn file vector
    meta_path = INDEX_DIR / "meta.json"   # Đường dẫn file metadata
    
    # Tải file index (vector)
    if idx_path.exists():
        print(f"📂 Loading index from {idx_path}")
        index = faiss.read_index(str(idx_path))
    else:
        # Nếu không có file, tạo index mới
        print(f"🆕 Creating new {INDEX_TYPE} index")
        if INDEX_TYPE == "HNSW":
            index = faiss.IndexHNSWFlat(DIM, 32)
        else:
            # IndexFlatIP = So khớp (Inner Product),
            # dùng cho vector đã chuẩn hóa (normalized)
            index = faiss.IndexFlatIP(DIM)
    
    # Tải file metadata (json)
    if meta_path.exists():
        with open(meta_path, 'r', encoding='utf-8') as f:
            metadata.extend(json.load(f))
    
    print(f"✅ Index ready: {index.ntotal} vectors, {len(metadata)} metadata")

def save_index():
    """Hàm lưu index và metadata hiện tại ra file."""
    # Lưu index vector
    faiss.write_index(index, str(INDEX_DIR / "faiss.index"))
    # Lưu metadata (dạng JSON)
    with open(INDEX_DIR / "meta.json", 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"💾 Saved: {index.ntotal} vectors")

# Chạy hàm load_index() ngay khi service khởi động
load_index()

# =================== Models ===================
# Định nghĩa cấu trúc dữ liệu cho các request API
# ===============================================

class EmbedRequest(BaseModel):
    """Input cho /embed"""
    texts: List[str] = Field(..., min_items=1, max_items=100)

class UpsertItem(BaseModel):
    """Một item (địa điểm) để thêm vào index"""
    id: str
    type: str
    text: str # Văn bản dùng để tạo vector
    payload: Optional[Dict[str, Any]] = None # Dữ liệu đi kèm

class UpsertRequest(BaseModel):
    """Input cho /upsert"""
    items: List[UpsertItem]

class SearchRequest(BaseModel):
    """Input cho /search (tìm kiếm đơn giản)"""
    query: str
    top_k: int = Field(10, ge=1, le=100)
    filter_type: Optional[str] = None
    filter_province: Optional[str] = None
    min_score: Optional[float] = 0.0

class HybridSearchRequest(BaseModel):
    """Input cho /hybrid-search (tìm kiếm nâng cao)"""
    free_text: Optional[str] = None
    vibes: Optional[List[str]] = None
    avoid: Optional[List[str]] = None
    top_k: int = Field(10, ge=1, le=100)
    filter_type: Optional[str] = None
    filter_province: Optional[str] = None
    boost_vibes: float = Field(1.2, ge=1.0, le=2.0)

# =================== Endpoints ===================
# Các API (route) của service
# ===============================================

@app.get("/")
def root():
    """Endpoint gốc, cung cấp thông tin chung."""
    return {
        "service": "Touring Embedding API",
        "version": "2.0",
        "model": MODEL_NAME,
        "endpoints": ["/healthz", "/embed", "/search", "/hybrid-search", "/upsert"]
    }

@app.get("/healthz")
def health():
    """Endpoint kiểm tra "sức khỏe" của service."""
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "index_type": INDEX_TYPE,
        "vectors": index.ntotal, # Số vector đang có
        "metadata": len(metadata) # Số metadata đang có
    }

@app.get("/stats")
def stats():
    """Endpoint xem thống kê chi tiết của index."""
    return {
        "vectors": index.ntotal,
        "metadata": len(metadata),
        "dimension": DIM,
        "index_type": INDEX_TYPE
    }

@app.post("/embed")
def embed(req: EmbedRequest):
    """Endpoint để biến văn bản (text) thành vector (embedding)."""
    try:
        # Dùng model AI để mã hóa văn bản
        embeddings = model.encode(
            req.texts,
            normalize_embeddings=True, # Rất quan trọng cho IndexFlatIP
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
    """
    Endpoint thêm/cập nhật dữ liệu vào index.
    Chiến lược: Xây dựng lại toàn bộ (Rebuild).
    """
    try:
        global metadata, index
        
        logger.start_operation("Upsert")
        logger.log_upsert_start(os.getenv("AI_EMBED_URL", "https://ai-embed.travvytouring.page") + "/upsert", len(req.items))
        
        # --- Step 1: Cập nhật metadata ---
        # Tạo 1 set chứa các ID mới (để tìm kiếm nhanh)
        ids_set = {item.id for item in req.items}
        
        # Lọc danh sách metadata cũ, giữ lại những item
        # KHÔNG CÓ ID trùng với ID mới
        old_count = len(metadata)
        metadata = [m for m in metadata if m["id"] not in ids_set]
        removed = old_count - len(metadata)
        
        logger.log_metadata_update(removed, len(req.items), old_count, len(metadata))
        
        # --- Step 2: Thêm item mới vào metadata ---
        new_items = []
        for item in req.items:
            new_items.append({
                "id": item.id,
                "type": item.type,
                "text": item.text,
                "payload": item.payload or {}
            })
        
        metadata.extend(new_items) # Thêm list item mới vào list metadata
        
        # --- Step 3: Xây dựng lại (Rebuild) toàn bộ index FAISS ---
        if len(metadata) == 0:
            # Nếu không có metadata, tạo index rỗng
            index = faiss.IndexFlatIP(DIM)
            logger.log(" [Upsert] Created empty index")
        else:
            # Nếu có metadata
            # Lấy TOÀN BỘ văn bản từ metadata
            all_texts = [m.get("text", "") for m in metadata]
            
            # Dùng model AI tạo lại embedding cho TOÀN BỘ văn bản
            logger.log_embedding_start(len(all_texts))
            embed_start = time.time()
            all_embeddings = model.encode(
                all_texts,
                normalize_embeddings=True,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            embed_duration = time.time() - embed_start
            logger.log_embedding_complete(len(all_texts), embed_duration)
            
            # Tạo một index FAISS MỚI và thêm TẤT CẢ embedding vào
            index = faiss.IndexFlatIP(DIM)
            index.add(all_embeddings)
            logger.log_index_rebuild(index.ntotal)
        
        # Lưu index và metadata mới ra file
        save_index()
        
        logger.log_consistency_check(index.ntotal, len(metadata), index.ntotal == len(metadata))
        logger.end_operation()
        logger.save()
        
        return {
            "ok": True,
            "added": len(req.items), # Số item mới
            "removed": removed,      # Số item cũ bị ghi đè
            "total": index.ntotal  # Tổng số item trong index
        }
    except Exception as e:
        logger.log(f"❌ [Upsert] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.save()
        raise HTTPException(500, f"Upsert failed: {str(e)}")

@app.post("/search")
def search(req: SearchRequest):
    """Endpoint tìm kiếm ngữ nghĩa đơn giản (1 bước)."""
    try:
        if index.ntotal == 0:
            return {"hits": []} # Trả về rỗng nếu index rỗng
        
        search_start = time.time()
        
        # 1. Dùng model AI biến query thành vector
        query_emb = model.encode(
            [req.query],
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        # 2. Tìm kiếm trong FAISS
        k = min(req.top_k, index.ntotal)
        scores, indices = index.search(query_emb, k)
        
        # 3. Lọc và định dạng kết quả
        hits = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(metadata):
                continue
            
            meta = metadata[idx] # Lấy metadata dựa trên chỉ số (idx)
            
            # --- Lọc (Post-filtering) ---
            # Lọc sau khi tìm kiếm
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
        
        search_duration = time.time() - search_start
        logger.log_search(req.query, len(hits), search_duration)
        
        return {"hits": hits}
    except Exception as e:
        raise HTTPException(500, f"Search failed: {str(e)}")

@app.post("/hybrid-search")
def hybrid_search(req: HybridSearchRequest):
    """
    Tìm kiếm hybrid: kết hợp ngữ nghĩa (AI) + tăng điểm từ khóa (keyword boosting)
    (Đây là logic bạn đã hỏi)
    """
    try:
        if index.ntotal == 0:
            return {"hits": [], "strategy": "empty_index"}
        
        # === BƯỚC 1: TẠO QUERY VÀ LẤY ỨNG VIÊN ===
        
        # Kết hợp free_text và vibes để tạo thành 1 câu query ngữ nghĩa
        query_parts = []
        if req.free_text:
            query_parts.append(req.free_text)
        if req.vibes:
            query_parts.extend(req.vibes)
        
        if not query_parts:
            return {"hits": [], "strategy": "no_query"}
        
        query_text = " ".join(query_parts)
        
        # Dùng model AI để biến câu query kết hợp thành vector
        query_emb = model.encode(
            [query_text],
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        # Lấy một số lượng ứng viên lớn hơn mức cần thiết (ví dụ: top_k=10 thì lấy 30)
        k = min(req.top_k * 3, index.ntotal)
        scores, indices = index.search(query_emb, k)
        
        # === BƯỚC 2: SÀNG LỌC VÀ CHẤM ĐIỂM LẠI (RE-RANKING) ===
        
        hits = [] # Danh sách kết quả cuối cùng
        
        # Chuẩn bị danh sách từ khóa (viết thường) để so sánh
        vibes_lower = [v.lower() for v in (req.vibes or [])]
        avoid_lower = [a.lower() for a in (req.avoid or [])]
        
        # Bắt đầu duyệt qua từng ứng viên
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(metadata):
                continue
            
            meta = metadata[idx]
            text_lower = meta["text"].lower()
            
            # --- LỌC BỎ (AVOID) ---
            if avoid_lower and any(av in text_lower for av in avoid_lower):
                continue 
            
            # --- LỌC CỨNG (FILTER) ---
            if req.filter_type and meta["type"] != req.filter_type:
                continue
            if req.filter_province:
                prov = meta.get("payload", {}).get("province", "")
                if prov != req.filter_province:
                    continue
            
            # --- TĂNG ĐIỂM (BOOST VIBES) ---
            adjusted_score = float(score)
            vibe_matches = sum(1 for v in vibes_lower if v in text_lower)
            
            if vibe_matches > 0:
                adjusted_score *= (req.boost_vibes ** vibe_matches)
            
            # Thêm vào danh sách kết quả với điểm MỚI
            hits.append({
                "id": meta["id"],
                "score": adjusted_score,
                "original_score": float(score),
                "vibe_matches": vibe_matches,
                "type": meta["type"],
                "text": meta["text"],
                "payload": meta["payload"]
            })
        
        # === BƯỚC 3: SẮP XẾP VÀ TRẢ VỀ ===
        
        # Sắp xếp lại 'hits' dựa trên điểm MỚI (score) từ cao đến thấp
        hits.sort(key=lambda x: x["score"], reverse=True)
        
        # Cắt lấy top_k (ví dụ: 10) kết quả tốt nhất
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
    """Endpoint xóa sạch index (hữu ích khi test)."""
    global index, metadata
    
    # Tạo lại index và metadata rỗng
    if INDEX_TYPE == "HNSW":
        index = faiss.IndexHNSWFlat(DIM, 32)
    else:
        index = faiss.IndexFlatIP(DIM)
    metadata = []
    
    # Lưu trạng thái rỗng ra file
    save_index()
    return {"ok": True, "message": "Index reset"}

# =================== Run App ===================
# Đoạn này chỉ chạy khi bạn chạy file Python trực tiếp
# ===============================================
if __name__ == "__main__":
    import uvicorn
    # Chạy service API bằng uvicorn trên cổng (PORT) đã định nghĩa
    uvicorn.run(app, host="0.0.0.0", port=PORT)