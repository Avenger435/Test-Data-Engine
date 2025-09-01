# Using Docker directly
docker run -d -p 8080:80 test-data-engine:latest

# Using Docker Compose (recommended for production)
docker-compose up -d

# Using Makefile shortcuts
make up          # Start production
make dev         # Start development mode
make test        # Run build tests


curl -I http://localhost:8080/security
curl -sS http://localhost:8080/security-audit.json | jq .   # show formatted JSON if jq available
curl -sS http://localhost:8080/os-packages.txt | head -n 30
curl -sS http://localhost:8080/image-scan.json | jq .      # only if trivy scan has been run