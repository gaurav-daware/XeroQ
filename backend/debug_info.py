#!/usr/bin/env python3
"""
Debug information script for troubleshooting
"""

import os
import sys
from datetime import datetime

def print_debug_info():
    """Print comprehensive debug information"""
    print("🐛 XeroQ Debug Information")
    print("=" * 50)
    
    # System Information
    print(f"🖥️  System: {sys.platform}")
    print(f"🐍 Python: {sys.version}")
    print(f"📁 Working Directory: {os.getcwd()}")
    print(f"⏰ Current Time: {datetime.now()}")
    
    # Environment Variables
    print("\n🔧 Environment Variables:")
    env_vars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY", 
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_APP_URL"
    ]
    
    for var in env_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive keys
            if "KEY" in var:
                masked = value[:10] + "..." + value[-10:] if len(value) > 20 else "***"
                print(f"✅ {var}: {masked}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: Not set")
    
    # Python Packages
    print("\n📦 Installed Packages:")
    try:
        import pkg_resources
        packages = ['fastapi', 'uvicorn', 'supabase', 'pydantic']
        for package in packages:
            try:
                version = pkg_resources.get_distribution(package).version
                print(f"✅ {package}: {version}")
            except:
                print(f"❌ {package}: Not installed")
    except ImportError:
        print("❌ Cannot check package versions")
    
    # File Structure
    print("\n📁 File Structure:")
    files = [
        "main.py",
        "storage.py", 
        "models.py",
        "requirements.txt",
        "../.env.local"
    ]
    
    for file in files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"✅ {file}: {size} bytes")
        else:
            print(f"❌ {file}: Missing")
    
    # Test Supabase Connection
    print("\n🗄️ Supabase Connection Test:")
    try:
        from storage import SupabaseStorage
        storage = SupabaseStorage()
        print("✅ Supabase client initialized")
        
        # Test database connection
        import asyncio
        async def test_db():
            try:
                count = await storage.size()
                print(f"✅ Database connection successful - {count} jobs")
                return True
            except Exception as e:
                print(f"❌ Database connection failed: {e}")
                return False
        
        asyncio.run(test_db())
        
    except Exception as e:
        print(f"❌ Supabase initialization failed: {e}")
    
    print("\n" + "=" * 50)
    print("Debug information complete!")

if __name__ == "__main__":
    print_debug_info()
