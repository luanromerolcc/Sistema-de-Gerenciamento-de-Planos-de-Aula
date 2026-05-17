# Multi-stage Dockerfile for Node.js backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for prisma CLI)
COPY package*.json ./
RUN npm ci

# Copy schema for Prisma generation
COPY prisma ./prisma

# Generate Prisma Client in builder stage
RUN npx prisma generate

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install system dependencies for Prisma, Puppeteer, and OpenSSL
RUN apk add --no-cache \
    openssl \
    chromium \
    font-noto \
    freetype \
    harfbuzz \
    ca-certificates \
    dumb-init

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy entire node_modules from builder (includes Prisma engines + all deps)
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY . .

# Remove devDependencies from runtime (optional, to reduce size)
RUN npm prune --omit=dev

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "src/server.js"]