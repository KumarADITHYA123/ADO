# PS-3 ADO + BAS Setup Script for Windows
# This script sets up the complete development environment

Write-Host "🚀 Setting up PS-3 ADO + BAS Development Environment" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.10+ first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Create virtual environment for backend
Write-Host "📦 Setting up Python virtual environment..." -ForegroundColor Yellow
Set-Location backend
python -m venv venv

# Activate virtual environment and install dependencies
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
pip install -r requirements.txt

Write-Host "✅ Backend setup complete" -ForegroundColor Green

# Setup frontend
Write-Host "📦 Setting up frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm install

Write-Host "✅ Frontend setup complete" -ForegroundColor Green

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
Set-Location ..
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
New-Item -ItemType Directory -Force -Path "docs" | Out-Null
New-Item -ItemType Directory -Force -Path "tests" | Out-Null

Write-Host "✅ Directory structure created" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup complete! To start the application:" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  python main.py" -ForegroundColor White
Write-Host ""
Write-Host "Frontend:" -ForegroundColor Cyan
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open http://localhost:5173 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "🏆 Ready to revolutionize cyber defense!" -ForegroundColor Magenta
