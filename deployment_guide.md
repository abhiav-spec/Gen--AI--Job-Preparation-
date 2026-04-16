# Backend Deployment Guide (Docker + EC2)

This guide details how to build, push, and deploy the HireStack backend as a standalone container.

## 1. Local Build & Push
Navigate to the `Server` directory on your local machine before running these commands.

```bash
# 1. Login to Docker Hub
docker login

# 2. Build the image for linux/amd64 platform
# Using the --platform flag ensures it runs correctly on most EC2 instances
docker buildx build --platform linux/amd64 -t aabhinavkumar/interview-backend:latest .

# 3. Push to Docker Hub
docker push aabhinavkumar/interview-backend:latest
```

---

## 2. EC2 Deployment
Run these commands on your EC2 instance.

### Step A: Cleanup existing containers
Avoid port conflicts by removing the old backend or full-stack container.
```bash
# Force stop and remove existing backend if any
docker rm -f interview-backend || true
```

### Step B: Pull and Run the new Backend
```bash
# 1. Pull the latest image
docker pull aabhinavkumar/interview-backend:latest

# 2. Run in detached mode (-d)
# Maps EC2 port 5000 to Container port 5000
docker run -d \
  --name interview-backend \
  --env-file .env \
  -p 5000:5000 \
  --restart always \
  aabhinavkumar/interview-backend:latest
```

---

## 3. Configuration Notes
- **Port**: The application internal port is now **5000** by default.
- **Environment**: Ensure your `.env` file on EC2 is up to date with `MONGODB_URI`, `JWT_SECRET`, etc.
- **Base Image**: Uses `node:20-slim` + `chromium` to support Puppeteer PDF generation.
