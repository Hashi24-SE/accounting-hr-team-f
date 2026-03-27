const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const { validateBody } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management and records
 */

/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Register a new employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - nic
 *               - dob
 *               - designation
 *               - department
 *               - branch
 *               - start_date
 *               - bank_name
 *               - bank_branch
 *               - account_number
 *               - basic_salary
 *               - hourly_ot_rate
 *             properties:
 *               full_name:
 *                 type: string
 *               nic:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               branch:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               contract_type:
 *                 type: string
 *                 default: Permanent
 *               bank_name:
 *                 type: string
 *               bank_branch:
 *                 type: string
 *               account_number:
 *                 type: string
 *               tin:
 *                 type: string
 *               basic_salary:
 *                 type: number
 *               hourly_ot_rate:
 *                 type: number
 *             example:
 *               full_name: "Jane Doe"
 *               nic: "199012345678"
 *               dob: "1990-01-01"
 *               designation: "Software Engineer"
 *               department: "Engineering"
 *               branch: "Colombo"
 *               start_date: "2023-01-15"
 *               contract_type: "Permanent"
 *               bank_name: "Commercial Bank"
 *               bank_branch: "Kollupitiya"
 *               account_number: "1234567890"
 *               basic_salary: 150000.00
 *               hourly_ot_rate: 1500.00
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Employee registered successfully"
 *               data:
 *                 id: "uuid-1234"
 *                 full_name: "Jane Doe"
 *                 nic: "199012345678"
 *                 status: "Active"
 *               timestamp: "2026-03-24T22:00:00.000Z"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               status: 400
 *               code: "VALIDATION_ERROR"
 *               errors: ["full_name is required"]
 *               timestamp: "2026-03-24T22:00:00.000Z"
 *       409:
 *         description: Duplicate NIC
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               status: 409
 *               code: "DUPLICATE_NIC"
 *               message: "An employee with this NIC already exists"
 *               timestamp: "2026-03-24T22:00:00.000Z"
 *               path: "/api/employees"
 */
router.post(
  '/',
  authMiddleware,
  requireRole('Admin', 'HR'),
  validateBody([
    'full_name', 'nic', 'dob', 'designation', 'department', 'branch',
    'start_date', 'bank_name', 'bank_branch', 'account_number',
    'basic_salary', 'hourly_ot_rate'
  ]),
  employeeController.registerEmployee
);

/**
 * @swagger
 * /api/employees:
 *   get:
 *     summary: List all active employees
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of employees
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "uuid-1"
 *                   full_name: "John Doe"
 *                 - id: "uuid-2"
 *                   full_name: "Jane Smith"
 */
router.get('/', authMiddleware, requireRole('Admin', 'HR', 'Payroll', 'Finance'), employeeController.listEmployees);

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     summary: Get a single employee's full details
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee details including salary revisions
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "uuid-1"
 *                 full_name: "John Doe"
 *                 salary_revisions:
 *                   - id: "rev-1"
 *                     basic_salary: 100000
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               status: 404
 *               code: "NOT_FOUND"
 *               message: "Employee not found"
 */
router.get('/:id', authMiddleware, requireRole('Admin', 'HR', 'Payroll', 'Finance'), employeeController.getEmployeeById);

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     summary: Update employee details
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               branch:
 *                 type: string
 *               bank_name:
 *                 type: string
 *               bank_branch:
 *                 type: string
 *               account_number:
 *                 type: string
 *             example:
 *               designation: "Senior Engineer"
 *               department: "Engineering"
 *     responses:
 *       200:
 *         description: Updated employee details
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "uuid-1"
 *                 designation: "Senior Engineer"
 */
router.put('/:id', authMiddleware, requireRole('Admin', 'HR'), employeeController.updateEmployee);

/**
 * @swagger
 * /api/employees/{id}/status:
 *   patch:
 *     summary: Soft delete employee
 *     tags: [Employees]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deactivated
 */
router.patch('/:id/status', authMiddleware, requireRole('Admin'), employeeController.deactivateEmployee);

module.exports = router;