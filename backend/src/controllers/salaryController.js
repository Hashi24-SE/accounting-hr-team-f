const salaryService = require('../services/salaryService');
const { success } = require('../utils/response');

/**
 * Add a new salary revision
 */
const addSalaryRevision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newRevision = await salaryService.addSalaryRevision(id, req.body);
    return success(res, newRevision, 'Salary revision added successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get full salary revision history for an employee
 */
const getSalaryHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await salaryService.getSalaryHistory(id);
    return success(res, history, 'Salary history fetched successfully', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addSalaryRevision,
  getSalaryHistory,
};