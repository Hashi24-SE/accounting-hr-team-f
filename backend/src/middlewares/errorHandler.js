const { error } = require('../utils/response');

/**
 * Global Express error middleware
 * Must have 4 parameters: err, req, res, next
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err);

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal server error';
  const extras = {};
  
  // If array of errors (like validation), use errors key
  if (err.errors) {
    extras.errors = err.errors;
  }

  return error(res, code, message, status, extras);
};

module.exports = errorHandler;