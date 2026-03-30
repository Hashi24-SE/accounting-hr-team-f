const leaveService = require('../services/leaveService');

const getLeaveTypes = async (req, res, next) => {
    try {
        const types = await leaveService.getLeaveTypes();
        res.status(200).json({ success: true, data: types });
    } catch (error) {
        next(error);
    }
};

const allocateLeaveBalances = async (req, res, next) => {
    try {
        const { id: employeeId } = req.params;
        const balancesData = req.body; 

        if (!Array.isArray(balancesData) || balancesData.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid balances data. Expected an array.' });
        }

        const allocated = await leaveService.allocateLeaveBalances(employeeId, balancesData);
        res.status(201).json({ success: true, data: allocated });
    } catch (error) {
        next(error);
    }
};

// Added Controller for getting requests
const getLeaveRequests = async (req, res, next) => {
    try {
        const { status } = req.query;
        const data = await leaveService.getLeaveRequests(status);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const submitLeaveRequest = async (req, res, next) => {
    try {
        // FIX: Destructure 'days_taken' from req.body
        const { employee_id, leave_type_id, start_date, end_date, days_taken, reason } = req.body;

        if (!employee_id || !leave_type_id || !start_date || !end_date || !days_taken) {
            return res.status(400).json({ success: false, message: 'Missing required fields for leave request.' });
        }

        const newRequest = await leaveService.submitLeaveRequest({
            employee_id, leave_type_id, start_date, end_date, days_taken, reason
        });
        res.status(201).json({ success: true, data: newRequest, message: 'Leave request submitted successfully' });
    } catch (error) {
        next(error);
    }
};

const updateLeaveRequestStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'" });
        }

        const updatedRequest = await leaveService.updateLeaveRequestStatus(id, status);
        res.status(200).json({ success: true, data: updatedRequest, message: `Request successfully ${status}` });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLeaveTypes,
    allocateLeaveBalances,
    getLeaveRequests,
    submitLeaveRequest,
    updateLeaveRequestStatus
};