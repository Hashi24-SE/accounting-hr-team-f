/**
 * Success response envelope helper
 * @param {Object} res - Express response object
 * @param {Object|Array} data - Payload data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 * @returns {Object} response
 */
const success = (res, data, message = 'OK', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error response envelope helper
 * @param {Object} res - Express response object
 * @param {string} code - Application specific error code
 * @param {string|Array} message - Error message or validation array
 * @param {number} status - HTTP status code
 * @param {Object} extras - Additional fields (e.g. { errors: [...] })
 * @returns {Object} response
 */
const error = (res, code, message, status, extras = {}) => {
  return res.status(status).json({
    success: false,
    status,
    code,
    message,
    timestamp: new Date().toISOString(),
    ...extras
  });
};

module.exports = {
  success,
  error,
};