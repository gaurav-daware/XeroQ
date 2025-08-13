from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class PrintOptions(BaseModel):
    colorMode: str
    copies: str
    duplex: Optional[str] = None
    paperSize: Optional[str] = None
    imageSize: Optional[str] = None

class PrintJob(BaseModel):
    otp: str
    filename: str
    file_path: str
    file_type: str
    print_options: Dict[str, Any]
    upload_time: str
    status: str = "pending"
    expires_at: str
    completed_at: Optional[str] = None
    
    class Config:
        from_attributes = True
