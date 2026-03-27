const employeeService = require('../services/employeeService');
const { success } = require('../utils/response');

/**
 * Register a new employee
 */
const registerEmployee = async (req, res, next) => {
  try {
    const { basic_salary, hourly_ot_rate, ...employeeData } = req.body;
    const newEmployee = await employeeService.registerEmployee(employeeData, basic_salary, hourly_ot_rate);
    return success(res, newEmployee, 'Employee registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * List active employees
 */
const listEmployees = async (req, res, next) => {
  try {
    const { department, search } = req.query;
    const employees = await employeeService.listEmployees(department, search);
    return success(res, employees, 'Employees fetched successfully', 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Get employee by ID
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id);
    return success(res, employee, 'Employee fetched successfully', 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Update employee details
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedEmployee = await employeeService.updateEmployee(id, req.body);
    return success(res, updatedEmployee, 'Employee updated successfully', 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Soft delete employee
 */
const deactivateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    await employeeService.deactivateEmployee(id);
    return success(res, { id }, 'Employee deactivated', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
};