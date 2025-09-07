import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    # Supabase Configuration
    SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # Application Configuration
    APP_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
    DEBUG_MODE = os.getenv("DEBUG_MODE", "true").lower() == "true"
    
    # File Upload Configuration - Updated limits
    MAX_FILE_SIZE_PDF = int(os.getenv("MAX_FILE_SIZE_PDF", "52428800"))  # 50MB for PDFs
    MAX_FILE_SIZE_DOCX = int(os.getenv("MAX_FILE_SIZE_DOCX", "10485760"))  # 10MB for DOCX
    MAX_FILE_SIZE_IMAGES = int(os.getenv("MAX_FILE_SIZE_IMAGES", "15728640"))  # 15MB for images
    
    # Server Configuration for large files
    MAX_REQUEST_SIZE = 100 * 1024 * 1024  # 100MB to handle 50MB PDFs with overhead
    UPLOAD_CHUNK_SIZE = 1024 * 1024  # 1MB chunks
    
    # OTP Configuration
    OTP_EXPIRY_HOURS = int(os.getenv("OTP_EXPIRY_HOURS", "1"))
    
    @classmethod
    def validate(cls):
        """Validate required environment variables"""
        required_vars = [
            "NEXT_PUBLIC_SUPABASE_URL",
            "SUPABASE_SERVICE_ROLE_KEY"
        ]
        
        missing_vars = []
        for var in required_vars:
            if not getattr(cls, var.replace("NEXT_PUBLIC_", "").replace("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_KEY")):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

settings = Settings()
