/**
 * Simple middleware to validate presence of required body fields
 * @param {Array<string>} requiredFields - List of mandatory fields
 */
const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missing = [];

    requiredFields.forEach((field) => {
      const value = req.body[field];
      if (value === undefined || value === null || String(value).trim() === '') {
        missing.push(`${field} is required`);
      }
    });

    if (missing.length > 0) {
      const err = new Error('Validation error');
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      err.errors = missing;
      return next(err);
    }

    next();
  };
};

module.exports = {
  validateBody,
};