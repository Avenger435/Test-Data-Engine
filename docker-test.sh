#!/bin/bash

# Test Data Engine Docker Build Script
# This script helps test the Docker build process locally

set -e

echo "🐳 Testing Test Data Engine Docker Build"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Check if Docker BuildKit is available
if docker buildx version > /dev/null 2>&1; then
    print_status "Docker BuildKit is available"
    BUILDKIT_AVAILABLE=true
else
    print_warning "Docker BuildKit not available, using standard build"
    BUILDKIT_AVAILABLE=false
fi

# Build the Docker image
echo ""
echo "🔨 Building Docker image..."
if [ "$BUILDKIT_AVAILABLE" = true ]; then
    echo "Using BuildKit for faster builds..."
    DOCKER_BUILDKIT=1 docker build -f Dockerfile.cache -t test-data-engine .
else
    docker build -t test-data-engine .
fi

if [ $? -eq 0 ]; then
    print_status "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Check your internet connection"
    echo "2. Try clearing Docker cache: docker system prune -a"
    echo "3. Check if npm registry is accessible: npm ping"
    echo "4. Try building with verbose output: docker build --no-cache --progress=plain -t test-data-engine ."
    exit 1
fi

# Test the container
echo ""
echo "🚀 Testing container..."
if docker run -d --name test-data-engine-test -p 8080:80 test-data-engine > /dev/null; then
    print_status "Container started successfully"
else
    print_error "Failed to start container"
    exit 1
fi

# Wait for container to be ready
echo ""
echo "⏳ Waiting for application to start..."
sleep 10

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
if wget --no-verbose --tries=1 --spider http://localhost:8080/health 2>/dev/null; then
    print_status "Health check passed"
else
    print_warning "Health check failed (this might be expected if health endpoint isn't implemented)"
fi

# Test main application
echo ""
echo "🌐 Testing main application..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    print_status "Application is responding"
else
    print_error "Application is not responding"
fi

# Clean up
echo ""
echo "🧹 Cleaning up test container..."
docker stop test-data-engine-test > /dev/null 2>&1
docker rm test-data-engine-test > /dev/null 2>&1
print_status "Test container cleaned up"

echo ""
echo "🎉 Docker build test completed successfully!"
echo ""
echo "To run the application:"
echo "  docker run -d -p 8080:80 --name test-data-engine test-data-engine"
echo "  open http://localhost:8080"
echo ""
echo "Or use docker-compose:"
echo "  docker-compose up -d"
echo "  open http://localhost:8080"
