#!/usr/bin/env python3
"""
Visual Vector Comparison Guide
Pretty printing of vector sync status
"""

import json
import subprocess
from pathlib import Path
import faiss

def print_header(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def print_section(title):
    print(f"\n{title}")
    print(f"{'-'*len(title)}\n")

def check_consistency():
    """Main consistency check"""
    print_header("🔗 VECTOR SYNC STATUS CHECK")
    
    try:
        # Load index
        idx = faiss.read_index("./index/faiss.index")
        vectors = idx.ntotal
        
        # Load metadata with UTF-8
        with open("./index/meta.json", 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        items = len(metadata)
        
        # Display
        print(f"📊 FAISS Index:     {vectors:>3} vectors")
        print(f"📝 Metadata Items:  {items:>3} items\n")
        
        if vectors == items:
            print(f"✅ CONSISTENT      {vectors} = {items}")
            status = "✅ HEALTHY"
        else:
            print(f"❌ MISMATCH        {vectors} ≠ {items}")
            status = "❌ ERROR"
        
        print(f"\n🔴 System Status:   {status}\n")
        
        # Zone breakdown
        zones = [m for m in metadata if m.get('type') == 'zone']
        pois = [m for m in metadata if m.get('type') == 'poi']
        
        print_section("📂 Metadata Breakdown")
        print(f"  🗺️  Zones:  {len(zones):>3}")
        print(f"  🏪 POIs:   {len(pois):>3}")
        print(f"  📌 Total:  {items:>3}\n")
        
        # Province breakdown
        provinces = {}
        for zone in zones:
            prov = zone.get('payload', {}).get('province', 'Unknown')
            provinces[prov] = provinces.get(prov, 0) + 1
        
        print_section("🗺️  Zones by Province")
        for prov, count in sorted(provinces.items(), key=lambda x: -x[1]):
            bar = "█" * (count // 2)
            print(f"  {prov:15s} {count:>2} zones  {bar}")
        
        print(f"\n  Total: {len(zones)} zones in {len(provinces)} provinces\n")
        
        # Vector stats
        print_section("⚙️  Vector Statistics")
        print(f"  Dimension:      1024 (float32)")
        print(f"  Metric:         Inner Product (IP)")
        print(f"  Index Type:     FLAT (exact search)")
        print(f"  Embedding Model: AITeamVN/Vietnamese_Embedding_v2\n")
        
        # Summary
        print_section("📈 Summary")
        consistency_pct = 100 if vectors == items else (min(vectors, items) / max(vectors, items) * 100)
        print(f"  Consistency: {consistency_pct:.1f}%")
        print(f"  Database Zones:  49")
        print(f"  Index Vectors:   {vectors}")
        print(f"  Metadata Items:  {items}")
        print(f"  Last Sync:       (see logs)\n")
        
        return vectors == items
        
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        return False

def show_quickstart():
    """Show quickstart commands"""
    print_header("🚀 QUICK START COMMANDS")
    
    commands = [
        ("Check consistency", "python log_viewer.py compare"),
        ("Full analysis", "python analyze_vectors.py"),
        ("Recent logs", "python log_viewer.py tail 50"),
        ("Pattern analysis", "python log_viewer.py analyze"),
        ("Find errors", 'grep "❌" embedding_sync.log'),
    ]
    
    for desc, cmd in commands:
        print(f"  {desc:25s} → python log_viewer.py compare")
        print(f"  {' '*25}   {cmd}\n")

def show_locations():
    """Show file locations"""
    print_header("📁 FILES & LOCATIONS")
    
    files = [
        ("embedding_logger.py", "Logger class + functions"),
        ("log_viewer.py", "CLI viewer (main tool)"),
        ("analyze_vectors.py", "Deep analysis script"),
        ("app.py", "FastAPI (has logging)"),
        ("embedding_sync.log", "Log file (auto-created)"),
        ("EMBEDDING_LOGGING_GUIDE.md", "Full documentation"),
    ]
    
    print("In ai/ directory:\n")
    for filename, purpose in files:
        print(f"  ✓ {filename:35s} - {purpose}")
    print()

if __name__ == "__main__":
    import os
    os.chdir(Path(__file__).parent)
    
    check_consistency()
    show_locations()
    show_quickstart()
    
    print("="*80)
    print("  For more info: cat EMBEDDING_LOGGING_GUIDE.md")
    print("="*80 + "\n")
