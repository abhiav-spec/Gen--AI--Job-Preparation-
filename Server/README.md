# HireStack AI Backend 🚀

The core intelligence engine for the HireStack career platform. This server handles neural simulations, AI interview diagnostics, automated report generation, and secure session management.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: Google Gemini API & Groq SDK
- **Authentication**: JWT (JSON Web Tokens) with Secure HTTP-Only Cookies
- **Email**: Nodemailer (supporting SMTP and OAuth2)
- **File Processing**: PDF-Parse & Multer

## 📦 Key Features

### 1. Neural Simulation (Mock Interview)
- Real-time adaptive questioning based on user performance.
- Vision-based behavior tracking (face detection, emotional analysis).
- Logic for technical and behavioral evaluation using large language models.

### 2. AI Diagnostics (Report Generator)
- Automated parsing of uploaded resumes.
- Generation of comprehensive career intelligence reports.
- Predictive performance analytics and skill trajectory mapping.

### 3. Identity & Security
- OTP-based email verification for high-security registration.
- Persistent session management with encrypted JWT.
- Device-wide logout (Neural Core Shutdown).

### 4. Notification Engine
- Real-time system alerts and interview status updates.
- Persistent notification history stored in MongoDB.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** instance (Local or Atlas)
- **GMAIL App Password** (for the email service)

### 2. Environment Setup
Create a `.env` file in the root directory (or parent of Server) with the following:

```env
# Server Config
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_secret

# Email Config (Required for Registration)
GOOGLE_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password

# AI API Keys
GOOGLE_GENAI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Installation
```bash
cd Server
npm install
```

### 4. Running the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register`: Create a new identity (triggers OTP).
- `POST /verify`: Verify email using the 6-digit code.
- `POST /login`: Establish a neural link session.
- `POST /logout-all`: Terminate all active sessions.

### Mock Interview (`/api/mock-interview`)
- `POST /start`: Initialize a new simulation session.
- `POST /submit-answer`: Submit a response for AI evaluation.
- `POST /end`: Finalize session and trigger report generation.
- `GET /sessions`: Retrieve past simulation history.

### Diagnostics (`/api/interview`)
- `POST /upload-resume`: Process PDF files for parsing.
- `POST /generate-report`: Execute full AI analysis on background/resume/JD.

### Notifications (`/api/notifications`)
- `GET /all`: Fetch recent system alerts.
- `PATCH /:id/read`: Acknowledge a specific notification.

---

## 📂 Detailed Folder Architecture

```text
Server/
├── server.js               # Entry point - starts the express server and connects to DB
├── .env                    # (External) Environment configuration
├── src/
│   ├── app.js             # Initializing middleware (CORS, Morgan, Cookies) and root routes
│   │
│   ├── config/            # Core System Configurations
│   │   ├── config.js      # Central environment variable loader
│   │   └── database.js    # MongoDB connection pool and mongoose setup
│   │
│   ├── controllers/       # Feature Controllers (Request Logic)
│   │   ├── auth.controller.js           # Identity & Authentication logic
│   │   ├── interview.controller.js      # Resume parsing & Report generation 
│   │   ├── mockInterview.controller.js  # Real-time simulation management
│   │   └── notification.controller.js   # Dynamic alert handling
│   │
│   ├── models/            # Data Schemas (MongoDB/Mongoose)
│   │   ├── user.model.js                # Identity schema
│   │   ├── interviewReport.model.js     # Career diagnostic schema
│   │   ├── mockInterview.model.js       # Adaptive session tracking
│   │   └── notification.model.js        # System logger schema
│   │
│   ├── routes/            # REST API Endpoint Routing
│   │   ├── auth.route.js                # /api/auth
│   │   ├── interview.routes.js          # /api/interview
│   │   ├── mockInterview.routes.js      # /api/mock-interview
│   │   └── notification.routes.js       # /api/notifications
│   │
│   ├── services/          # Business Logic & External APIs
│   │   ├── ai.service.js                # Gemini/Groq neural execution
│   │   ├── email.services.js            # Nodemailer & SMTP orchestration
│   │   └── mockInterview.service.js     # State management for simulations
│   │
│   └── middleware/        # Request Context & Validation
│       ├── auth.middleware.js           # JWT verification & session guarding
│       └── file.middleware.js           # Multer configuration for secure uploads
│   
└── package.json           # Node.js dependencies & scripts
```

## 📜 License
ISC License. Built with ⚡ by the HireStack Engineering Team.
