const express = require('express');
const router = express.Router();
const allowanceController = require('../controllers/allowanceController');

// Routes for /api/allowances
router.get('/', allowanceController.getAllAllowances);
router.post('/', allowanceController.createAllowance);
router.patch('/:id', allowanceController.toggleAllowanceStatus);

module.exports = router;