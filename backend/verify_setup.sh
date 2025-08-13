#!/bin/bash

echo "🔍 XeroQ Setup Verification Script"
echo "=================================="

# Check Python version
echo "🐍 Checking Python version..."
python3 --version

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "✅ Virtual environment found"
else
    echo "❌ Virtual environment not found - creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Check if requirements are installed
echo "📦 Checking Python dependencies..."
pip list | grep fastapi > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ FastAPI installed"
else
    echo "❌ FastAPI not found - installing dependencies..."
    pip install -r requirements.txt
fi

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
    echo "Please add it to your .env.local file"
    exit 1
else
    echo "✅ NEXT_PUBLIC_SUPABASE_URL configured"
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not set"
    echo "Please add it to your .env.local file"
    exit 1
else
    echo "✅ SUPABASE_SERVICE_ROLE_KEY configured"
fi

# Test Supabase connection
echo "🗄️ Testing Supabase connection..."
python3 -c "
from storage import SupabaseStorage
try:
    storage = SupabaseStorage()
    print('✅ Supabase connection successful')
except Exception as e:
    print(f'❌ Supabase connection failed: {e}')
    exit(1)
"

echo ""
echo "🎉 Setup verification complete!"
echo ""
echo "To start your application:"
echo "1. Backend: python main.py"
echo "2. Frontend: npm run dev (in parent directory)"
echo "3. Full stack: npm run dev:full (in parent directory)"
