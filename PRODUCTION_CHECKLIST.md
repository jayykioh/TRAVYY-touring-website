# ✅ Production Deployment Checklist

## 🔐 Security & Authentication

### JWT Configuration
- [ ] Generate new production JWT secrets (không dùng lại dev secrets)
  ```powershell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 255 }))
  ```
- [ ] Set JWT_ACCESS_SECRET trong .env
- [ ] Set JWT_REFRESH_SECRET trong .env
- [ ] Verify ACCESS_TTL và REFRESH_TTL phù hợp (default: 30m và 30d)

### OAuth Configuration

#### Google OAuth
- [ ] Tạo production OAuth credentials tại [Google Console](https://console.cloud.google.com/apis/credentials)
- [ ] Update GOOGLE_CLIENT_ID
- [ ] Update GOOGLE_CLIENT_SECRET
- [ ] Add production callback URLs:
  - `https://yourdomain.com/api/auth/google/callback`
  - `https://api.yourdomain.com/api/auth/google/callback`
- [ ] Update GOOGLE_CALLBACK_URL trong .env

#### Facebook OAuth
- [ ] Tạo production app tại [Facebook Developers](https://developers.facebook.com/apps/)
- [ ] Update FACEBOOK_APP_ID
- [ ] Update FACEBOOK_APP_SECRET
- [ ] Add production callback URLs trong Facebook Console
- [ ] Update FACEBOOK_CALLBACK_URL trong .env
- [ ] Verify app is in "Live" mode (not Development)

### CORS Configuration
- [ ] Update CORS_ORIGINS với production domains:
  ```env
  CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  ```
- [ ] Verify không còn localhost trong CORS_ORIGINS
- [ ] Test CORS với production frontend

---

## 💳 Payment Configuration

### PayPal
- [ ] Có production PayPal Business account
- [ ] Lấy production credentials từ [PayPal Dashboard](https://developer.paypal.com/dashboard/)
- [ ] Update PAYPAL_CLIENT_ID (production)
- [ ] Update PAYPAL_CLIENT_SECRET (production)
- [ ] **Change PAYPAL_MODE=live** (không phải sandbox)
- [ ] Test payment flow trên production
- [ ] Verify webhook URLs nếu có

### MoMo (Optional - Vietnam only)
- [ ] Có MoMo Business account
- [ ] Update MOMO_PARTNER_CODE
- [ ] Update MOMO_ACCESS_KEY
- [ ] Update MOMO_SECRET_KEY
- [ ] Update MOMO_ENDPOINT to production URL

---

## 🗄️ Database Configuration

### MongoDB
- [ ] Đặt MONGO_ROOT_PASSWORD mạnh (min 16 chars, mixed case, numbers, symbols)
- [ ] Không dùng password mặc định từ .env.example
- [ ] Xem xét sử dụng MongoDB Atlas thay vì self-hosted
- [ ] Setup backup strategy (daily/weekly)
- [ ] Configure monitoring và alerts
- [ ] Restrict network access (không expose port 27017 ra ngoài nếu không cần)

---

## 🤖 AI & External Services

### Google Gemini
- [ ] Có production Gemini API key từ [Google AI Studio](https://ai.google.dev/)
- [ ] Update GEMINI_API_KEY
- [ ] Verify quota và rate limits
- [ ] Setup billing alerts

### Map Services
- [ ] **Goong Maps API:**
  - [ ] Có production key từ [Goong Account](https://account.goong.io/)
  - [ ] Update GOONG_API_KEY
  - [ ] Add production domains vào API restrictions
- [ ] **Map4D API:**
  - [ ] Có production key từ [Map4D Portal](https://map.map4d.vn/)
  - [ ] Update MAP4D_API_KEY
  - [ ] Configure domain restrictions

### PostHog Analytics (Optional)
- [ ] Create production project tại [PostHog](https://app.posthog.com/)
- [ ] Update POSTHOG_API_KEY
- [ ] Update VITE_POSTHOG_KEY cho frontend
- [ ] Verify POSTHOG_HOST

---

## 📧 Email Configuration

### SMTP Settings
- [ ] Configure production SMTP server
- [ ] Update SMTP_HOST
- [ ] Update SMTP_PORT (usually 587 for TLS)
- [ ] Update SMTP_USER
- [ ] Update SMTP_PASS (use App Password nếu dùng Gmail)
- [ ] Update MAIL_FROM với professional email
- [ ] Test email sending
- [ ] Verify SPF/DKIM records cho domain

---

## 🌐 Domain & Network

### Domain Setup
- [ ] Mua và configure domain
- [ ] Setup DNS records:
  - [ ] A record cho `yourdomain.com` → Server IP
  - [ ] A record cho `www.yourdomain.com` → Server IP
  - [ ] A record cho `api.yourdomain.com` → Server IP (nếu tách)
- [ ] Wait for DNS propagation (có thể mất 24-48h)

### SSL/HTTPS
- [ ] Setup SSL certificate (Let's Encrypt recommended)
- [ ] Configure nginx với HTTPS
- [ ] Force HTTPS redirect
- [ ] Update frontend nginx.conf:
  ```nginx
  server {
      listen 443 ssl http2;
      ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
      # ... rest of config
  }
  ```
- [ ] Add SSL renewal cron job

### Frontend Build
- [ ] Update VITE_API_URL với production URL:
  ```env
  VITE_API_URL=https://api.yourdomain.com
  # or
  VITE_API_URL=https://yourdomain.com
  ```
- [ ] Update VITE_GOOGLE_MAPS_API_KEY
- [ ] Update VITE_GOONG_API_KEY
- [ ] Update VITE_MAP4D_API_KEY
- [ ] Rebuild frontend với production args

---

## 🐳 Docker Configuration

### Environment Variables
- [ ] Tất cả variables trong .env đã điền đầy đủ
- [ ] Không có placeholder values (your_*, <...>)
- [ ] Verify NODE_ENV=production
- [ ] Run validation: `.\validate-deployment.ps1`

### Docker Compose
- [ ] Review docker-compose.yml
- [ ] Update resource limits nếu cần:
  ```yaml
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
  ```
- [ ] Configure restart policies (already set to `unless-stopped`)
- [ ] Setup volume backups

---

## 🔒 Security Hardening

### Server Security
- [ ] Keep Docker updated
- [ ] Keep host OS updated
- [ ] Configure firewall (UFW/firewalld):
  - [ ] Allow 80 (HTTP)
  - [ ] Allow 443 (HTTPS)
  - [ ] Block direct access to 4000, 8088, 27017 from outside
- [ ] Disable root SSH login
- [ ] Use SSH keys instead of passwords
- [ ] Setup fail2ban
- [ ] Enable automatic security updates

### Application Security
- [ ] Review and minimize exposed ports
- [ ] Set secure session cookies:
  ```javascript
  session({
    cookie: {
      secure: true,      // HTTPS only
      httpOnly: true,
      sameSite: 'strict'
    }
  })
  ```
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] SQL injection protection (Mongoose handles this)
- [ ] XSS protection headers (Helmet handles this)

---

## 📊 Monitoring & Logging

### Health Checks
- [ ] Verify all health endpoints work
- [ ] Setup external monitoring (UptimeRobot, Pingdom)
- [ ] Configure alerts cho downtime

### Logging
- [ ] Configure log rotation
- [ ] Setup log aggregation (optional: ELK, Loki)
- [ ] Monitor disk space
- [ ] Keep logs for audit trail

### Analytics
- [ ] PostHog configured và working
- [ ] Error tracking setup (Sentry recommended)
- [ ] Performance monitoring

---

## 🚀 Deployment Process

### Pre-Deployment
- [ ] Run validation script: `.\validate-deployment.ps1`
- [ ] Backup current database (nếu có)
- [ ] Test locally với production .env
- [ ] Document deployment steps
- [ ] Prepare rollback plan

### Deployment
```powershell
# 1. Pull latest code
git pull origin main

# 2. Build images
docker-compose build

# 3. Stop old containers
docker-compose down

# 4. Start new containers
docker-compose up -d

# 5. Watch logs
docker-compose logs -f

# 6. Verify health
curl https://yourdomain.com/health
curl https://api.yourdomain.com/api/auth/healthz
```

### Post-Deployment
- [ ] Test all critical features:
  - [ ] User registration/login
  - [ ] OAuth login (Google, Facebook)
  - [ ] Zone discovery
  - [ ] Itinerary creation
  - [ ] Payment flow
  - [ ] Email notifications
- [ ] Check logs for errors
- [ ] Monitor resource usage
- [ ] Test from multiple devices/browsers
- [ ] Verify HTTPS working
- [ ] Check SSL certificate validity

---

## 📦 Backup Strategy

### Database Backups
- [ ] Setup automated daily backups:
  ```powershell
  # Example cron job
  docker-compose exec mongodb mongodump --uri="mongodb://..." --out=/backup
  ```
- [ ] Test restore process
- [ ] Store backups offsite (AWS S3, Google Cloud Storage)
- [ ] Keep multiple backup versions (7 daily, 4 weekly, 12 monthly)

### Code & Configuration
- [ ] Backup .env file securely
- [ ] Backup docker-compose.yml
- [ ] Backup nginx configs
- [ ] Version control cho infrastructure code

---

## 🎯 Performance Optimization

### Frontend
- [ ] Enable gzip compression (nginx already configured)
- [ ] Setup CDN cho static assets (optional)
- [ ] Optimize images
- [ ] Enable browser caching

### Backend
- [ ] Configure connection pooling
- [ ] Enable compression middleware (already enabled)
- [ ] Optimize database queries
- [ ] Add caching layer (Redis) nếu cần

### Database
- [ ] Create appropriate indexes
- [ ] Monitor slow queries
- [ ] Configure connection limits
- [ ] Consider sharding nếu scale lớn

---

## 📝 Documentation

- [ ] Document production URLs
- [ ] Document deployment process
- [ ] Document rollback procedures
- [ ] Document environment variables
- [ ] Create runbook cho common issues
- [ ] Document backup/restore procedures

---

## ✅ Final Verification

**Before Going Live:**
- [ ] All items in this checklist completed
- [ ] Validation script passes without errors
- [ ] All OAuth flows tested
- [ ] Payment flows tested
- [ ] Email sending tested
- [ ] SSL certificate valid and auto-renews
- [ ] Backups configured and tested
- [ ] Monitoring setup and alerting
- [ ] Team trained on deployment/rollback
- [ ] Emergency contacts documented

**Launch Day:**
- [ ] Monitor logs closely
- [ ] Watch for errors
- [ ] Check resource usage
- [ ] Be ready to rollback if needed
- [ ] Have team on standby

---

## 🆘 Emergency Contacts

**Critical Services:**
- Domain Registrar: _____________
- DNS Provider: _____________
- Hosting Provider: _____________
- MongoDB Support: _____________
- PayPal Support: 1-888-221-1161
- Google Cloud Support: _____________

**Team Contacts:**
- DevOps Lead: _____________
- Backend Lead: _____________
- Frontend Lead: _____________
- Database Admin: _____________

---

**Last Updated:** November 16, 2025  
**Review Schedule:** Before each major deployment
