export function requireAuth(req, _res, next) {
  // TODO: real JWT verification here
  // For now, assume teammate will attach req.user
  if (!req.user) {
    const err = new Error("Unauthorized");
    err.status = 401;
    return next(err);
  }
  next();
}

export function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) {
      const err = new Error("Forbidden");
      err.status = 403;
      return next(err);
    }
    next();
  };
}
