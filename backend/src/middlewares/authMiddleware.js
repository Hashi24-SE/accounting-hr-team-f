const { verifyAccessToken } = require('../utils/jwtHelper');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Missing or invalid Authorization header');
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      const err = new Error('Token is missing');
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const err = new Error('Token is invalid or expired');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    next(err);
  }
};

module.exports = authMiddleware;