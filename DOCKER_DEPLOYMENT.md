# 🐳 TRAVYY - Docker Deployment Guide

## 📋 Tổng quan

Hướng dẫn chi tiết để containerize và deploy hệ thống TRAVYY sử dụng Docker và Docker Compose.

### 🏗️ Kiến trúc Docker

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network: travyy-network            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │   Frontend   │   │   Backend    │   │ AI Service   │    │
│  │  (Nginx)     │◄──┤  (Node.js)   │◄──┤  (FastAPI)   │    │
│  │  Port: 80    │   │  Port: 4000  │   │  Port: 8088  │    │
│  └──────────────┘   └──────┬───────┘   └──────────────┘    │
│                             │                                 │
│                      ┌──────▼───────┐                        │
│                      │   MongoDB    │                        │
│                      │  Port: 27017 │                        │
│                      └──────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites

```powershell
# Kiểm tra Docker đã cài chưa
docker --version
docker-compose --version

# Nếu chưa có, download tại: https://www.docker.com/products/docker-desktop
```

### 2. Chuẩn bị Environment Variables

```powershell
# Copy template
cp .env.example .env

# Edit file .env và điền thông tin:
# - JWT secrets
# - OAuth credentials (Google, Facebook)
# - PayPal credentials
# - Email SMTP settings
# - API keys (Gemini, Goong, Map4D)
```

### 3. Build và Run

```powershell
# Build tất cả services
docker-compose build

# Start services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Verify Deployment

```powershell
# Check services status
docker-compose ps

# Test health checks
curl http://localhost:8088/healthz  # AI Service
curl http://localhost:4000/api/auth/healthz  # Backend
curl http://localhost:80/health  # Frontend

# Access application
# Frontend: http://localhost
# Backend API: http://localhost:4000
```

---

## 📦 Services Details

### 1. MongoDB (Database)

**Image:** `mongo:6`  
**Port:** `27017`  
**Volumes:**
- `mongodb_data:/data/db` - Database files
- `mongodb_config:/data/configdb` - Config files

**Environment:**
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
```

**Connect String:**
```
mongodb://admin:password@mongodb:27017/travelApp?authSource=admin
```

### 2. AI Service (Python + FastAPI)

**Build Context:** `./ai`  
**Port:** `8088`  
**Volumes:**
- `ai_index:/app/index` - FAISS index persistence

**Key Features:**
- Vietnamese embeddings (AITeamVN/Vietnamese_Embedding_v2)
- FAISS vector search
- Hybrid search (semantic + keyword)

**Endpoints:**
- `GET /healthz` - Health check
- `POST /embed` - Generate embeddings
- `POST /search` - Semantic search
- `POST /hybrid-search` - Hybrid search

### 3. Backend (Node.js + Express)

**Build Context:** `./touring-be`  
**Port:** `4000`  
**Dependencies:** MongoDB, AI Service

**Key Features:**
- JWT authentication
- OAuth (Google, Facebook)
- PayPal integration
- Socket.IO for real-time
- Email notifications

**Important Endpoints:**
- `GET /api/auth/healthz` - Health check
- `POST /api/auth/login` - Login
- `POST /api/discover/parse` - AI discovery
- `POST /api/itinerary/create` - Create itinerary

### 4. Frontend (React + Vite + Nginx)

**Build Context:** `./touring-fe`  
**Port:** `80` (HTTP), `443` (HTTPS)  
**Dependencies:** Backend

**Build Args (Required):**
```env
VITE_API_URL=http://localhost:4000
VITE_POSTHOG_KEY=your_key
VITE_GOONG_API_KEY=your_key
VITE_MAP4D_API_KEY=your_key
```

---

## 🔧 Configuration

### Development vs Production

**Development (docker-compose.override.yml):**
```yaml
version: '3.8'
services:
  backend:
    environment:
      NODE_ENV: development
    volumes:
      - ./touring-be:/app
      - /app/node_modules
    command: npm run dev
  
  frontend:
    build:
      args:
        VITE_API_URL: http://localhost:4000
```

