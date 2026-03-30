const { verifyAccessToken } = require('../utils/jwtHelper');

const authMiddleware = (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      const err = new Error('Missing or invalid Authorization header or token query parameter');
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }
    if (!token) {
      const err = new Error('Token is missing');
      err.status = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      ...decoded,
      id: decoded.id || decoded.userId
    };
    next();
  } catch (error) {
    const err = new Error('Token is invalid or expired');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    next(err);
  }
};

module.exports = authMiddleware;