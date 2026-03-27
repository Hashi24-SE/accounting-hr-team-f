# User Management Endpoints

#### POST /api/v1/users
- **Description:** Create a new user and send welcome email
- **Auth:** ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | email | string | Yes | Valid email format | `hr@greensolutions.tech` |
  | role | enum | Yes | Valid Role (ROLE_ADMIN, ROLE_HR, ROLE_PAYROLL) | `ROLE_HR` |
  | temporaryPassword | string | Yes | Not blank | `TempP@ss123` |
- **Response 201:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "email": "hr@greensolutions.tech",
    "role": "ROLE_HR",
    "active": true
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 409 DUPLICATE_EMAIL, 403 FORBIDDEN, 400 VALIDATION_ERROR

#### GET  /api/v1/users
- **Description:** Get all users
- **Auth:** ROLE_ADMIN
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": 1,
      "email": "admin@greensolutions.tech",
      "role": "ROLE_ADMIN",
      "active": true
    }
  ],
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 403 FORBIDDEN

#### GET  /api/v1/users/{id}
- **Description:** Get user by ID
- **Auth:** ROLE_ADMIN
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
- **Error Responses:** 404 NOT_FOUND, 403 FORBIDDEN

#### PUT  /api/v1/users/{id}/role
- **Description:** Update user role
- **Auth:** ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | role | enum | Yes | Valid Role | `ROLE_PAYROLL` |
- **Response 200:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": 2,
    "email": "hr@greensolutions.tech",
    "role": "ROLE_PAYROLL",
    "active": true
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 404 NOT_FOUND, 403 FORBIDDEN

#### PUT  /api/v1/users/{id}/status
- **Description:** Update user status (active/inactive)
- **Auth:** ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | active | boolean | Yes | Not null | `false` |
- **Response 200:**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": 2,
    "email": "hr@greensolutions.tech",
    "role": "ROLE_HR",
    "active": false
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 404 NOT_FOUND, 403 FORBIDDEN