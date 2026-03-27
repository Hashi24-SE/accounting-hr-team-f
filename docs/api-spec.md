# API Specification Summary

The full interactive API specification is hosted by Swagger UI at: `http://localhost:5000/api-docs`

This document summarizes the core endpoints and standard request/response envelopes expected by the frontend.

## Table of Contents
1. [Authentication API](#1-authentication-api-apiauth)
2. [Organization API](#2-organization-api-apiorganization)
3. [Employee API](#3-employee-api-apiemployees)
4. [Salary Revision API](#4-salary-revision-api-apiemployeesidsalary)

---

### Standard Response Envelope
All API endpoints follow a standard JSON response format. The frontend should expect this envelope for successful requests:

```json
{
  "success": true,
  "message": "Action completed successfully",
  "data": { "id": "uuid", "name": "Value" },
  "timestamp": "2026-03-24T22:00:00.000Z"
}
```

And this envelope for errors:

```json
{
  "success": false,
  "status": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "timestamp": "2026-03-24T22:00:00.000Z"
}
```

---

### 1. Authentication API (`/api/auth`)

* **`POST /api/auth/login`**: Authenticate using email and password. Returns access and refresh tokens along with user details.
* **`POST /api/auth/refresh`**: Request a new access token using a valid refresh token.
* **`POST /api/auth/forgot-password`**: Request an OTP to the user's registered email address.
* **`POST /api/auth/verify-otp`**: Validate an OTP against a user's email.
* **`POST /api/auth/reset-password`**: Reset the user's password using the verified OTP and a new password string.
* **`POST /api/auth/logout`** *(Protected)*: Invalidates the active refresh token.
* **`GET /api/auth/me`** *(Protected)*: Fetch current user profile.

### 2. Organization API (`/api/organization`)

* **`GET /api/organization`** *(Protected: All)*: Fetch the organization details for frontend payslip headers and branding.
* **`PUT /api/organization`** *(Protected: Admin)*: Update organization details.

### 3. Employee API (`/api/employees`)

* **`POST /api/employees`** *(Protected: Admin, HR)*: Register a new employee. A duplicate NIC check is enforced (`409`). An initial salary revision is automatically created alongside the employee record.
* **`GET /api/employees`** *(Protected: Admin, HR, Payroll, Finance)*: Fetch a list of active employees, optionally filtered by `department` or `search` parameters.
* **`GET /api/employees/:id`** *(Protected: Admin, HR, Payroll, Finance)*: Fetch full employee details including their entire `salary_revisions` history array.
* **`PUT /api/employees/:id`** *(Protected: Admin, HR)*: Update standard employee details (NIC updates are forbidden).
* **`PATCH /api/employees/:id/status`** *(Protected: Admin)*: Perform a "Soft Delete". Updates `status` to `Inactive`. The system deliberately avoids `DELETE` actions.

### 4. Salary Revision API (`/api/employees/:id/salary`)

* **`POST /api/employees/:id/salary`** *(Protected: Admin, HR)*: Add a new salary version. The system dynamically locates the currently active revision (where `end_date IS NULL`), backdates it to the day prior to the new `effective_date`, and inserts the new active record.
* **`GET /api/employees/:id/salary`** *(Protected: Admin, HR, Payroll)*: Get the full history of an employee's salary versions, ordered newest first.