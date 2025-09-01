# Docker Commands for Test Data Engine

# Build the production Docker image
build:
	docker build -t test-data-engine .

# Run the production container
run:
	docker run -p 8080:80 --name test-data-engine-app test-data-engine

# Run with docker-compose (production)
up:
	docker-compose up -d

# Stop the application
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Rebuild and restart
restart:
	docker-compose down
	docker-compose up --build -d

# Development mode with hot reloading
dev:
	docker-compose --profile dev up

# Clean up Docker resources
clean:
	docker-compose down -v
	docker system prune -f
	docker image rm test-data-engine || true

# Full rebuild
rebuild:
	make clean
	make build
	make up

# Test Docker build with comprehensive error reporting
test:
	./docker-build-test.sh

# Quick test build (faster, less verbose)
test-quick:
	docker build -t test-data-engine-test . && echo "✅ Quick test build successful!"

# Clean Docker cache and rebuild
clean-build:
	docker system prune -f
	docker build --no-cache -t test-data-engine .

# Use BuildKit for faster builds
build-fast:
	DOCKER_BUILDKIT=1 docker build -t test-data-engine .

# Debug build with verbose output
build-debug:
	docker build --no-cache --progress=plain -t test-data-engine .

# Health check
health:
	wget --no-verbose --tries=1 --spider http://localhost:8080/health || echo "Service is not healthy"

# View running containers
ps:
	docker-compose ps

.PHONY: build run up down logs restart dev clean rebuild health ps
