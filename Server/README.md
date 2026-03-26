# AI Interview Preparation Backend (Server)

This folder contains the backend API for the AI interview preparation platform.

The server handles:
- Authentication and session management
- Email OTP verification
- Resume upload (PDF)
- AI-generated interview report creation
- Report history and report download as PDF

## What This Website Gives to Users

From the backend perspective, users get these capabilities:
- Sign up and sign in with secure token-based auth
- Verify account email using OTP
- Request OTP resend for unverified accounts
- Keep login sessions across devices using refresh-token cookies
- Generate AI interview preparation reports from:
	- resume content
	- self-description
	- job description
- View one report
- View all past reports
- Download an interview report as PDF
- DOwmload resume 

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT (access + refresh token pattern)
- Cookie-based refresh token storage
- Nodemailer (Gmail OAuth2) for OTP email
- Multer for resume upload
- pdf-parse for extracting text from uploaded PDF resume
- Google GenAI SDK for interview analysis and resume/report content generation
- Zod + JSON schema for model-constrained AI output
- Puppeteer for PDF generation

## Project Structure

- `server.js`: Bootstraps database and HTTP server
- `src/app.js`: Express app, middleware, CORS, root route, route mounting
- `src/config/config.js`: Loads and validates environment variables
- `src/config/database.js`: MongoDB connection
- `src/routes/auth.route.js`: Authentication routes
- `src/routes/interview.routes.js`: Interview/report routes
- `src/controllers/auth.controller.js`: Auth and OTP logic
- `src/controllers/interview.controller.js`: Interview report generation/fetch/download logic
- `src/middleware/auth.middleware.js`: Auth guard middleware (JWT/session validation intent)
- `src/middleware/file.middleware.js`: Multer upload config for resume file
- `src/models/user.model.js`: User schema
- `src/models/session.model.js`: Refresh-session schema
- `src/models/otp.model.js`: OTP schema with TTL expiry
- `src/models/interviewReport.model.js`: Interview report schema
- `src/services/email.services.js`: Email service
- `src/services/ai.service.js`: AI report generation + PDF generation
- `src/utils/otp.util.js`: OTP generator and email template helper

## Environment Variables

Create `.env` in the `Server` folder.

### Required

- `MONGODB_URI` (or `MONGO_URI`)
- `JWT_SECRET`
- `PORT` (optional in practice; defaults to `3000`)

### Required for OTP Email (Gmail OAuth2)

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_USER`

### Required for AI Features

- `GOOGLE_GENAI_API_KEY`

### Optional

- `NODE_ENV` (defaults to `development`)

## Installation and Run

From `Server/`:

```bash
npm install
node server.js
```

Expected startup logs:
- `MongoDB connected successfully`
- `Server is running on port <PORT>`

Base URL (local):
- `http://localhost:3000`

## Authentication and Security Design

- Access token:
	- JWT sent in response body
	- Lifetime: `15m`
- Refresh token:
	- JWT sent in HTTP-only cookie (`refreshToken`)
	- Lifetime: `7d`
	- Hash stored in `Session` collection
- Password storage:
	- SHA-256 hash
- OTP verification:
	- 6-digit OTP is generated
	- OTP hash is stored in `Otp` collection
	- OTP documents expire in 10 minutes (TTL index)

Cookie attributes currently configured:
- `httpOnly: true`
- `secure: true`
- `sameSite: 'strict'`

Note:
- In local non-HTTPS environments, `secure: true` can block cookie behavior in browsers.

## CORS

CORS is configured with an allowlist in `src/app.js` for local frontend ports (`5173` through `5177` on localhost/127.0.0.1) and `credentials: true`.

## API Endpoints

## Health

1. `GET /`
- Description: Basic API welcome route
- Response: `Welcome to the Authentication System API`

## Auth APIs (`/api/auth`)

1. `POST /api/auth/register`
- Description: Creates user, creates session, sets refresh token cookie, returns access token, generates OTP, sends verification email
- Body:
```json
{
	"username": "john",
	"email": "john@example.com",
	"password": "Pass@1234"
}
```
- Success: `201`

2. `POST /api/auth/login`
- Description: Logs in verified user, creates session, rotates refresh cookie, returns access token
- Body:
```json
{
	"email": "john@example.com",
	"password": "Pass@1234"
}
```
- Success: `200`
- Note: Returns error when user email is not verified

3. `POST /api/auth/verify-email`
- Description: Verifies user email using 6-digit OTP
- Body:
```json
{
	"email": "john@example.com",
	"otp": "123456"
}
```
- Success: `200`

