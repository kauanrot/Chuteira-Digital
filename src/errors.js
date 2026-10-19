class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}
class NotFoundError extends AppError {
  constructor(message) { super(message, 404); }
}
class ConflictError extends AppError {
  constructor(message) { super(message, 409); }
}
module.exports = { AppError, NotFoundError, ConflictError };
