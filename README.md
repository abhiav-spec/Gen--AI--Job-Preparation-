# HireStack AI

HireStack AI is a full-stack AI-powered interview preparation platform that helps job seekers practice and improve in two major ways:

1. AI Interview Report Generation: upload a resume and target role details to receive a structured interview prep report with skill gaps, likely questions, and a day-wise prep plan.
2. AI Mock Interview Simulation: run realistic mock interview sessions with follow-up questioning, scoring, behavioral telemetry, and downloadable reports.

The project uses a React + Vite frontend and a Node.js + Express + MongoDB backend, with Groq Llama models for structured AI output and Puppeteer for report PDF generation.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Docker Setup](#docker-setup)
- [Production Deployment (AWS EC2)](#production-deployment-aws-ec2)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Available Scripts](#available-scripts)
- [Roadmap Ideas](#roadmap-ideas)
- [License](#license)

## Features

- User authentication with email verification (OTP flow).
- JWT-based access flow with refresh token support.
- AI-powered interview report generation from:
  - Resume (PDF upload)
  - Self description
  - Job description
- Structured output including:
  - Match score
  - Technical and behavioral question sets
  - Skill gap analysis
  - 7-day preparation plan
- AI-powered mock interview sessions:
  - Session start and turn-by-turn answer handling
  - AI follow-up questions
  - Session completion with report generation
- Behavioral monitoring support from frontend telemetry:
  - Face presence tracking
  - Confidence/emotion signals
- Downloadable report PDFs.
- Public report sharing endpoints.
- Notification APIs for user alerts.
- Single-container deploy flow with static frontend served by backend.

## Tech Stack

Frontend:
- React 19
- Vite 8
- Tailwind CSS 4
- Framer Motion
- Axios
- React Router
- Three.js
- Face-API (@vladmandic/face-api)

Backend:
- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JWT + cookie-parser
- CORS + Helmet + express-rate-limit
- Multer (file upload)
- pdf-parse
- Puppeteer
- Nodemailer
- Groq SDK
- Zod / zod-to-json-schema

## Project Structure

```text
Gen--AI--Job-Preparation-/
├── client/                     # React frontend (Vite)
├── Server/                     # Node/Express backend
├── docker-compose.yml
├── dockerfile
├── deployment.md
└── README.md
```

Important backend folders:
- Server/src/controllers: Route handlers
- Server/src/routes: API routes
- Server/src/services: AI, email, interview logic
- Server/src/models: MongoDB schemas
- Server/src/middleware: Auth and file upload middleware

Important frontend folders:
- client/src/pages: Route-level screens
- client/src/components: Reusable UI and domain components
- client/src/api: Axios API clients
- client/src/context: Authentication state management
- client/src/utils: Face detection utilities

## How It Works

1. User registers and verifies email with OTP.
2. Client stores access token and uses refresh-token endpoint to keep sessions alive.
3. User can generate an interview report by uploading resume + role context.
4. Backend extracts and processes data, calls Groq model in structured JSON mode, stores report, and supports PDF download.
5. User can start a mock interview session, submit answers, receive AI follow-ups, and end interview for a complete report.
6. Frontend can optionally send behavior telemetry (face and confidence signals) to enrich mock interview outcomes.

## API Overview

Base URL:
- Local (frontend proxy): /api
- Direct backend local: http://localhost:3000/api

Auth routes (/api/auth):
- POST /register
- POST /login
- POST /verify-email
- POST /resend-otp
- POST /refresh-token
- POST /logout
- POST /logout-all
- GET /profile
- PATCH /profile

Interview routes (/api/interview):
- POST /generate-interview-report (auth, resume upload)
- GET /report/:reportId (auth)
- GET /reports/:userId (auth)
- DELETE /report/:reportId (auth)
- GET /download-report/:reportId (auth)
- GET /public/report/:reportId (public)
- GET /public/download-report/:reportId (public)

Mock interview routes (/api/mock-interview):
- POST /start (auth)
- GET /sessions/all (auth)
- POST /:sessionId/answer (auth)
- POST /:sessionId/end (auth)
- GET /:sessionId/download (auth)
- DELETE /:sessionId (auth)
- GET /:sessionId (auth)
- GET /public/:sessionId (public)
- GET /public/:sessionId/download (public)

Notification routes (/api/notifications):
- GET /all (auth)
- PATCH /:notificationId/read (auth)
- PATCH /all/read (auth)

Health route:
- GET /api/health

## Environment Variables

Create a .env file at the project root with values like the following:

```env
# Server
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=replace_with_a_long_random_secret

# AI
GROQ_API_KEY=your_groq_api_key

# Client / CORS
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false

# Email (Option A: Gmail App Password)
GOOGLE_USER=your_email@gmail.com
GMAIL_PASS=your_google_app_password

# Email (Option B: OAuth2 fallback)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
```

Optional frontend variable (if you do not want to rely on Vite proxy):

```env
# client/.env
VITE_API_URL=http://localhost:3000/api
```

## Local Development Setup

Prerequisites:
- Node.js 20+
- npm 9+
- MongoDB instance (Atlas or local)

1. Clone repository:

```bash
git clone https://github.com/abhiav-spec/Gen--AI--Job-Preparation-.git
cd Gen--AI--Job-Preparation-
```

2. Install backend dependencies:

```bash
cd Server
npm install
```

3. Install frontend dependencies:

```bash
cd ../client
npm install
```

4. Create root .env and fill required variables.

5. Run backend:

```bash
cd ../Server
npm run dev
```

6. Run frontend in separate terminal:

```bash
cd ../client
npm run dev
```

7. Open app:
- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/api/health

## Docker Setup

This repository includes:
- dockerfile: multi-stage build (frontend build + backend runtime)
- docker-compose.yml: runs app container and maps host port 4000 to container port 3000

Run with Docker Compose:

```bash
docker compose up --build
```

Access app at:
- http://localhost:4000

Notes:
- The container serves built frontend assets from backend public directory.
- Puppeteer uses system Chromium inside Alpine image.

## Production Deployment (AWS EC2)

A deployment guide is already available in deployment.md. In summary:

1. Build AMD64 image from Apple Silicon using buildx.
2. Push image to Docker Hub.
3. Pull and run on EC2 with .env.
4. Expose port 80 in EC2 security group.

Example run command on EC2:

```bash
docker run -d \
  --name hirestack \
  --env-file .env \
  -p 80:3000 \
  --restart always \
  aabhinavkumar/hirestack:latest
```

## Security Notes

- Do not commit .env files.
- Keep JWT_SECRET and API keys strong and rotated.
- COOKIE_SECURE should be true behind HTTPS in production.
- Restrict CORS_ORIGINS to trusted domains only.
- File upload middleware accepts PDF and enforces size limits.
- Rate limiting is enabled under /api.

## Troubleshooting

- 401 Unauthorized loops:
  - Check refresh token cookie settings and CORS credentials.
  - Verify frontend and backend origin alignment.

- Email OTP not sending:
  - Confirm GOOGLE_USER and either GMAIL_PASS or OAuth2 fields.
  - For Gmail App Password, ensure 2FA is enabled on the account.

- PDF generation fails in container:
  - Ensure Chromium dependencies are present (already configured in dockerfile).

- CORS errors in browser:
  - Add your frontend URL to CLIENT_URL and CORS_ORIGINS.

- DB connection issues:
  - Verify MONGODB_URI and network access list (if using MongoDB Atlas).

## Available Scripts

Backend (Server/package.json):
- npm run dev: Start server with nodemon
- npm start: Start server with node

Frontend (client/package.json):
- npm run dev: Start Vite dev server
- npm run build: Build production assets
- npm run preview: Preview production build
- npm run lint: Run ESLint

## Roadmap Ideas

- Add role-based authorization and admin dashboards.
- Add test coverage (unit + integration + e2e).
- Add interview session analytics over time.
- Add support for custom AI providers through provider abstraction.
- Add CI/CD workflow with lint, tests, and deployment pipeline.

## License

ISC
