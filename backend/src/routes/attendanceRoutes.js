const express = require('express');
const router = express.Router();
const earningsController = require('../controllers/earningsController');

// Route for /api/attendance
router.post('/', earningsController.submitAttendance);

module.exports = router;