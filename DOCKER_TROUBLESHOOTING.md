# Docker Troubleshooting Guide

## Common Docker Build Issues and Solutions

### 1. npm ci/install fails with exit code 1

**Symptoms:**
```
failed to solve: process "/bin/sh -c npm ci" did not complete successfully: exit code: 1
```

**Solutions:**

a) **Network Issues:**
```bash
# Clear npm cache
npm cache clean --force

# Use different registry
npm config set registry https://registry.npmjs.org/

# Test registry connectivity
npm ping
```

b) **Memory Issues:**
```bash
# Increase Docker memory limit in Docker Desktop
# Or add swap space to your system
```

c) **Use Alternative Dockerfile:**
```bash
# Use the cache-enabled version
DOCKER_BUILDKIT=1 docker build -f Dockerfile.cache -t test-data-engine .

# Or build without cache
docker build --no-cache -t test-data-engine .
```

### 2. Build hangs or takes too long

**Solutions:**
```bash
# Enable BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t test-data-engine .

# Use more verbose output
docker build --progress=plain -t test-data-engine .

# Check network connectivity
ping registry.npmjs.org
```

### 3. Container fails to start

**Check logs:**
```bash
# View container logs
docker logs <container-name>

# Check if port 80 is already in use
netstat -tulpn | grep :80

# Test nginx configuration
docker run -it --rm test-data-engine nginx -t
```

### 4. Health check fails

**Debug health check:**
```bash
# Test health endpoint manually
docker run -p 8080:80 -d test-data-engine
curl http://localhost:8080/health

# Check nginx error logs
docker exec -it <container-name> tail -f /var/log/nginx/error.log
```

### 5. Permission issues

**Solutions:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Run Docker with privileged mode (not recommended for production)
docker run --privileged -p 8080:80 test-data-engine
```

## Quick Fix Commands

### Clear Everything and Start Fresh
```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Clear system cache
docker system prune -a --volumes

# Rebuild
docker build --no-cache -t test-data-engine .
```

### Test Build Step by Step
```bash
# Test package installation
docker run -it --rm -v $(pwd):/app node:18-alpine sh -c "cd /app && npm install"

# Test build process
docker run -it --rm -v $(pwd):/app node:18-alpine sh -c "cd /app && npm run build"

# Test nginx configuration
docker run -it --rm -p 8080:80 test-data-engine nginx -t
```

## Environment-Specific Issues

### macOS
```bash
# Check Docker Desktop resources
# Increase memory allocation in Docker Desktop settings

# Use host networking (if needed)
docker run --network host test-data-engine
```

### Linux
```bash
# Check available memory
free -h

# Add swap space if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Windows
```bash
# Use Linux containers in Docker Desktop
# Check Windows Subsystem for Linux (WSL) settings
# Ensure Docker Desktop has sufficient resources
```

## Performance Optimization

### Use BuildKit
```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build with cache mount
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t test-data-engine .
```

### Multi-stage Build Optimization
```bash
# Use distroless base image for smaller size
# Or use Alpine for minimal size
```

### Cache Optimization
```bash
# Use .dockerignore to exclude unnecessary files
# Order COPY commands by change frequency
# Use multi-stage builds to reduce final image size
```

## Getting Help

If you continue to have issues:

1. **Check Docker version:** `docker --version`
2. **Check Docker info:** `docker info`
3. **Check system resources:** `docker system df`
4. **View detailed build logs:** `docker build --no-cache --progress=plain -t test-data-engine .`
5. **Search GitHub issues** for similar problems
6. **Create an issue** with your Docker version, OS, and full error logs