4. `POST /api/auth/resend-otp`
- Description: Regenerates and resends OTP for unverified user
- Body:
```json
{
	"email": "john@example.com"
}
```
- Success: `200`

5. `POST /api/auth/refresh-token`
- Description: Validates refresh cookie, rotates refresh token, returns new access token
- Auth: Requires `refreshToken` cookie
- Success: `200`

6. `GET /api/auth/profile`
- Description: Returns current user profile
- Auth: Bearer token in `Authorization` header
- Header example:
```text
Authorization: Bearer <access_token>
```
- Success: `200`

7. `POST /api/auth/logout`
- Description: Revokes current session and clears refresh cookie
- Auth: Requires `refreshToken` cookie
- Success: `200`

8. `POST /api/auth/logout-all`
- Description: Revokes all sessions for user and clears refresh cookie
- Auth: Requires `refreshToken` cookie
- Success: `200`

## Interview APIs (`/api/interview`)

1. `POST /api/interview/generate-interview-report`
- Description: Uploads resume PDF, extracts resume text, generates AI interview report, stores report in DB
- Auth: Protected route
- Content-Type: `multipart/form-data`
- Form fields:
	- `resume`: PDF file
	- `selfdescription`: text
	- `jobdescription`: text
- Success: `200`

2. `GET /api/interview/report/:reportId`
- Description: Fetch one saved interview report for current user
- Auth: Protected route
- Success: `200`

3. `GET /api/interview/reports/:userId`
- Description: Fetch all interview reports for current user (latest first)
- Auth: Protected route
- Success: `200`

4. `GET /api/interview/download-report/:reportId`
- Description: Generates and downloads PDF from report data
- Auth: Protected route
- Response: `application/pdf`
- Success: `200`

5. `GET /api/interview/generate-resume-pdf`
- Description: Route exists in router but has no controller attached yet (incomplete)

## Additional AI Route in `app.js`

1. `POST /api/generate-interview-report`
- Description: Direct JSON-based interview report generation (without file upload route)
- Body requires:
	- `resume`
	- `selfdescription`
	- `jobdescription`
- Success: `200`

## Interview Report Output Shape

Generated report includes:
- `title`
- `matchScore`
- `technicalQuestions[]`
	- `question`
	- `intention`
	- `answer`
- `behavioralQuestions[]`
	- `question`
	- `intention`
	- `answer`
- `skillGaps[]`
	- `skill`
	- `severity`
- `preparationPlan[]`
	- `day`
	- `focus`
	- `tasks[]`

## Common Error Responses

- `400`: Validation issues, invalid credentials/OTP, missing required fields, session issues
- `401`: Unauthorized/missing token/cookie on protected routes
- `404`: User/report not found
- `500`: Internal server error

## Functional Notes and Current Implementation Status

This section clarifies current backend behavior so documentation stays honest:

- Auth and OTP flow is implemented and usable.
- Resume upload + AI interview report flow is implemented in interview controller.
- Report download as PDF is implemented via Puppeteer in AI service.
- There is mixed module syntax (ESM + CommonJS) across files.
- Some interview route/controller symbol names are inconsistent (typos and export name mismatches).
- `auth.middleware.js` currently references variables with naming mismatch (`Acess` vs `token`) and cookie key mismatch compared to auth controller cookie usage.
- `file.middleware.js` has `stroage` typo and exports shape mismatch with current route import usage.
- `GET /api/interview/generate-resume-pdf` is declared but not implemented.

If you want, these issues can be fixed in a follow-up cleanup so all documented APIs are fully stable.

## Quick cURL Examples

Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"username":"john","email":"john@example.com","password":"Pass@1234"}'
```

Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"john@example.com","password":"Pass@1234"}'
```

Generate interview report with resume upload:
```bash
curl -X POST http://localhost:3000/api/interview/generate-interview-report \
	-H "Authorization: Bearer <access_token>" \
	-F "resume=@/path/to/resume.pdf" \
	-F "selfdescription=I am a backend developer with 2 years of experience" \
	-F "jobdescription=Node.js developer role requiring API and MongoDB skills"
```

Download report PDF:
```bash
curl -X GET http://localhost:3000/api/interview/download-report/<reportId> \
	-H "Authorization: Bearer <access_token>" \
	--output interview_report.pdf
```

## Development Notes

- In development, OTP may be logged in server console.
- If email OAuth config is missing in development, OTP flows can still be tested using fallback response fields.