**Production (.env):**
```env
NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🔐 Security Checklist

### Before Production Deployment:

- [ ] **Generate new JWT secrets**
  ```powershell
  # PowerShell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 255 }))
  ```

- [ ] **Update OAuth Callbacks**
  - Google Console: Add production callback URL
  - Facebook Console: Add production callback URL

- [ ] **CORS Configuration**
  - Update `CORS_ORIGINS` với domain thật
  - Kiểm tra Socket.IO CORS

- [ ] **HTTPS/SSL**
  - Setup Let's Encrypt hoặc SSL certificate
  - Thêm volume cho certificates trong docker-compose

- [ ] **Database Security**
  - Đổi MongoDB password mạnh
  - Tắt port mapping 27017 nếu không cần external access
  - Backup database định kỳ

- [ ] **API Keys**
  - Sử dụng production keys cho PayPal, Gemini
  - Rotate keys định kỳ

---

## 📊 Monitoring & Logs

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f ai-service

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Monitor Resources

```powershell
# Container stats
docker stats

# Inspect service
docker-compose exec backend sh
docker-compose exec ai-service bash
```

### Health Checks

```powershell
# Check health status
docker-compose ps

# Manual health checks
curl http://localhost:8088/healthz
curl http://localhost:4000/api/auth/healthz
curl http://localhost:80/health
```

---

## 🔄 Database Management

### Backup MongoDB

```powershell
# Backup
docker-compose exec mongodb mongodump --uri="mongodb://admin:password@localhost:27017/travelApp?authSource=admin" --out=/backup

# Copy backup to host
docker cp travyy-mongodb:/backup ./backup

# Restore
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password@localhost:27017/travelApp?authSource=admin" /backup/travelApp
```

### Initialize Data

```powershell
# Run initialization script
docker-compose exec backend node scripts/init-zones.js
docker-compose exec backend node scripts/seed-data.js
```

---

## 🐛 Troubleshooting

### Service không start được

```powershell
# Check logs
docker-compose logs backend

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend

# Check environment variables
docker-compose exec backend env | grep MONGO_URI
```

### MongoDB connection failed

```powershell
# Check MongoDB is running
docker-compose ps mongodb

# Test connection
docker-compose exec backend node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('OK')).catch(e => console.error(e));"
```

### AI Service không hoạt động

```powershell
# Check logs
docker-compose logs ai-service

# Test endpoint
curl -X POST http://localhost:8088/embed \
  -H "Content-Type: application/json" \
  -d '{"texts": ["test"]}'

# Rebuild với cache mới
docker-compose build --no-cache ai-service
```

### Frontend không kết nối được Backend

```powershell
# Check VITE_API_URL build arg
docker-compose config | grep VITE_API_URL

# Rebuild frontend với URL mới
docker-compose build --build-arg VITE_API_URL=http://localhost:4000 frontend
```

---

## 🚀 Production Deployment

### Using Docker Swarm

```powershell
# Init swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml travyy

# Check services
docker service ls
docker service logs travyy_backend
```

### Using Kubernetes

Convert docker-compose to k8s:
```powershell
# Install kompose
choco install kubernetes-kompose

# Convert
kompose convert -f docker-compose.yml

# Deploy
kubectl apply -f .
```

### Cloud Deployment (AWS, Azure, GCP)

**AWS ECS:**
```powershell
# Install AWS CLI
pip install awscli

# Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-registry
docker tag travyy-backend:latest your-registry/travyy-backend:latest
docker push your-registry/travyy-backend:latest
```

**Azure Container Instances:**
```powershell
az container create --resource-group travyy-rg \
  --file docker-compose.yml \
  --location eastus
```

---

## 📝 Maintenance

### Update Services

```powershell
# Pull latest code
git pull origin main

# Rebuild và restart
docker-compose build
docker-compose up -d

# Remove old images
docker image prune -a
```

### Scale Services

```powershell
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# With load balancer (nginx)
# Update docker-compose.yml to add nginx upstream
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [MongoDB Docker Guide](https://hub.docker.com/_/mongo)

---

## 🆘 Support

Nếu gặp vấn đề:
1. Check logs: `docker-compose logs -f`
2. Check DOCKER_AUTH_CONFIG.md cho CORS/OAuth issues
3. Verify .env variables
4. Test services individually

---

**Last Updated:** November 2025  
**Version:** 1.0.0
