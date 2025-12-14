// src/middleware/errorHandler.js

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  // log safely (no secrets)
  console.error({
    message: err.message,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });

  // do not leak internals
  if (process.env.NODE_ENV === "production" && !isOperational) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }

  // development / known errors
  res.status(statusCode).json({
    error: err.message,
  });
}
