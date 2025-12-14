export function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || 500;
  const message = status === 500 ? "Internal Server Error" : err.message;

  res.status(status).json({
    error: {
      message,
    },
  });
}
