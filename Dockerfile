# Use Node.js 18 Alpine as base image for building
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache git curl

# Set npm configuration for better reliability
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_NETWORK_TIMEOUT=300000

# Copy package files
COPY package*.json ./

# Clean npm cache and install dependencies with error handling (no verbose output)
RUN npm cache clean --force && \
    npm install --no-optional || \
    (echo "First attempt failed, trying with legacy peer deps..." && \
     npm install --legacy-peer-deps) || \
    (echo "Legacy peer deps failed, trying without cache..." && \
     npm cache clean --force && \
     npm install --no-cache --legacy-peer-deps)

# Copy source code
COPY . .

# Build the application with error handling
RUN npm run build || \
    (echo "Build failed, trying with CI=false..." && \
     CI=false npm run build)

# Run npm audit at build time and embed the JSON report in the built assets (suppress extra stderr)
RUN (npm audit --json > /app/build/security-audit.json 2>/dev/null) || \
    (echo '{"error":"npm audit failed or no network"}' > /app/build/security-audit.json)

# Production stage with nginx
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Image version (set by build arg) and metadata labels
ARG IMAGE_VERSION=latest
LABEL org.opencontainers.image.version="$IMAGE_VERSION"
LABEL org.opencontainers.image.title="Test Data Engine"
LABEL org.opencontainers.image.description="Static build of the Test Data Engine React app served by nginx"
LABEL maintainer="devbanukotte"
LABEL org.opencontainers.image.authors="devbanukotte"

# Copy prebuilt security audit HTML/JS helper
COPY security.html /usr/share/nginx/html/security.html

# Copy npm audit JSON from builder (if present)
COPY --from=builder /app/build/security-audit.json /usr/share/nginx/html/security-audit.json

# Copy nginx main configuration (global directives belong in nginx.conf)
COPY nginx.conf /etc/nginx/nginx.conf

# Ensure nginx runtime/cache dirs exist and are writable
RUN mkdir -p /var/cache/nginx /run /run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /run /run/nginx /usr/share/nginx/html

# Capture OS package list at build time so it can be inspected via the /os-packages endpoint
RUN apk info -v > /usr/share/nginx/html/os-packages.txt || true

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
