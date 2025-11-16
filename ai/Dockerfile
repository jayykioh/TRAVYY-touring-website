# ==========================================
# Dockerfile for Python FastAPI AI Service
# ==========================================

FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download the embedding model at build time
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('AITeamVN/Vietnamese_Embedding_v2')"

# Copy application code
COPY . .

# Create index directory
RUN mkdir -p /app/index

# Create non-root user
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose the port
EXPOSE 8088

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8088/healthz || exit 1

# Start the service
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8088"]
