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
class UnauthorizedError extends AppError {
  constructor(message) { super(message, 401); }
}
class ForbiddenError extends AppError {
  constructor(message) { super(message, 403); }
}
module.exports = { AppError, NotFoundError, ConflictError, UnauthorizedError, ForbiddenError };
