# ==========================================
# Multi-stage Dockerfile for React + Vite
# ==========================================

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the app with environment variables
# Note: VITE_ variables must be passed at build time
ARG VITE_API_URL
ARG VITE_POSTHOG_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GOONG_API_KEY
ARG VITE_MAP4D_API_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOONG_API_KEY=$VITE_GOONG_API_KEY
ENV VITE_MAP4D_API_KEY=$VITE_MAP4D_API_KEY

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
