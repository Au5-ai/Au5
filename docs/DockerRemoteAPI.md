# Enabling Docker Remote API on TCP Port 2375 (Ubuntu)

## Overview

By default, Docker listens on a Unix socket (`/var/run/docker.sock`). To enable remote access via TCP (e.g., `tcp://0.0.0.0:2375`), you must configure the Docker daemon and adjust systemd settings.

---

## Step 1: Configure Docker Daemon

Edit (or create) the Docker daemon configuration file:

```bash
sudo nano /etc/docker/daemon.json
```

Add the following content:

```json
{
    "hosts": [
        "unix:///var/run/docker.sock",
        "tcp://0.0.0.0:2375"
    ]
}
```

Save and close the file.

---

## Step 2: Override Docker systemd Service

Docker’s default systemd service uses `-H fd://`, which conflicts with the TCP host setting. Override it as follows:

```bash
sudo systemctl edit docker
```

Add these lines to the editor:

```
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd
```

Save and exit.

---

## Step 3: Reload systemd and Restart Docker

Run the following commands to apply changes:

```bash
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl restart docker
```

---

## Step 4: Verify Docker API on TCP Port 2375

Test the API endpoint:

```bash
curl http://localhost:2375/_ping
```

Expected output:

```
OK
```

---

## ⚠️ Security Notice

> **Warning:** Exposing the Docker API over TCP without TLS is insecure.
>
> - Use this configuration **only** in a trusted, private network or for local development.
> - For production, configure **TLS certificates** to secure access.
> - Consider firewall rules to restrict access to port 2375.

---