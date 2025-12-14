import { HttpError } from "../utils/httpError.js";

export function errorHandler(err, req, res, next) {
  const isHttp = err instanceof HttpError;

  const status = isHttp ? err.status : 500;

  // Don’t leak internals
  const safeMessage =
    status >= 500 ? "Internal server error" : err.message || "Bad request";

  // optional, include validation details on 400 in dev
  const payload = {
    error: {
      message: safeMessage,
      status,
      ...(isHttp && err.details ? { details: err.details } : {}),
    },
  };

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json(payload);
}
