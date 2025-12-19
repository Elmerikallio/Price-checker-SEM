export function validate(schema) {
  return (req, _res, next) => {
    // Try to parse the body directly first (most common case)
    let result = schema.safeParse(req.body);

    // If that fails, try the old format with body/query/params structure
    if (!result.success) {
      result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
    }

    if (!result.success) {
      // Forward to your error handler (graceful errors)
      const err = new Error("Validation failed");
      err.status = 400;
      err.code = "VALIDATION_ERROR";
      err.details = result.error.flatten();
      return next(err);
    }

    // Replace req.* with coerced/validated data
    if (result.data.body) {
      req.body = result.data.body;
    } else if (result.data && !result.data.body && !result.data.query && !result.data.params) {
      // Direct body validation
      req.body = result.data;
    }
    
    if (result.data.query) req.query = result.data.query;
    if (result.data.params) req.params = result.data.params;

    next();
  };
}
