# Authentication Server (Node.js + Express + MongoDB)

This folder contains the backend server for the project.

## Tech Stack

- Node.js (ES modules)
- Express
- MongoDB + Mongoose
- JWT authentication
- HTTP-only refresh token cookies
- OTP email verification using Nodemailer (Gmail OAuth2)

## Project Structure

- `server.js` - Entry point, starts DB and HTTP server
- `src/app.js` - Express app and middleware setup
- `src/config/config.js` - Environment loading and config validation
- `src/config/database.js` - MongoDB connection
- `src/routes/auth.route.js` - Auth routes
- `src/controllers/auth.controller.js` - Auth business logic
- `src/models/user.model.js` - User model
- `src/models/session.model.js` - Session model
- `src/models/otp.model.js` - OTP model with TTL index
- `src/services/email.services.js` - Email sender service
- `src/utils/otp.util.js` - OTP generator and email HTML utility

## Environment Variables

Create a `.env` file in the `Server` folder.

Required:

- `MONGODB_URI` (or `MONGO_URI`)
- `JWT_SECRET`
- `PORT` (default is 3000 if not provided)

For email OTP using Gmail OAuth2:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_USER`

Optional:

- `NODE_ENV` (defaults to `development`)

## Installation

From this `Server` directory:

```bash
npm install
```

## Run the Server

```bash
node server.js
```

On success, logs will show:

- MongoDB connected successfully
- Server is running on the configured port

## Authentication Design

- Access token:
  - JWT returned in response body (`acesstoken` field)
  - Short lifetime (15 minutes)
- Refresh token:
  - JWT stored in `refreshToken` HTTP-only cookie
  - Long lifetime (7 days)
  - Hashed and stored in `Session` collection
- Password storage:
  - SHA-256 hash is stored
- Email verification:
  - 6-digit OTP hashed and stored in `Otp` collection
  - OTP auto-expires in 10 minutes (Mongo TTL index)

## API Base URL

- Local: `http://localhost:3000`

## API Endpoints

### Health

1. `GET /`
- Description: Basic welcome route
- Response: `Welcome to the Authentication System API`

### Auth Routes (prefix: `/api/auth`)

1. `POST /api/auth/register`
- Description: Register user, create session, issue tokens, generate OTP, send verification email
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
- Description: Login verified user, create session, issue tokens
- Body:
```json
{
  "email": "john@example.com",
  "password": "Pass@1234"
}
```
- Success: `200`
- Note: Returns error if email is not verified

3. `POST /api/auth/verify-email`
- Description: Verify account using 6-digit OTP
- Body:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```
- Success: `200`

4. `POST /api/auth/resend-otp`
- Description: Regenerate and resend OTP for unverified user
- Body:
```json
{
  "email": "john@example.com"
}
```
- Success: `200`

5. `POST /api/auth/refresh-token`
- Description: Rotate refresh token cookie and return new access token
- Auth: Requires `refreshToken` cookie
- Success: `200`

6. `GET /api/auth/profile`
- Description: Get current user profile
- Auth: Bearer access token in `Authorization` header
- Header example:
```text
Authorization: Bearer <access_token>
```
- Success: `200`

7. `POST /api/auth/logout`
- Description: Revoke current session and clear refresh token cookie
- Auth: Requires `refreshToken` cookie
- Success: `200`

8. `POST /api/auth/logout-all`
- Description: Revoke all sessions for current user and clear refresh token cookie
- Auth: Requires `refreshToken` cookie
- Success: `200`

## Common Error Responses

- `400` - Validation issue, invalid credentials, invalid OTP, or session problems
- `401` - Missing/invalid auth token or missing refresh token cookie
- `404` - User not found
- `500` - Internal server error

## Cookies and Security Notes

- Refresh cookie options currently use:
  - `httpOnly: true`
  - `secure: true`
  - `sameSite: 'strict'`
- In local HTTP development, `secure: true` may prevent cookie behavior in browsers unless HTTPS is used.

## CORS

CORS is configured in `src/app.js`.
If you plan to call this API from a browser frontend, make sure your frontend origin(s) are allowed in the CORS origin allowlist.

## Quick Manual Test (cURL)

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

## Notes

- Email sending returns a graceful failure payload in development if Gmail OAuth2 config is missing, to keep OTP flows testable.
- OTP values are logged by the controller in development mode.
