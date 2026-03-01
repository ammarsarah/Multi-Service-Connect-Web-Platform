# =============================================================================
# Backend Dockerfile - Multi-Service Connect
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies with cache layer
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# -----------------------------------------------------------------------------
# Stage 2: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user/group
RUN addgroup -g 1001 -S nodejs && \
    adduser  -u 1001 -S nodeuser -G nodejs

WORKDIR /app

# Copy only production artifacts from build stage
COPY --from=build --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodeuser:nodejs /app/package*.json ./
COPY --from=build --chown=nodeuser:nodejs /app/server.js     ./
COPY --from=build --chown=nodeuser:nodejs /app/app.js        ./
COPY --from=build --chown=nodeuser:nodejs /app/src           ./src

# Create upload directory with proper permissions
RUN mkdir -p uploads && chown nodeuser:nodejs uploads

# Use non-root user
USER nodeuser

# Expose application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Use dumb-init to handle PID 1 responsibilities
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
