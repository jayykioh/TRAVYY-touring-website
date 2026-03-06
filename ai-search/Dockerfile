FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8089

# Render injects $PORT dynamically
EXPOSE 8089

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8089}"]
