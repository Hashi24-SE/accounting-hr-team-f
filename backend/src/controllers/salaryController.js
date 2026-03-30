const salaryService = require('../services/salaryService');
const { success } = require('../utils/response');
const eventBus = require('../events/eventBus');

/**
 * Add a new salary revision
 */
const addSalaryRevision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newRevision = await salaryService.addSalaryRevision(id, req.body);

    eventBus.emit('salary.revised', {
      employee: { id },
      salary: newRevision,
      actorId: req.user.id
    });

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