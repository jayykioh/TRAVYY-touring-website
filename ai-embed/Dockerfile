FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=7860
ENV EMBED_PROVIDER=hf_inference
ENV MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
