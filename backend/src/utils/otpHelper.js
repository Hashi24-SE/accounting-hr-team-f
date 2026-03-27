const crypto = require('crypto');

const generateOtp = () => {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
};

const hashValue = (raw) => {
  return crypto.createHash('sha256').update(raw).digest('hex');
};

const verifyOtp = (rawOtp, storedHash) => {
  const hashOfRaw = hashValue(rawOtp);
  // Compare constant time to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(hashOfRaw), Buffer.from(storedHash));
};

module.exports = {
  generateOtp,
  hashValue,
  verifyOtp,
};