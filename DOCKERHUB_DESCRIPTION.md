Test Data Engine — Docker image
================================

Overview
--------
This Docker image contains a production-ready static build of the Test Data Engine React application served by `nginx` (multi-stage build: Node builder → nginx). It's designed to be small, run without elevated privileges, and expose a lightweight health and security inspection surface for CI/automation.

Quick usage
-----------
- Pull:

  docker pull devbanukotte/test-data-engine:<tag>

- Run (local testing):

  docker run --rm -p 8080:80 devbanukotte/test-data-engine:<tag>

  Then open: http://localhost:8080/

Health & inspection endpoints
-----------------------------
- /health — returns 200/OK (used by container healthchecks).
- /security — small HTML page that surfaces build-time `npm audit` and other metadata.
- /security-audit.json — `npm audit --json` output captured at build time (if available).
- /os-packages.txt — OS package list captured from the image at build time.
- /image-scan.json — optional Trivy image scan JSON if a scan was performed and copied into the container.

Image metadata / labels
-----------------------
The image includes OCI labels such as `org.opencontainers.image.version`, `org.opencontainers.image.title`, `org.opencontainers.image.description`, and `org.opencontainers.image.authors`. A `maintainer` label is also present.

Security notes
--------------
- The image runs `nginx` as the non-root `nginx` user where possible and creates required runtime directories with correct ownership.
- The repository captures `npm audit` at build time, but auditing should also be performed in CI with an image scanner (e.g., Trivy) for layer-level CVE checks.
- Consider restricting access to the `/security*` endpoints in production; they exist for transparency and internal auditing.

Building & publishing
----------------------
Build locally with a version tag and push to Docker Hub:

```bash
docker build -t devbanukotte/test-data-engine:1.0.0 --build-arg IMAGE_VERSION=1.0.0 .
docker push devbanukotte/test-data-engine:1.0.0
```

CI recommendation
-----------------
- Build and scan the image in CI, tag by semantic version or CI build number, and push only when scans pass.
- Example pipeline steps: build → npm audit → run Trivy → sign/tag → push.

Maintainer
----------
devbanukotte

License
-------
See the repository root for license information.
