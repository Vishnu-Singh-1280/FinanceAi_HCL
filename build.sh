#!/usr/bin/env bash
# FinanceAI Production Build Script
set -o errexit

echo ">>> Step 1: Installing backend dependencies..."
pip install -r backend/requirements.txt

echo ">>> Step 2: Building frontend static distribution..."
cd frontend
npm ci
npm run build
cd ..

echo ">>> Step 3: FinanceAI build completed successfully!"
