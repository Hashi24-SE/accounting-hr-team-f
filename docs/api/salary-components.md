# Salary Component Endpoints

#### POST /api/v1/salary-components/definitions
- **Description:** Create a new salary component definition
- **Auth:** ROLE_PAYROLL, ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | code | string | Yes | max 30 chars | `BONUS` |
  | name | string | Yes | max 100 chars | `Annual Bonus` |
  | componentType | enum | Yes | BASIC, ALLOWANCE, DEDUCTION, OVERTIME | `ALLOWANCE` |
  | taxableFlag | boolean | No | defaults to true | `true` |
  | statutoryApplicableFlag | boolean | No | defaults to true | `true` |
- **Response 201:**
```json
{
  "success": true,
  "message": "Component definition created successfully",
  "data": {
    "id": 9,
    "code": "BONUS",
    "name": "Annual Bonus",
    "type": "ALLOWANCE",
    "taxable": true,
    "statutoryApplicable": true
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 409 DUPLICATE_CODE

#### GET  /api/v1/salary-components/definitions
- **Description:** List all component definitions
- **Auth:** ROLE_HR, ROLE_PAYROLL, ROLE_ADMIN
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": 1,
      "code": "BASIC",
      "name": "Basic Salary",
      "type": "BASIC",
      "taxable": true,
      "statutoryApplicable": true
    }
  ],
  "timestamp": "2026-03-24T22:00:00"
}
```

#### POST /api/v1/employees/{id}/salary-components
- **Description:** Assign a salary component to an employee
- **Auth:** ROLE_PAYROLL, ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | componentDefinitionId | long | Yes | Valid ID | `1` |
  | componentNameOverride | string | No | max 100 chars | `Base Pay` |
  | amount | decimal | Yes | Positive value | `80000.00` |
  | effectiveFrom | LocalDate | Yes | Valid date | `2026-01-01` |
- **Response 201:**
```json
{
  "success": true,
  "message": "Component assigned successfully",
  "data": {
    "id": 1,
    "componentCode": "BASIC",
    "componentName": "Base Pay",
    "amount": 80000.00,
    "effectiveFrom": "2026-01-01",
    "effectiveTo": null
  },
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 409 OVERLAPPING_SALARY_REVISION

#### GET  /api/v1/employees/{id}/salary-components
- **Description:** List employee's active salary components
- **Auth:** ROLE_HR, ROLE_PAYROLL, ROLE_ADMIN
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": 1,
      "componentCode": "BASIC",
      "componentName": "Basic Salary",
      "amount": 80000.00,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": null
    }
  ],
  "timestamp": "2026-03-24T22:00:00"
}
```

#### POST /api/v1/employees/{id}/salary-revisions
- **Description:** Record a salary revision
- **Auth:** ROLE_PAYROLL, ROLE_ADMIN
- **Request Body:**
  | Field | Type | Required | Validation | Example |
  |---|---|---|---|---|
  | reason | string | Yes | max 200 chars | `Annual increment` |
  | effectiveFrom | LocalDate | Yes | Valid date | `2026-04-01` |
  | approvedBy | string | Yes | max 100 chars | `admin@greensolutions.tech` |
  | remarks | string | No | max 2000 chars | `Outstanding performance` |
- **Response 200:**
```json
{
  "success": true,
  "message": "Salary revision recorded successfully",
  "data": null,
  "timestamp": "2026-03-24T22:00:00"
}
```
- **Error Responses:** 409 OVERLAPPING_SALARY_REVISION

#### GET  /api/v1/employees/{id}/salary-history
- **Description:** Get all salary components (active and historical)
- **Auth:** ROLE_PAYROLL, ROLE_ADMIN
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": [
    {
      "id": 1,
      "componentCode": "BASIC",
      "componentName": "Basic Salary",
      "amount": 80000.00,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": "2026-03-31"
    },
    {
      "id": 2,
      "componentCode": "BASIC",
      "componentName": "Basic Salary",
      "amount": 90000.00,
      "effectiveFrom": "2026-04-01",
      "effectiveTo": null
    }
  ],
  "timestamp": "2026-03-24T22:00:00"
}
```

#### GET  /api/v1/employees/{id}/gross-salary
- **Description:** Calculate gross salary for a specific month
- **Auth:** ROLE_PAYROLL, ROLE_ADMIN
- **Query Parameters:** `month=YYYY-MM` (Required)
- **Response 200:**
```json
{
  "success": true,
  "message": null,
  "data": {
    "basicSalary": 80000.00,
    "totalAllowances": 5000.00,
    "overtimePay": 0.00,
    "grossSalary": 85000.00,
    "allowanceBreakdown": {
      "Transport Allowance": 5000.00
    }
  },
  "timestamp": "2026-03-24T22:00:00"
}
```