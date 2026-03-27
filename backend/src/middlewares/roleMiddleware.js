const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    const err = new Error('UNAUTHORIZED');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    return next(err);
  }

  if (!roles.includes(req.user.role)) {
    const err = new Error('FORBIDDEN');
    err.status = 403;
    err.code = 'FORBIDDEN';
    return next(err);
  }

  next();
};

module.exports = requireRole;