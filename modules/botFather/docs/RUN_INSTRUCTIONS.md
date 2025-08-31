# Running au5-botfather Container

## Problem

The application needs access to Docker/Podman to create containers, but when running inside a container, it can't access the host's container runtime.

## Solutions

### Solution 1: Mount Podman Socket (Recommended for Podman)

```bash
 podman run --name au5-botfather --network=au5  -d -p 1368:8080 -v /run/podman/podman.sock:/var/run/docker.sock au5-botfather
```

### Solution 2: Mount Docker Socket (If using Docker)

```bash
docker run -d -p 8080:8080 -v /var/run/docker.sock:/var/run/docker.sock au5-botfather
```
