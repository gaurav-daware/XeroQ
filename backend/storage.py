import os
from supabase import create_client, Client
from typing import Optional, Dict, Any
import asyncio
from datetime import datetime
from models import PrintJob
from dotenv import load_dotenv

load_dotenv()

class SupabaseStorage:
    def _init_(self):
        supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_service_key:
            raise ValueError("Missing Supabase environment variables")
        
        self.supabase: Client = create_client(supabase_url, supabase_service_key)
        print("Supabase client initialized successfully")
    
    async def set(self, otp: str, job: PrintJob) -> None:
        """Store print job in database"""
        try:
            data = {
                "otp": otp,
                "filename": job.filename,
                "file_path": job.file_path,
                "file_type": job.file_type,
                "print_options": job.print_options,
                "upload_time": job.upload_time,
                "status": job.status,
                "expires_at": job.expires_at,
            }
            
            result = self.supabase.table("print_jobs").insert(data).execute()
            
            if result.data:
                print(f"Stored print job with OTP: {otp}")
            else:
                raise Exception("Failed to store print job")
                
        except Exception as error:
            print(f"Error storing print job: {error}")
            raise error
    
    async def get(self, otp: str) -> Optional[PrintJob]:
        """Retrieve print job by OTP"""
        try:
            result = self.supabase.table("print_jobs").select("*").eq("otp", otp).execute()
            
            if result.data and len(result.data) > 0:
                data = result.data[0]
                print(f"Found print job for OTP: {otp}")
                return PrintJob(**data)
            else:
                print(f"No print job found for OTP: {otp}")
                return None
                
        except Exception as error:
            print(f"Error retrieving print job: {error}")
            raise error
    
    async def delete(self, otp: str) -> bool:
        """Delete print job by OTP"""
        try:
            result = self.supabase.table("print_jobs").delete().eq("otp", otp).execute()
            print(f"Deleted print job with OTP: {otp}")
            return True
            
        except Exception as error:
            print(f"Error deleting print job: {error}")
            return False
    
    async def update(self, otp: str, updates: Dict[str, Any]) -> bool:
        """Update print job"""
        try:
            result = self.supabase.table("print_jobs").update(updates).eq("otp", otp).execute()
            
            if result.data:
                print(f"Updated print job with OTP: {otp}")
                return True
            else:
                return False
                
        except Exception as error:
            print(f"Error updating print job: {error}")
            return False
    
    async def size(self) -> int:
        """Get total number of print jobs"""
        try:
            result = self.supabase.table("print_jobs").select("*", count="exact").execute()
            return result.count if result.count else 0
            
        except Exception as error:
            print(f"Error getting collection size: {error}")
            return 0
    
    async def cleanup(self) -> None:
        """Clean up expired print jobs"""
        try:
            current_time = datetime.now().isoformat()
            result = self.supabase.table("print_jobs").delete().lt("expires_at", current_time).execute()
            print("Cleaned up expired print jobs")
            
        except Exception as error:
            print(f"Error during cleanup: {error}")
    
    async def upload_file(self, file_content: bytes, filename: str, content_type: str) -> str:
        """Upload file to Supabase Storage"""
        try:
            result = self.supabase.storage.from_("print-files").upload(
                filename, 
                file_content,
                file_options={
                    "cache-control": "3600",
                    "upsert": "false",
                    "content-type": content_type
                }
            )
            
            if result.path:
                print(f"File uploaded successfully: {result.path}")
                return result.path
            else:
                raise Exception("Failed to upload file")
                
        except Exception as error:
            print(f"Error uploading file: {error}")
            raise error
    
    async def download_file(self, file_path: str) -> bytes:
        """Download file from Supabase Storage"""
        try:
            result = self.supabase.storage.from_("print-files").download(file_path)
            
            if result:
                return result
            else:
                raise Exception("Failed to download file")
                
        except Exception as error:
            print(f"Error downloading file: {error}")
            raise error
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file from Supabase Storage"""
        try:
            result = self.supabase.storage.from_("print-files").remove([file_path])
            
            if result:
                print(f"File deleted successfully: {file_path}")
                return True
            else:
                return False
                
        except Exception as error:
            print(f"Error deleting file: {error}")
            return False