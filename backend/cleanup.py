#!/usr/bin/env python3
"""
Cleanup script for expired print jobs
Run with: python cleanup.py
"""

import asyncio
from storage import SupabaseStorage
from datetime import datetime

async def cleanup_expired_jobs():
    """Clean up expired print jobs and files"""
    storage = SupabaseStorage()
    
    try:
        print("🧹 Starting cleanup of expired print jobs...")
        
        # Get expired jobs first to delete their files
        current_time = datetime.now().isoformat()
        result = storage.supabase.table("print_jobs").select("file_path").lt("expires_at", current_time).execute()
        
        expired_jobs = result.data if result.data else []
        
        # Delete files from storage
        if expired_jobs:
            file_paths = [job["file_path"] for job in expired_jobs]
            try:
                storage.supabase.storage.from_("print-files").remove(file_paths)
                print(f"🗑️  Deleted {len(file_paths)} files from storage")
            except Exception as e:
                print(f"⚠️  Some files could not be deleted from storage: {e}")
        
        # Delete expired database records
        delete_result = storage.supabase.table("print_jobs").delete().lt("expires_at", current_time).execute()
        
        print(f"✅ Cleaned up {len(expired_jobs)} expired print jobs")
        
        # Get current statistics
        stats_result = storage.supabase.table("print_jobs").select("status").execute()
        stats = stats_result.data if stats_result.data else []
        
        total_jobs = len(stats)
        pending_jobs = len([job for job in stats if job["status"] == "pending"])
        completed_jobs = len([job for job in stats if job["status"] == "completed"])
        
        print("\n📊 Current Statistics:")
        print(f"Total jobs: {total_jobs}")
        print(f"Pending jobs: {pending_jobs}")
        print(f"Completed jobs: {completed_jobs}")
        
        print("\n🎉 Cleanup completed successfully!")
        
    except Exception as error:
        print(f"❌ Cleanup error: {error}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(cleanup_expired_jobs())
