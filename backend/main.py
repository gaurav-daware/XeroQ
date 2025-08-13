from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import json
import random
import string
from datetime import datetime, timedelta
from typing import Optional
import io
from storage import SupabaseStorage
from models import PrintJob, PrintOptions
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="XeroQ Backend", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize storage
storage = SupabaseStorage()

def generate_otp() -> str:
    """Generate a 6-character OTP"""
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return ''.join(random.choice(chars) for _ in range(6))

@app.get("/")
async def root():
    return {"message": "XeroQ Python Backend is running!"}

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    printOptions: str = Form(...)
):
    """Upload file and create print job - matches Next.js /api/upload"""
    try:
        print("=== UPLOAD REQUEST START ===")
        
        # Validate file
        if not file:
            raise HTTPException(status_code=400, detail="No file provided")
        
        print(f"File details: name={file.filename}, type={file.content_type}, size={file.size}")
        
        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/jpg", 
            "image/png",
            "image/gif",
            "image/bmp",
            "image/tiff",
            "image/webp"
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Please upload PDF, DOCX, or image files."
            )
        
        # Validate file size
        max_size = 15 * 1024 * 1024 if file.content_type.startswith('image/') else 10 * 1024 * 1024
        if file.size > max_size:
            max_size_mb = '15MB' if file.content_type.startswith('image/') else '10MB'
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {max_size_mb}."
            )
        
        # Parse print options
        try:
            print_options = json.loads(printOptions)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid print options format")
        
        # Generate OTP and unique filename
        otp = generate_otp()
        timestamp = int(datetime.now().timestamp() * 1000)
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'bin'
        unique_filename = f"{otp}_{timestamp}.{file_extension}"
        
        print(f"Attempting to upload file: {unique_filename}")
        
        # Read file content
        file_content = await file.read()
        
        # Upload file to Supabase Storage
        try:
            file_path = await storage.upload_file(file_content, unique_filename, file.content_type)
            print(f"File uploaded successfully to: {file_path}")
            
            # Create print job
            print_job = PrintJob(
                otp=otp,
                filename=file.filename,
                file_path=file_path,
                file_type=file.content_type,
                print_options=print_options,
                upload_time=datetime.now().isoformat(),
                status="pending",
                expires_at=(datetime.now() + timedelta(hours=24)).isoformat()
            )
            
            # Store in database
            await storage.set(otp, print_job)
            
            total_jobs = await storage.size()
            print(f"Stored print job with OTP: {otp}, Total jobs: {total_jobs}")
            
            return {
                "success": True,
                "otp": otp,
                "message": "File uploaded successfully"
            }
            
        except Exception as upload_error:
            print(f"File upload failed: {upload_error}")
            raise HTTPException(
                status_code=500,
                detail=f"File upload failed: {str(upload_error)}"
            )
            
    except HTTPException:
        raise
    except Exception as error:
        print(f"Upload error: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(error)}"
        )

@app.get("/api/admin/lookup")
async def lookup_print_job(otp: str):
    """Lookup print job by OTP - matches Next.js /api/admin/lookup"""
    try:
        total_jobs = await storage.size()
        print(f"Looking up OTP: {otp}, Total jobs in database: {total_jobs}")
        
        if not otp:
            raise HTTPException(status_code=400, detail="OTP required")
        
        print_job = await storage.get(otp.upper())
        
        if not print_job:
            print(f"Print job not found for OTP: {otp}")
            raise HTTPException(status_code=404, detail="Print job not found or expired")
        
        # Check if expired
        expires_at = datetime.fromisoformat(print_job.expires_at.replace('Z', '+00:00'))
        if datetime.now() > expires_at.replace(tzinfo=None):
            print(f"Print job expired for OTP: {otp}")
            await storage.delete(otp)
            await storage.delete_file(print_job.file_path)
            raise HTTPException(status_code=404, detail="Print job expired")
        
        print(f"Found print job for OTP: {otp}")
        
        # Return job details
        return {
            "otp": print_job.otp,
            "filename": print_job.filename,
            "printOptions": print_job.print_options,
            "uploadTime": print_job.upload_time,
            "status": print_job.status,
            "fileUrl": f"/api/admin/download?otp={otp}"
        }
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Lookup error: {error}")
        raise HTTPException(status_code=500, detail="Lookup failed")

@app.get("/api/admin/download")
async def download_file(otp: str):
    """Download file by OTP - matches Next.js /api/admin/download"""
    try:
        if not otp:
            raise HTTPException(status_code=400, detail="OTP required")
        
        print_job = await storage.get(otp.upper())
        
        if not print_job:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check if expired
        expires_at = datetime.fromisoformat(print_job.expires_at.replace('Z', '+00:00'))
        if datetime.now() > expires_at.replace(tzinfo=None):
            await storage.delete(otp)
            await storage.delete_file(print_job.file_path)
            raise HTTPException(status_code=404, detail="File expired")
        
        # Download file from storage
        file_content = await storage.download_file(print_job.file_path)
        
        # Return file as streaming response
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=print_job.file_type,
            headers={
                "Content-Disposition": f'attachment; filename="{print_job.filename}"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Download error: {error}")
        raise HTTPException(status_code=500, detail="Download failed")

@app.post("/api/admin/complete")
async def complete_print_job(request_data: dict):
    """Mark print job as completed - matches Next.js /api/admin/complete"""
    try:
        otp = request_data.get("otp")
        
        if not otp:
            raise HTTPException(status_code=400, detail="OTP required")
        
        print_job = await storage.get(otp.upper())
        
        if not print_job:
            raise HTTPException(status_code=404, detail="Print job not found")
        
        # Update status to completed
        updated = await storage.update(otp, {
            "status": "completed",
            "completed_at": datetime.now().isoformat()
        })
        
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update job status")
        
        return {
            "success": True,
            "message": "Print job marked as completed"
        }
        
    except HTTPException:
        raise
    except Exception as error:
        print(f"Complete error: {error}")
        raise HTTPException(status_code=500, detail="Update failed")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        total_jobs = await storage.size()
        return {
            "status": "healthy",
            "database": "connected",
            "total_jobs": total_jobs,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as error:
        return {
            "status": "unhealthy",
            "error": str(error),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
