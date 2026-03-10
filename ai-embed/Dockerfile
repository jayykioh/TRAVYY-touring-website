FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8088
ENV EMBED_PROVIDER=hf_inference
ENV MODEL_NAME=intfloat/multilingual-e5-small

# Render injects $PORT dynamically
EXPOSE 8088

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8088}"]
