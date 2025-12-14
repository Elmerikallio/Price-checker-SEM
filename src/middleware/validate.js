export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      // Forward to your error handler (graceful errors)
      const err = new Error("Validation failed");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      err.details = result.error.flatten();
      return next(err);
    }

    // Optional: replace req.* with coerced/validated data
    if (result.data.body) req.body = result.data.body;
    if (result.data.query) req.query = result.data.query;
    if (result.data.params) req.params = result.data.params;

    next();
  };
}
