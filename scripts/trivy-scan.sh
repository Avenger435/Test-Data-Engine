#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/trivy-scan.sh <image-name:tag>
IMAGE=${1:-test-data-engine-test-data-engine:latest}
OUTDIR=$(mktemp -d)
OUTFILE="$OUTDIR/image-scan.json"

echo "Running Trivy scan for image: $IMAGE"

# Pull trivy if necessary and run as a container. This avoids requiring trivy install on host.
# Write JSON to $OUTFILE

docker run --rm -v "$OUTDIR:/out" aquasec/trivy:0.44.0 image --quiet --format json -o /out/image-scan.json "$IMAGE" >/dev/null 2>&1

if [ -f "$OUTFILE" ]; then
  echo "Scan completed"
else
  echo "Scan failed" >&2
  exit 2
fi

# Try to copy the report into the running nginx container's webroot so nginx serves it at /image-scan.json
CONTAINER=$(docker ps --filter "name=test-data-engine" --format "{{.ID}}")
if [ -n "$CONTAINER" ]; then
  docker cp "$OUTFILE" "$CONTAINER":/usr/share/nginx/html/image-scan.json >/dev/null 2>&1 || true
  echo "Report published at http://localhost:8080/image-scan.json"
else
  echo "No running 'test-data-engine' container found; report at: $OUTFILE"
fi

# cleanup
# rm -rf "$OUTDIR"
