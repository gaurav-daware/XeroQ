#!/bin/bash

# XeroQ Python Backend Startup Script

echo "🚀 Starting XeroQ Python Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable"
    exit 1
fi

echo "✅ Environment variables configured"

# Start the server
echo "🌟 Starting FastAPI server on http://localhost:8000"
echo "📖 API documentation available at http://localhost:8000/docs"
echo "🔄 Auto-reload enabled for development"

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
