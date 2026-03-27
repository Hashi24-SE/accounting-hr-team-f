# Department Endpoints

#### GET  /api/v1/departments
- **Description:** List all departments
- **Auth:** Authenticated users
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": 1,
      "code": "HR",
      "name": "Human Resources",
      "status": "ACTIVE"
    }
  ],
  "timestamp": "2026-03-24T22:00:00"
}
```

#### GET  /api/v1/departments/{id}
- **Description:** Get department by ID
- **Auth:** Authenticated users
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "code": "HR",
    "name": "Human Resources",
    "status": "ACTIVE"
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 404 NOT_FOUND

#### POST /api/v1/departments
- **Description:** Create a new department
- **Auth:** ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | code | string | Yes | max 20 chars | `LEGAL` |
  | name | string | Yes | max 100 chars | `Legal Department` |
- **Response 201:**
```json
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "id": 6,
    "code": "LEGAL",
    "name": "Legal Department",
    "status": "ACTIVE"
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 409 DUPLICATE_CODE, 403 FORBIDDEN

#### PUT  /api/v1/departments/{id}
- **Description:** Update an existing department
- **Auth:** ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | code | string | Yes | max 20 chars | `LEGAL` |
  | name | string | Yes | max 100 chars | `Corporate Legal` |
- **Response 200:**
```json
{
  "success": true,
  "message": "Department updated successfully",
  "data": {
    "id": 6,
    "code": "LEGAL",
    "name": "Corporate Legal",
    "status": "ACTIVE"
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 404 NOT_FOUND, 409 DUPLICATE_CODE, 403 FORBIDDEN