#!/bin/bash

# Docker Build Test Script for Test Data Engine
# This script provides comprehensive testing and error reporting for Docker builds

set -e

PROJECT_NAME="test-data-engine"
DOCKERFILE="Dockerfile"
BUILD_CONTEXT="."

echo "🐳 Starting Docker build test for $PROJECT_NAME..."
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Enable BuildKit for better build performance
export DOCKER_BUILDKIT=1

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
docker system prune -f > /dev/null 2>&1 || true

# Function to build with different strategies
build_with_strategy() {
    local strategy=$1
    local dockerfile=$2

    echo "🔨 Building with strategy: $strategy"

    if docker build \
        --file "$dockerfile" \
        --tag "$PROJECT_NAME:$strategy" \
        --progress=plain \
        "$BUILD_CONTEXT" 2>&1; then

        echo "✅ Build successful with $strategy strategy!"
        return 0
    else
        echo "❌ Build failed with $strategy strategy"
        return 1
    fi
}

# Try different build strategies
echo "📦 Attempting Docker build with multiple strategies..."
echo ""

# Strategy 1: Standard build
if build_with_strategy "standard" "$DOCKERFILE"; then
    echo ""
    echo "🎉 Docker build completed successfully!"
    echo "📋 Build Summary:"
    echo "   - Image: $PROJECT_NAME:standard"
    echo "   - Size: $(docker images "$PROJECT_NAME:standard" --format "table {{.Size}}" | tail -n 1)"
    echo ""
    echo "🚀 To run the container:"
    echo "   docker run -p 8080:80 $PROJECT_NAME:standard"
    echo ""
    echo "📊 To run with docker-compose:"
    echo "   docker-compose up"
    exit 0
fi

# Strategy 2: Build with no cache
echo ""
echo "🔄 Retrying build without cache..."
if build_with_strategy "no-cache" "$DOCKERFILE" --no-cache; then
    echo "✅ Build successful without cache!"
    exit 0
fi

# Strategy 3: Try alternative Dockerfile if available
if [ -f "Dockerfile.cache" ]; then
    echo ""
    echo "🔄 Trying BuildKit optimized Dockerfile..."
    if build_with_strategy "buildkit" "Dockerfile.cache"; then
        echo "✅ Build successful with BuildKit!"
        exit 0
    fi
fi

# If all strategies fail, provide troubleshooting information
echo ""
echo "❌ All build strategies failed."
echo "🔍 Troubleshooting Information:"
echo "   - Check package.json for dependency conflicts"
echo "   - Verify network connectivity for npm registry"
echo "   - Check available disk space: $(df -h . | tail -n 1 | awk '{print $4}')"
echo "   - Review build logs above for specific error messages"
echo ""
echo "📖 For detailed troubleshooting, see DOCKER_TROUBLESHOOTING.md"
echo ""
echo "🆘 Common solutions:"
echo "   1. Clear npm cache: npm cache clean --force"
echo "   2. Delete node_modules: rm -rf node_modules"
echo "   3. Reinstall dependencies: npm install"
echo "   4. Check for conflicting packages in package.json"

exit 1
