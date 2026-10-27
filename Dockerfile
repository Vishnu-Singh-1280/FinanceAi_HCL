# ==========================================
# FinanceAI Production Multi-Stage Dockerfile
# Optimized for Hugging Face Spaces, Koyeb, Render & Local Docker
# ==========================================

# Stage 1: Build the React + TypeScript Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.11-slim AS backend-runner
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Create non-root user (UID 1000 for Hugging Face Spaces compatibility)
RUN useradd -m -u 1000 user

# Copy backend code
COPY --chown=user:user backend ./backend

# Copy built frontend assets from Stage 1 into the location expected by FastAPI
COPY --chown=user:user --from=frontend-builder /app/frontend/dist ./frontend/dist

# Give write permissions to user for sqlite database & logs
RUN chown -R user:user /app
USER user

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_ENV=production \
    PORT=7860 \
    HOME=/home/user

# Expose port (7860 for Hugging Face Spaces, Koyeb, Render)
EXPOSE 7860

# Start FinanceAI unified server
WORKDIR /app/backend
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
