# Deployment Guide: HireStack AI on AWS EC2

This guide outlines the process of deploying the HireStack AI platform from a local development environment (Mac ARM64) to an AWS EC2 instance (Linux AMD64) using Docker Hub.

---

## 1. Local Preparation (Mac M-Series)

Because your Mac (ARM64) and EC2 (AMD64) use different architectures, you must build the image specifically for the target server.

### Build and Push
Run these commands in your project root on your Mac:

```bash
# Initialize Docker Buildx (required for cross-platform builds)
docker buildx create --use

# Build for AMD64 and push directly to Docker Hub
docker buildx build \
  --platform linux/amd64 \
  -t aabhinavkumar/hirestack:latest \
  -f dockerfile \
  --push .
```

---

## 2. EC2 Instance Setup

### Install Docker
Connect to your EC2 via SSH and run (Amazon Linux 2023/2):

```bash
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker $USER
```
*Note: Exit and log back in for the group permissions to take effect.*

### Configure Environment Variables
Create a `.env` file on your EC2 instance:

```bash
nano .env
```
Paste your secrets (MongoDB URI, API Keys, etc.) from your local `.env` and save (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 3. Pull and Run the Container

Execute these commands on your EC2:

```bash
# Pull the pre-built image from Docker Hub
docker pull aabhinavkumar/hirestack:latest

# Remove old container if it exists
docker rm -f hirestack || true

# Run the container
# -p 80:3000 maps the internal app port to the standard web port
docker run -d \
  --name hirestack \
  --env-file .env \
  -p 80:3000 \
  --restart always \
  aabhinavkumar/hirestack:latest
```

---

## 4. AWS Networking (Security Groups)

To make the site accessible, you must open Port 80 in the AWS Management Console:

1.  **EC2 Dashboard** -> **Instances** -> Select your instance.
2.  **Security** tab -> Click on the **Security Groups** link.
3.  **Edit inbound rules**.
4.  Add a rule:
    *   **Type**: HTTP
    *   **Port**: 80
    *   **Source**: 0.0.0.0/0 (Anywhere)
5.  **Save rules**.

---

## 5. Troubleshooting & Tips

### Blank Page / HTTPS Issues
If accessing via a raw IP (e.g., `http://43.205.126.119`), ensure `helmet` is configured to not force HTTPS:
```javascript
// Server/src/app.js
helmet({
    contentSecurityPolicy: {
        directives: {
            // ...
            upgradeInsecureRequests: null,
        },
    },
    hsts: false,
})
```

### Viewing Logs
To see what is happening inside the container on EC2:
```bash
docker logs -f hirestack
```

### Cleaning Up
To remove unused Docker memory/images on your server:
```bash
docker system prune -a
```
