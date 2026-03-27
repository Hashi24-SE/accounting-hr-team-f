# Authentication Endpoints

Tokens are obtained from `POST /api/v1/auth/login`.
Access tokens expire after 24 hours. Use `POST /api/v1/auth/refresh` to renew.

#### POST /api/v1/auth/login
- **Description:** Login and obtain JWT tokens
- **Auth:** Public
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | email | string | Yes | Valid email format | `admin@greensolutions.tech` |
  | password | string | Yes | Not blank | `Admin@1234` |
- **Response 200:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhb...",
    "refreshToken": "ref_...",
    "expiresIn": 86400000,
    "role": "ROLE_ADMIN",
    "email": "admin@greensolutions.tech"
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 401 INVALID_CREDENTIALS, 400 VALIDATION_ERROR

#### POST /api/v1/auth/refresh
- **Description:** Refresh JWT access token
- **Auth:** Public
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | refreshToken | string | Yes | Not blank | `ref_...` |
- **Response 200:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhb...",
    "refreshToken": "new_ref_...",
    "expiresIn": 86400000,
    "role": "ROLE_ADMIN",
    "email": "admin@greensolutions.tech"
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 401 TOKEN_EXPIRED, 401 INVALID_TOKEN

#### POST /api/v1/auth/logout
- **Description:** Logout and revoke refresh token
- **Auth:** Public
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | refreshToken | string | Yes | Not blank | `ref_...` |
- **Response 200:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null,
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 400 VALIDATION_ERROR

#### GET  /api/v1/auth/me
- **Description:** Get current authenticated user details
- **Auth:** Any authenticated role
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "email": "admin@greensolutions.tech",
    "role": "ROLE_ADMIN",
    "active": true
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 401 UNAUTHORIZED

#### POST /api/v1/auth/forgot-password
- **Description:** Initiate forgot password flow
- **Auth:** Public
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | email | string | Yes | Valid email format | `user@greensolutions.tech` |
- **Response 200:**
```json
{
  "success": true,
  "message": "If an account exists, an OTP has been sent to the email address.",
  "data": null,
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 400 VALIDATION_ERROR, 503 EMAIL_DELIVERY_FAILED

#### POST /api/v1/auth/verify-reset-otp
- **Description:** Verify password reset OTP
- **Auth:** Public
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | email | string | Yes | Valid email format | `user@greensolutions.tech` |
  | otp | string | Yes | Not blank | `123456` |
- **Response 200:**
```json
{
  "success": true,
  "message": "OTP verified",
  "data": null,
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 401 INVALID_CREDENTIALS, 400 VALIDATION_ERROR

#### POST /api/v1/auth/reset-password
- **Description:** Reset password and revoke all existing sessions
- **Auth:** Public
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | email | string | Yes | Valid email format | `user@greensolutions.tech` |
  | otp | string | Yes | Not blank | `123456` |
  | newPassword | string | Yes | Not blank | `NewP@ssw0rd` |
- **Response 200:**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null,
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 401 INVALID_CREDENTIALS, 400 VALIDATION_ERROR