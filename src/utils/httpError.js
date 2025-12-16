export class HttpError extends Error {
  constructor(status = 500, message = 'Internal Server Error', details = null) {
    super(message || 'Internal Server Error');
    this.name = 'HttpError';
    this.status = status || 500;
    this.details = details;
  }
}
