# HireStack AI (Production)

HireStack AI is a full-stack, AI-powered interview preparation platform. It helps job seekers bridge the gap between their resume and target roles through automated reports and realistic, voice-supported mock interviews.

---

## 📋 Table of Contents

- [Core Features](#core-features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Backend Deployment (AWS EC2)](#backend-deployment-aws-ec2)
  - [Docker Configuration](#docker-configuration)
  - [EC2 Run Command](#ec2-run-command)
- [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
  - [API Proxy (Free SSL/CORS Fix)](#api-proxy-free-sslcors-fix)
  - [Vercel & Netlify Configs](#vercel--netlify-configs)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [License](#license)

---

## 🌟 Core Features

- **AI Interview Reports**: Upload a resume (PDF) and role context to receive a structured 7-day prep plan, skill gap analysis, and practice questions.
- **Neural Simulation (Mock Interviews)**: Practice with an AI interviewer that provides real-time follow-up questions, behavioral tracking (face presence/emotions), and scoring.
- **Professional PDF Exports**: Generate high-quality PDF reports for all analyses and simulations.
- **Secure Auth**: JWT-based sessions with OTP email verification.

---

## 🏗️ Architecture Overview

For production, HireStack AI uses a **Split Deployment** strategy to ensure high availability and free SSL handling:

1.  **Frontend (Netlify)**: The React app is hosted on Netlify (HTTPS). It uses a server-side proxy to communicate with the backend without triggering "Mixed Content" blocks or CORS errors.
2.  **Backend (AWS EC2)**: The Node.js server runs as a standalone **Docker container** (Port 5000) on an Ubuntu instance, managing MongoDB connections, AI calls to Groq, and PDF generation with Puppeteer.

---

## 🛠️ Tech Stack

**Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion, Three.js, Face-API.  
**Backend**: Node.js, Express 5, MongoDB + Mongoose, JWT, Puppeteer.  
**AI & Cloud**: Groq SDK (Llama models), AWS EC2, Netlify, Docker.

---

## ☁️ Backend Deployment (AWS EC2)

### Docker Configuration
The backend is built as a standalone service optimized for Linux:

1.  **Base Image**: `node:20-slim` (Selected for Puppeteer/Chromium stability).
2.  **Platform Support**: Built for `linux/amd64` to match EC2 architecture.
3.  **Security**: Runs as a non-root user.

**Build Command (AMD64):**
```bash
docker buildx build --platform linux/amd64 -t your-username/interview-backend:latest --push .
```

### EC2 Run Command
On your EC2, run the following to start the backend on **Port 5000**:

```bash
docker pull your-username/interview-backend:latest
docker rm -f interview-backend || true
docker run -d \
  --name interview-backend \
  --env-file .env \
  -e PORT=5000 \
  -p 5000:5000 \
  --restart always \
  your-username/interview-backend:latest
```

> [!IMPORTANT]
> Ensure your AWS Security Group allows Inbound TCP traffic on **Port 5000**.

---

## 🚀 Frontend Deployment (Netlify)

### API Proxy (Free SSL/CORS Fix)
Since Netlify is **HTTPS** and your EC2 is **HTTP**, browsers will block standard requests. We solve this using **Netlify Redirects** in the `netlify.toml` file:

```toml
[[redirects]]
  from = "/api/*"
  to = "http://15.206.166.175:5000/api/:splat"
  status = 200
  force = true
```

### Build Settings
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment Variables**: `VITE_API_URL` = `/api`

---

## 🔑 Environment Variables

### Backend (`.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_secret_key
GROQ_API_KEY=your_groq_key
CORS_ORIGINS=https://your-site.netlify.app
GOOGLE_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
```

### Frontend (`client/.env.production`)
```env
VITE_API_URL=/api
```

---

## 💻 Local Development

1.  `npm install` in both `client/` and `Server/` folders.
2.  Start the Backend: `npm run dev` (Port 3000/5000).
3.  Start the Frontend: `npm run dev` (Port 5173).

---

## ⚖️ License
ISC
