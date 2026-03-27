/**
 * Formats a date object to YYYY-MM-DD using UTC methods to prevent timezone shifting
 * @param {Date} date 
 * @returns {string} YYYY-MM-DD
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const month = '' + (d.getUTCMonth() + 1);
  const day = '' + d.getUTCDate();
  const year = d.getUTCFullYear();

  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

/**
 * Gets the date corresponding to one day before the provided date
 * @param {Date|string} date 
 * @returns {string} YYYY-MM-DD
 */
const getDayBefore = (date) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return formatDate(d);
};

module.exports = {
  formatDate,
  getDayBefore,
};