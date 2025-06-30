# ===========================================
# MULTI-STAGE BUILD FOR TWITTER API PRODUCTION
# ===========================================

# Stage 1: Dependencies and Build
FROM node:20-alpine3.16 AS builder

# Install system dependencies
RUN apk update && apk add --no-cache \
    bash \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Enable corepack for pnpm
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Production Runtime
FROM node:20-alpine3.16 AS runtime

# Install system dependencies for runtime
RUN apk update && apk add --no-cache \
    bash \
    ffmpeg \
    python3 \
    && rm -rf /var/cache/apk/*

# Create app user (security best practice)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Enable corepack for pnpm
RUN corepack enable

# Install PM2 globally
RUN npm install pm2 -g

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ecosystem.config.js ./
COPY --from=builder /app/openapi ./openapi

# Create uploads directory and set permissions
RUN mkdir -p uploads/images uploads/videos && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node dist/healthcheck.js || exit 1

# Expose port
EXPOSE 4000

# Start the application
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
