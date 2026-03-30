const employeeCreated = require('./employee.created');
const salaryRevised = require('./salary.revised');
const accountDeactivated = require('./account.deactivated');

const TEMPLATES = {
  'employee.created': employeeCreated,
  'salary.revised': salaryRevised,
  'account.deactivated': accountDeactivated,
};

const getTemplate = (type, payload) => {
  const fn = TEMPLATES[type];
  if (!fn) throw new Error(`No template for event: ${type}`);
  return fn(payload);
};

module.exports = {
  getTemplate,
};