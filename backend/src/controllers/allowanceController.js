const allowanceService = require('../services/allowanceService');

const getAllAllowances = async (req, res, next) => {
    try {
        const allowances = await allowanceService.getAllAllowances();
        res.status(200).json({ success: true, data: allowances });
    } catch (error) {
        next(error);
    }
};

const createAllowance = async (req, res, next) => {
    try {
        const { name, is_taxable, is_epf_etf } = req.body;
        
        // Required Field Validation
        if (!name) {
            return res.status(400).json({ success: false, message: 'Allowance name is required' });
        }
        
        const newAllowance = await allowanceService.createAllowance({ name, is_taxable, is_epf_etf });
        res.status(201).json({ success: true, data: newAllowance });
    } catch (error) {
        next(error);
    }
};

const toggleAllowanceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        
        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ success: false, message: 'is_active must be a boolean value' });
        }

        const updatedAllowance = await allowanceService.toggleAllowanceStatus(id, is_active);
        res.status(200).json({ success: true, data: updatedAllowance });
    } catch (error) {
        next(error);
    }
};

const assignAllowanceToEmployee = async (req, res, next) => {
    try {
        const { id: employeeId } = req.params;
        const { allowance_type_id, amount, effective_date } = req.body;

        if (!allowance_type_id || amount === undefined || !effective_date) {
            return res.status(400).json({ success: false, message: 'Missing required fields: allowance_type_id, amount, effective_date' });
        }

        const assigned = await allowanceService.assignAllowanceToEmployee(employeeId, {
            allowance_type_id,
            amount,
            effective_date
        });
        res.status(201).json({ success: true, data: assigned });
    } catch (error) {
        next(error);
    }
};

const getEmployeeAllowances = async (req, res, next) => {
    try {
        const { id: employeeId } = req.params;
        const allowances = await allowanceService.getEmployeeAllowances(employeeId);
        res.status(200).json({ success: true, data: allowances });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllAllowances,
    createAllowance,
    toggleAllowanceStatus,
    assignAllowanceToEmployee,
    getEmployeeAllowances
};