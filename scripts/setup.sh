#!/bin/bash

# PS-3 ADO + BAS Setup Script
# This script sets up the complete development environment

echo "🚀 Setting up PS-3 ADO + BAS Development Environment"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.10+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create virtual environment for backend
echo "📦 Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete"

# Setup frontend
echo "📦 Setting up frontend..."
cd ../frontend
npm install

echo "✅ Frontend setup complete"

# Create necessary directories
echo "📁 Creating necessary directories..."
cd ..
mkdir -p logs
mkdir -p docs
mkdir -p tests

echo "✅ Directory structure created"

# Set permissions
echo "🔐 Setting permissions..."
chmod +x scripts/*.sh
chmod +x scripts/*.ps1

echo "✅ Permissions set"

echo ""
echo "🎉 Setup complete! To start the application:"
echo ""
echo "Backend:"
echo "  cd backend"
echo "  source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "  python main.py"
echo ""
echo "Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "🏆 Ready to revolutionize cyber defense!"
