"""
Embedding Process Logger
Tracks vector sync in detail with timing and consistency checks
"""

import json
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

LOG_FILE = Path("./embedding_sync.log")


class EmbeddingLogger:
    """Detailed logger for embedding operations"""
    
    def __init__(self):
        self.logs = []
        self.current_operation = None
        self.operation_start = None
    
    def start_operation(self, operation_name: str):
        """Start timing an operation"""
        self.current_operation = operation_name
        self.operation_start = time.time()
        self.log(f"🔄 [{operation_name}] Started...")
    
    def end_operation(self, **kwargs):
        """End timing and log operation result"""
        if self.current_operation:
            duration = time.time() - self.operation_start
            self.log(f"✅ [{self.current_operation}] Completed in {duration:.2f}s", kwargs)
            self.current_operation = None
    
    def log(self, message: str, details: Dict[str, Any] = None):
        """Log a message with optional details"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "message": message
        }
        
        if details:
            log_entry["details"] = details
        
        self.logs.append(log_entry)
        print(f"[{timestamp}] {message}")
        
        if details:
            for k, v in details.items():
                print(f"    {k}: {v}")
    
    def log_sync_start(self, zones_count: int):
        """Log sync start"""
        self.start_operation("Embedding Sync")
        self.log(f"📊 [Sync] Processing {zones_count} zones...")
    
    def log_mongodb_fetch(self, count: int):
        """Log MongoDB fetch"""
        self.log(f"🔌 [MongoDB] Fetched {count} zones")
    
    def log_upsert_start(self, url: str, items_count: int):
        """Log upsert call start"""
        self.log(f"📤 [Upsert] Calling {url}", {
            "items_to_send": items_count
        })
    
    def log_metadata_update(self, removed: int, added: int, total_before: int, total_after: int):
        """Log metadata update details"""
        self.log(f"📝 [Upsert] Metadata updated", {
            "removed": removed,
            "added": added,
            "before": total_before,
            "after": total_after
        })
    
    def log_embedding_start(self, texts_count: int):
        """Log embedding start"""
        self.log(f"📡 [Upsert] Embedding {texts_count} texts...")
    
    def log_embedding_complete(self, texts_count: int, duration: float):
        """Log embedding completion"""
        self.log(f"✅ [Upsert] Embedded {texts_count} texts", {
            "duration_sec": f"{duration:.2f}",
            "texts_per_sec": f"{texts_count / duration:.1f}"
        })
    
    def log_index_rebuild(self, vectors_count: int):
        """Log index rebuild"""
        self.log(f"🔧 [Upsert] FAISS index rebuilt", {
            "vectors": vectors_count,
            "dimension": 1024,
            "index_type": "FLAT (IP)"
        })
    
    def log_consistency_check(self, vectors: int, metadata: int, consistent: bool):
        """Log consistency check result"""
        status = "✅ CONSISTENT" if consistent else "❌ MISMATCH"
        self.log(f"{status} [Verify]", {
            "vectors": vectors,
            "metadata": metadata,
            "match": consistent
        })
    
    def log_sync_complete(self, total_vectors: int, total_metadata: int):
        """Log sync completion"""
        self.end_operation(
            vectors=total_vectors,
            metadata=total_metadata
        )
        self.log(f"✨ [Sync] Complete - Ready for queries")
    
    def log_search(self, query: str, results_count: int, duration: float):
        """Log search operation"""
        self.log(f"🔍 [Search]", {
            "query": f"{query[:50]}..." if len(query) > 50 else query,
            "results": results_count,
            "duration_ms": f"{duration*1000:.2f}"
        })
    
    def save(self):
        """Save logs to file"""
        try:
            with open(LOG_FILE, 'a', encoding='utf-8') as f:
                for log in self.logs:
                    f.write(json.dumps(log, ensure_ascii=False) + "\n")
            self.logs = []  # Clear after saving
        except Exception as e:
            print(f"⚠️  Failed to save logs: {e}")
    
    def tail(self, lines: int = 50):
        """Get last N lines from log file"""
        try:
            with open(LOG_FILE, 'r', encoding='utf-8') as f:
                all_lines = f.readlines()
            
            print(f"\n📋 Last {min(lines, len(all_lines))} log entries:")
            print("=" * 80)
            
            for line in all_lines[-lines:]:
                log = json.loads(line)
                timestamp = log.get('timestamp', '')
                message = log.get('message', '')
                details = log.get('details', {})
                
                print(f"[{timestamp}] {message}")
                if details:
                    for k, v in details.items():
                        print(f"    {k}: {v}")
            
            print("=" * 80 + "\n")
        except FileNotFoundError:
            print("⚠️  No log file found")
        except Exception as e:
            print(f"⚠️  Error reading logs: {e}")


# Global logger instance
logger = EmbeddingLogger()


def show_vector_comparison():
    """Show vector vs metadata comparison"""
    try:
        meta_path = Path("./index/meta.json")
        if not meta_path.exists():
            print("⚠️  No meta.json found")
            return
        
        with open(meta_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        import faiss
        idx_path = Path("./index/faiss.index")
        index = faiss.read_index(str(idx_path))
        
        print("\n" + "=" * 80)
        print("🔗 VECTOR COMPARISON: Metadata ↔ FAISS Index")
        print("=" * 80)
        
        zones = [m for m in metadata if m.get('type') == 'zone']
        pois = [m for m in metadata if m.get('type') == 'poi']
        
        print(f"\n📊 Metadata Items:")
        print(f"   Zones: {len(zones)}")
        print(f"   POIs:  {len(pois)}")
        print(f"   Total: {len(metadata)}")
        
        print(f"\n🔧 FAISS Index:")
        print(f"   Vectors: {index.ntotal}")
        print(f"   Dimension: {index.d}")
        
        consistent = len(metadata) == index.ntotal
        print(f"\n{'✅ CONSISTENT' if consistent else '❌ MISMATCH'}")
        print(f"   {len(metadata)} metadata items {'=' if consistent else '≠'} {index.ntotal} vectors")
        
        print("=" * 80 + "\n")
    
    except Exception as e:
        print(f"⚠️  Error: {e}")


if __name__ == "__main__":
    show_vector_comparison()
