export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  // Avoid leaking internals
  const payload = {
    error: err.name || "Error",
    message: err.message || "Something went wrong",
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
