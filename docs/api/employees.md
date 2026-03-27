# Employee Endpoints

#### POST   /api/v1/employees
- **Description:** Register a new employee
- **Auth:** ROLE_HR, ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | fullName | string | Yes | max 200 chars | `Kasun Perera` |
  | nic | string | Yes | max 20 chars | `199012345678` |
  | dateOfBirth | LocalDate | Yes | Must be in the past | `1990-05-15` |
  | tin | string | No | max 20 chars | `123456789` |
  | designation | string | Yes | max 100 chars | `Software Engineer` |
  | departmentId | long | Yes | Valid department ID | `3` |
  | branchLocation | string | Yes | max 100 chars | `Colombo` |
  | employmentStartDate | LocalDate | Yes | Valid date | `2022-01-01` |
  | contractType | enum | Yes | PERMANENT, CONTRACT, PROBATION | `PERMANENT` |
- **Response 201:**
```json
{
  "success": true,
  "message": "Employee registered successfully",
  "data": {
    "id": 1,
    "employeeCode": "EMP-001",
    "fullName": "Kasun Perera",
    "nic": "1990*****678",
    "dateOfBirth": "1990-05-15",
    "designation": "Software Engineer",
    "departmentName": "Information Technology",
    "branchLocation": "Colombo",
    "status": "ACTIVE",
    "payrollEligible": false
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 409 DUPLICATE_NIC, 400 VALIDATION_ERROR

#### GET    /api/v1/employees
- **Description:** Get all employees with pagination and filters
- **Auth:** ROLE_HR, ROLE_ADMIN, ROLE_PAYROLL
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "content": [
      {
        "id": 1,
        "employeeCode": "EMP-001",
        "fullName": "Kasun Perera",
        "nic": "1990*****678",
        "designation": "Software Engineer",
        "departmentName": "Information Technology",
        "branchLocation": "Colombo",
        "status": "ACTIVE",
        "payrollEligible": false
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20
    },
    "totalElements": 1,
    "totalPages": 1
  },
  "timestamp": "2026-03-24T22:00:00"
}
```

#### GET    /api/v1/employees/{id}
- **Description:** Get employee by ID
- **Auth:** ROLE_HR, ROLE_ADMIN, ROLE_PAYROLL
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "id": 1,
    "employeeCode": "EMP-001",
    "fullName": "Kasun Perera",
    "nic": "1990*****678",
    "dateOfBirth": "1990-05-15",
    "designation": "Software Engineer",
    "departmentName": "Information Technology",
    "branchLocation": "Colombo",
    "status": "ACTIVE",
    "payrollEligible": false
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 404 NOT_FOUND

#### PUT    /api/v1/employees/{id}
- **Description:** Update employee details
- **Auth:** ROLE_HR, ROLE_ADMIN
- **Request Body:** Same as POST /api/v1/employees
- **Response 200:** Same as GET /api/v1/employees/{id}
- **Error Responses:** 404 NOT_FOUND, 409 DUPLICATE_NIC

#### GET    /api/v1/employees/{id}/registration-status
- **Description:** Check payroll eligibility and missing fields
- **Auth:** ROLE_HR, ROLE_ADMIN, ROLE_PAYROLL
- **Response 200:**
```json
{
  "success": true,
  "message": "Status returned",
  "data": {
    "payrollEligible": false,
    "missingFields": ["Primary bank account", "Active salary components"]
  },
  "timestamp": "2026-03-24T22:00:00"
}
```

#### POST   /api/v1/employees/{id}/bank-accounts
- **Description:** Add a bank account for employee
- **Auth:** ROLE_HR, ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | bankName | string | Yes | Not blank | `Commercial Bank` |
  | branchName | string | Yes | Not blank | `Colombo Main` |
  | accountName | string | Yes | Not blank | `Kasun Perera` |
  | accountNumber | string | Yes | Not blank | `1234567890` |
  | bankCode | string | No | — | `7013` |
  | branchCode | string | No | — | `001` |
  | isPrimary | boolean | No | Defaults to false | `true` |
- **Response 201:**
```json
{
  "success": true,
  "message": "Bank account added successfully",
  "data": null,
  "timestamp": "2026-03-24T22:00:00"
}
```

#### GET    /api/v1/employees/{id}/bank-accounts
- **Description:** Get all bank accounts for employee
- **Auth:** ROLE_HR, ROLE_ADMIN, ROLE_PAYROLL
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": 1,
      "bankName": "Commercial Bank",
      "branchName": "Colombo Main",
      "accountName": "Kasun Perera",
      "accountNumber": "******7890",
      "isPrimary": true
    }
  ],
  "timestamp": "2026-03-24T22:00:00"
}
```

#### PUT    /api/v1/employees/{id}/bank-accounts/{accountId}/primary
- **Description:** Set bank account as primary
- **Auth:** ROLE_HR, ROLE_ADMIN
- **Response 200:**
```json
{
  "success": true,
  "message": "Primary bank account updated successfully",
  "data": null,
  "timestamp": "2026-03-24T22:00:00"
}
```

#### DELETE /api/v1/employees/{id}/bank-accounts/{accountId}
- **Description:** Delete a bank account
- **Auth:** ROLE_HR, ROLE_ADMIN
- **Response 200:**
```json
{
  "success": true,
  "message": "Bank account deleted successfully",
  "data": null,
  "timestamp": "2026-03-24T22:00:00"
}
```