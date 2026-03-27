# Green Solutions Tech HR Payroll System

This project contains the backend API and frontend architecture for the Green Solutions Tech HR Payroll System.

## Stack
- **Database**: Supabase PostgreSQL 15+
- **Backend**: Node.js v20 LTS + Express v4.x
- **Frontend**: React v18 + Vite + Tailwind CSS v3.4

---

## 🚀 Getting Started

### 1. Database Setup
1. Create a [Supabase](https://supabase.com/) project.
2. In the Supabase SQL Editor, run the full script located at `database/schema.sql` to generate all 19 tables and seed default data.

### 2. Backend Environment Variables
Create a `.env` file inside the `backend/` directory by duplicating `backend/.env.example`:

```bash
cd backend
cp .env.example .env
```
Fill out `SUPABASE_URL` and `SUPABASE_ANON_KEY` from your Supabase Project API settings. Configure your `MAILTRAP` credentials if you want to test email deliveries for OTP features.

### 3. Run the Backend Server
```bash
cd backend
npm install
npm run dev # or npm start / node src/index.js
```
*The server runs on `http://localhost:5000` by default. Swagger documentation is available at `http://localhost:5000/api-docs`.*

### 4. Default Admin Credentials
The initial startup sequence creates a default admin account. Use these credentials to test the login API endpoint:
- **Email:** `admin@greensolutions.tech`
- **Password:** `Admin@1234`
> ⚠️ **Warning:** Change this password after your first login via the application UI!

---

## 📄 API & Standard Response Envelope
The system expects all API responses to follow a standard JSON envelope:

**Success Example (`2xx`)**
```json
{
  "success": true,
  "message": "Employee registered successfully",
  "data": { "id": "uuid-1234", "full_name": "Jane Doe" },
  "timestamp": "2026-03-24T22:00:00.000Z"
}
```

**Error Example (`4xx` / `5xx`)**
```json
{
  "success": false,
  "status": 409,
  "code": "DUPLICATE_NIC",
  "message": "An employee with this NIC already exists",
  "timestamp": "2026-03-24T22:00:00.000Z",
  "path": "/api/employees"
}
```

**Validation Error Example (`400`)**
```json
{
  "success": false,
  "status": 400,
  "code": "VALIDATION_ERROR",
  "errors": ["full_name is required", "nic is required"],
  "timestamp": "2026-03-24T22:00:00.000Z"
}
```

## 🔒 Security & Authentication
Authentication utilizes **JWT (JSON Web Tokens)** alongside encrypted **Refresh Tokens** and cryptographically secure **OTPs** for password resets.

* **Access Token**: Short-lived (Default 1 day). Send this in the `Authorization: Bearer <token>` header on protected routes.
* **Refresh Token**: Long-lived UUID hashed via SHA-256 for secure storage. Send this strictly to the `/api/auth/refresh` endpoint to exchange for new active tokens.
* **RBAC**: Protected routes enforce Role-Based Access Control logic (`Admin`, `HR`, `Payroll`, `Finance`, `Employee`).