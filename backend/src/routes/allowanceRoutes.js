const express = require('express');
const router = express.Router();
const allowanceController = require('../controllers/allowanceController');

// General Allowance Routes
router.get('/', allowanceController.getAllAllowances);
router.post('/', allowanceController.createAllowance);
router.patch('/:id', allowanceController.toggleAllowanceStatus);

// Employee Specific Allowance Routes (Missing Routes Fixed)
router.get('/employee/:id', allowanceController.getEmployeeAllowances);
router.post('/employee/:id', allowanceController.assignAllowanceToEmployee);

module.exports = router;