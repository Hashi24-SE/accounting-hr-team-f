const organizationService = require('../services/organizationService');
const { success, error } = require('../utils/response');

/**
 * Fetch company details
 */
const getOrganization = async (req, res, next) => {
  try {
    const data = await organizationService.getOrganization();
    if (!data) {
      return error(res, 'NOT_FOUND', 'Organization record not found', 404);
    }
    return success(res, data, 'Organization fetched successfully', 200);
  } catch (err) {
    next(err);
  }
};

/**
 * Update company details
 */
const updateOrganization = async (req, res, next) => {
  try {
    const data = await organizationService.updateOrganization(req.body);
    return success(res, data, 'Organization updated successfully', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
};