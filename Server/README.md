# HireStack AI - Detailed Server Documentation 🧠🚀

This document provides a comprehensive deep dive into the architecture, functions, APIs, and AI logic of the HireStack AI backend.

---

## 🏛️ System Architecture

The server is built on a modern MERN stack architecture (Node.js/Express/MongoDB) with a focus on modularity and AI integration.

### 🔌 Core Components
- **Server Entry (`server.js`)**: Initializes the connection to MongoDB and starts the Express listener.
- **App Engine (`src/app.js`)**: Configures middleware (CORS, Morgan, `cookie-parser`) and maps top-level routes to their respectve handlers.
- **Environment Gateway (`src/config/config.js`)**: Validates and loads all critical secrets (MONGODB_URI, JWT_SECRET, AI keys, Email credentials).

---

## 📡 API Reference & Functionality

### 1️⃣ Authentication & Identity (`/api/auth`)
| Endpoint | Method | Function | Description |
| :--- | :--- | :--- | :--- |
| `/register` | `POST` | `registerUser` | Creates a user in a `pending` state, generates a 6-digit OTP using `otp-generator`, and sends it via `nodemailer`. |
| `/verify` | `POST` | `verifyEmail` | High-security validation of the OTP. On success, upgrades user status to active and issues a session JWT. |
| `/login` | `POST` | `loginUser` | Authenticates credentials and sets a secure `HTTP-Only` cookie with the session token. |
| `/logout` | `POST` | `logoutUser` | Clears the session cookie on the client. |
| `/logout-all`| `POST` | `logoutAllDevices`| Invalidation of all active refresh tokens for the user (Security Reset). |

### 2️⃣ AI Career Intelligence (`/api/interview`)
| Endpoint | Method | Function | Description |
| :--- | :--- | :--- | :--- |
| `/upload-resume` | `POST` | `uploadResume` | Utilizes `multer` for secure PDF storage and `pdf-parse` to extract raw text from candidate resumes. |
| `/generate-report`| `POST` | `generateReport` | Orchestrates a call to the AI Engine (Groq Llama 3) to analyze $(Resume + Job Description + Self Description)$ and output a structured diagnostic. |
| `/generate-resume-pdf` | `POST` | `getResumePdf` | GenAI creates a professional, tailored HTML resume, which `puppeteer` then renders into a pixel-perfect, downloadable PDF buffer. |

### 3️⃣ Neural Simulation (Mock Interview) (`/api/mock-interview`)
| Endpoint | Method | Function | Description |
| :--- | :--- | :--- | :--- |
| `/setup` | `POST` | `createMockInterview`| Initializes a persistent interview session in MongoDB, setting the role, difficulty, and job description. |
| `/start` | `POST` | `startInterview` | Triggers the AI to generate the first welcoming question tailored to the role. |
| `/answer` | `POST` | `submitAnswer` | Submits the candidate's audio/text response for real-time AI evaluation and generates the next follow-up question. |
| `/finish` | `POST` | `endInterview` | Finalizes the session, processes behavioral vision AI metrics (presence/confidence), and produces the final comprehensive score. |

---

## 🤖 GenAI Implementation Details

HireStack leverages the **Groq SDK** (Llama 3.3 70B model) in **JSON Mode** for deterministic, structured output.

### 🏗️ AI Services (`src/services/ai.service.js`)
- **`generateInterviewReport`**: Uses Zod-based schemas to ensure the AI output includes a `matchScore`, exactly 10 technical questions, exactly 5 behavioral questions, and a 7-day preparation plan.
- **`generateResumePdf`**: Instructs the AI at a low-temperature (0.4) to generate ATS-friendly HTML/CSS. The prompt enforces visual professionalism and modern layout standards.

### 🎭 Simulation Logic (`src/services/mockInterview.service.js`)
- **First Question**: Dynamically adapts the warm-up based on Difficulty (Easy/Medium/Hard).
- **Evaluating & Next Question**: The AI performs an "Internal Evaluation" of:
  - Technical Accuracy (0-10)
  - Depth of Knowledge (0-10)
  - Communication Clarity (0-10)
  - Emotional Confidence (0-10)
- **State Management**: The `historyContext` is passed with every turn to prevent redundant questions and ensure fluid conversation.

---

## 👁️ Behavior Monitoring (Vision AI Metrics)

The system doesn't just listen; it observes. During mock interviews, the frontend sends periodic telemetry about the user's presence and confidence.
- **`faceMissingDuration`**: Detects if the user looks away or leaves the frame.
- **`averageConfidence`**: Calculated from real-time emotion detection (using TensorFlow/Face-API on the client).
- **`dominantEmotion`**: Tracks if the candidate is stressed, neutral, or happy during complex technical questions.

---

## 📧 Communication Layer (`src/services/email.services.js`)

Uses **Nodemailer** with a fallback mechanism:
1. **Primary**: Secure Google App Password (SMTP) for consistent delivery.
2. **Template System**: Sends professionally styled OTP emails and welcome notifications.

---

## 🛡️ Security & Middleware

- **`auth.middleware.js`**: Re-verifies every incoming request against the secret `JWT_SECRET`.
- **`file.middleware.js`**: Restricts file uploads to `.pdf` only and limits file size to 5MB to prevent DoS attacks.
- **Data Protection**: Sensitive keys like `GOOGLE_GENAI_API_KEY` are never exposed to the client.

## 📦 Database Schema Overview
- **`User`**: Core profile + hashed passwords + verification status.
- **`MockInterview`**: Stores `qaHistory` (questions & answers), role settings, and vision AI behavioral metrics.
- **`InterviewReport`**: Stores the output of the Career Intelligence engine.
- **`Notification`**: Tracks unread system alerts for the user.

---

## 📜 License
ISC License. Built with ⚡ for the next generation of job seekers.
