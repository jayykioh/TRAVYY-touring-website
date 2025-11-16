# 🚀 Quick Start Guide - Docker Deployment

## Prerequisites
- Docker Desktop installed
- Git
- 10GB free disk space

## 1️⃣ Setup Environment (5 minutes)

```powershell
# Clone repository (nếu chưa có)
# git clone <your-repo-url>
cd "capstone project"

# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
notepad .env
```

### Required Credentials to Fill:

**JWT Secrets** (Generate 2 random strings):
```powershell
# PowerShell - Generate JWT secrets
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 255 }))
```

**MongoDB:**
- MONGO_ROOT_USERNAME
- MONGO_ROOT_PASSWORD

**Google OAuth:**
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- Get from: https://console.cloud.google.com/apis/credentials

**PayPal:**
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- Get from: https://developer.paypal.com/dashboard/

**API Keys:**
- GEMINI_API_KEY (https://ai.google.dev/)
- GOONG_API_KEY (https://account.goong.io/)
- MAP4D_API_KEY (https://map.map4d.vn/)

## 2️⃣ Validate Setup (1 minute)

```powershell
# Run validation script
.\validate-deployment.ps1
```

## 3️⃣ Build & Deploy (10-15 minutes)

```powershell
# Build all services (first time takes ~10-15 min)
docker-compose build

# Start services
docker-compose up -d

# Watch logs
docker-compose logs -f
```

## 4️⃣ Verify Deployment (2 minutes)

```powershell
# Check services status
docker-compose ps

# Test health endpoints
curl http://localhost:8088/healthz  # AI Service
curl http://localhost:4000/api/auth/healthz  # Backend
curl http://localhost:80/health  # Frontend
```

## 5️⃣ Access Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:4000
- **AI Service:** http://localhost:8088

## 🛠️ Common Commands

```powershell
# View logs
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f frontend

# Restart specific service
docker-compose restart backend

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose build backend
docker-compose up -d backend

# Remove all containers and volumes (fresh start)
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 🐛 Troubleshooting

### Service won't start
```powershell
# Check logs
docker-compose logs <service-name>

# Rebuild
docker-compose build --no-cache <service-name>
docker-compose up -d <service-name>
```

### MongoDB connection failed
```powershell
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Frontend shows "Cannot connect to server"
```powershell
# Check backend is running
docker-compose ps backend

# Verify VITE_API_URL in .env
grep VITE_API_URL .env

# Rebuild frontend with correct URL
docker-compose build --build-arg VITE_API_URL=http://localhost:4000 frontend
docker-compose up -d frontend
```

## 📚 Next Steps

- Read `DOCKER_DEPLOYMENT.md` for detailed documentation
- Read `DOCKER_AUTH_CONFIG.md` for production deployment
- Check `DOCKER_SETUP_SUMMARY.md` for complete overview

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Verify .env file has all required values
3. Ensure Docker Desktop is running
4. Check firewall isn't blocking ports 80, 4000, 8088, 27017
