# ==========================================
# Dockerfile for Node.js Express Backend
# ==========================================

FROM node:18-alpine

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose the port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/auth/healthz', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]
