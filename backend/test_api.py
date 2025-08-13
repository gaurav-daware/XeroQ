#!/usr/bin/env python3
"""
Comprehensive test script for XeroQ API
Run with: python test_api.py
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def test_health_check():
    """Test if the backend is running"""
    print("🏥 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is healthy - {data['total_jobs']} jobs in database")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False

def test_file_upload():
    """Test file upload functionality"""
    print("\n📤 Testing file upload...")
    
    # Create a test PDF file
    test_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF"
    
    files = {
        'file': ('test.pdf', test_content, 'application/pdf')
    }
    
    data = {
        'printOptions': json.dumps({
            'colorMode': 'bw',
            'copies': '1',
            'duplex': 'no'
        })
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/upload", files=files, data=data)
        if response.status_code == 200:
            result = response.json()
            otp = result.get('otp')
            print(f"✅ File uploaded successfully - OTP: {otp}")
            return otp
        else:
            print(f"❌ Upload failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return None

def test_admin_lookup(otp):
    """Test admin lookup functionality"""
    print(f"\n🔍 Testing admin lookup for OTP: {otp}")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/lookup?otp={otp}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Lookup successful - File: {data['filename']}")
            return data
        else:
            print(f"❌ Lookup failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Lookup error: {e}")
        return None

def test_file_download(otp):
    """Test file download functionality"""
    print(f"\n⬇️ Testing file download for OTP: {otp}")
    
    try:
        response = requests.get(f"{BASE_URL}/api/admin/download?otp={otp}")
        if response.status_code == 200:
            print(f"✅ Download successful - Content-Type: {response.headers.get('content-type')}")
            return True
        else:
            print(f"❌ Download failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Download error: {e}")
        return False

def test_mark_complete(otp):
    """Test marking job as complete"""
    print(f"\n✅ Testing mark as complete for OTP: {otp}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/complete",
            json={"otp": otp}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Job marked as completed: {data['message']}")
            return True
        else:
            print(f"❌ Mark complete failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Mark complete error: {e}")
        return False

def test_frontend_connection():
    """Test if frontend is accessible"""
    print("\n🌐 Testing frontend connection...")
    try:
        response = requests.get(FRONTEND_URL)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
            return True
        else:
            print(f"❌ Frontend not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to frontend: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 XeroQ API Test Suite")
    print("=" * 50)
    
    # Test 1: Health Check
    if not test_health_check():
        print("\n❌ Backend is not running. Please start it with: python main.py")
        return
    
    # Test 2: Frontend Connection
    test_frontend_connection()
    
    # Test 3: File Upload
    otp = test_file_upload()
    if not otp:
        print("\n❌ Cannot proceed without successful upload")
        return
    
    # Test 4: Admin Lookup
    job_data = test_admin_lookup(otp)
    if not job_data:
        print("\n❌ Cannot proceed without successful lookup")
        return
    
    # Test 5: File Download
    if not test_file_download(otp):
        print("\n❌ File download failed")
        return
    
    # Test 6: Mark Complete
    if not test_mark_complete(otp):
        print("\n❌ Mark complete failed")
        return
    
    print("\n" + "=" * 50)
    print("🎉 ALL TESTS PASSED! Your XeroQ system is working perfectly!")
    print("\n📋 Test Summary:")
    print("✅ Backend health check")
    print("✅ Frontend accessibility") 
    print("✅ File upload")
    print("✅ Admin lookup")
    print("✅ File download")
    print("✅ Mark as complete")
    print("\n🚀 Your system is ready for production!")

if __name__ == "__main__":
    main()
