const express = require('express');
// mergeParams required so we can access :id from parent router
const router = express.Router({ mergeParams: true });
const salaryController = require('../controllers/salaryController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const { validateBody } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Salary Revision
 *   description: Managing employee salary revisions
 */

/**
 * @swagger
 * /api/employees/{id}/salary:
 *   post:
 *     summary: Add a new salary revision
 *     tags: [Salary Revision]
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
 *             required:
 *               - basic_salary
 *               - hourly_ot_rate
 *               - effective_date
 *             properties:
 *               basic_salary:
 *                 type: number
 *               hourly_ot_rate:
 *                 type: number
 *               effective_date:
 *                 type: string
 *                 format: date
 *             example:
 *               basic_salary: 200000.00
 *               hourly_ot_rate: 2000.00
 *               effective_date: "2024-05-01"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "rev-1234"
 *                 basic_salary: 200000.00
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
router.post(
  '/',
  authMiddleware,
  requireRole('Admin', 'HR'),
  validateBody(['basic_salary', 'hourly_ot_rate', 'effective_date']),
  salaryController.addSalaryRevision
);

/**
 * @swagger
 * /api/employees/{id}/salary:
 *   get:
 *     summary: Get full salary revision history for an employee
 *     tags: [Salary Revision]
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
 *         description: Array of salary revisions, newest first
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "rev-2"
 *                   basic_salary: 200000.00
 *                   effective_date: "2024-05-01"
 *                   end_date: null
 *                 - id: "rev-1"
 *                   basic_salary: 150000.00
 *                   effective_date: "2023-01-15"
 *                   end_date: "2024-04-30"
 */
router.get('/', authMiddleware, requireRole('Admin', 'HR', 'Payroll'), salaryController.getSalaryHistory);

module.exports = router;