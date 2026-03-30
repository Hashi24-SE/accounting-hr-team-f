const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Routes for /api/leaves
router.get('/types', leaveController.getLeaveTypes);

// Newly added route for getting requests
router.get('/requests', leaveController.getLeaveRequests);

router.post('/requests', leaveController.submitLeaveRequest);
router.patch('/requests/:id/status', leaveController.updateLeaveRequestStatus);

module.exports = router;