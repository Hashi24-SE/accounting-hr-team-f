const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Routes for /api/leaves
router.get('/types', leaveController.getLeaveTypes);
router.post('/requests', leaveController.submitLeaveRequest);
router.patch('/requests/:id/status', leaveController.updateLeaveRequestStatus);

module.exports = router;