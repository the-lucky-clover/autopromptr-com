#!/bin/bash
echo "🚀 Starting AutoPromptr Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Navigate to backend directory
cd apps/backend-flask

# Check if virtual environment exists, create if not
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
playwright install chromium

# Check for GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  GEMINI_API_KEY not set!"
    echo "Please set it with: export GEMINI_API_KEY='your-key-here'"
    echo "Get your key from: https://makersuite.google.com/app/apikey"
    echo ""
    echo "Starting server anyway (some features will be limited)..."
fi

echo "✅ Starting Flask server on http://localhost:5000"
python app.py