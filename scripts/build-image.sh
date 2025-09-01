#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/build-image.sh <version>
VER=${1:-latest}
IMAGE_NAME="test-data-engine:${VER}"

echo "Building image ${IMAGE_NAME}..."

docker build --build-arg IMAGE_VERSION=${VER} -t ${IMAGE_NAME} -f Dockerfile .

echo "Built ${IMAGE_NAME}"

echo "You can run with: IMAGE_VERSION=${VER} docker-compose up -d"
