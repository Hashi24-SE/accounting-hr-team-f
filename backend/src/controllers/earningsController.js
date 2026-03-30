const grossSalaryService = require('../services/grossSalaryService');

const submitAttendance = async (req, res, next) => {
    try {
        const records = req.body;
        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, message: "Expected an array of attendance records." });
        }
        const data = await grossSalaryService.submitAttendance(records);
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const getGrossSalary = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Query parameters 'month' and 'year' are required." });
        }

        const data = await grossSalaryService.calculateGrossSalary(id, parseInt(month), parseInt(year));
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitAttendance,
    getGrossSalary
};