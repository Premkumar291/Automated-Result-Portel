/**
 * Error handling utilities for consistent error management across the application
 */
import logger from './logger.js';

/**
 * Custom error class with additional properties for API errors
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} details - Additional error details
   */
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle API errors and send a consistent error response
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleApiError = (err, req, res, next) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = {};
  let errorType = 'SERVER_ERROR';
  
  // If it's our custom ApiError, use its properties
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    errorType = getErrorTypeFromStatusCode(statusCode);
  } else if (err.name === 'ValidationError') {
    // Handle Mongoose validation errors
    statusCode = 400;
    message = 'Validation Error';
    details = formatValidationErrors(err);
    errorType = 'VALIDATION_ERROR';
  } else if (err.name === 'MongoError' && err.code === 11000) {
    // Handle MongoDB duplicate key errors
    statusCode = 409;
    message = 'Duplicate Entry';
    details = { duplicateField: extractDuplicateField(err) };
    errorType = 'DUPLICATE_ERROR';
  } else if (err.name === 'CastError') {
    // Handle Mongoose cast errors (e.g., invalid ObjectId)
    statusCode = 400;
    message = 'Invalid Data Format';
    details = { field: err.path, value: err.value };
    errorType = 'INVALID_FORMAT';
  }
  
  // Log the error with appropriate level based on status code
  if (statusCode >= 500) {
    logger.error(`API Error: ${message}`, {
      statusCode,
      errorType,
      path: req.path,
      method: req.method,
      details,
      stack: err.stack
    });
  } else {
    logger.warn(`API Error: ${message}`, {
      statusCode,
      errorType,
      path: req.path,
      method: req.method,
      details
    });
  }
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      type: errorType,
      details,
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
};

/**
 * Get error type from HTTP status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} - Error type
 */
const getErrorTypeFromStatusCode = (statusCode) => {
  if (statusCode >= 500) return 'SERVER_ERROR';
  if (statusCode >= 400) {
    switch (statusCode) {
      case 400: return 'BAD_REQUEST';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'UNPROCESSABLE_ENTITY';
      case 429: return 'TOO_MANY_REQUESTS';
      default: return 'CLIENT_ERROR';
    }
  }
  return 'UNKNOWN_ERROR';
};

/**
 * Format Mongoose validation errors into a more usable structure
 * @param {Error} err - Mongoose validation error
 * @returns {Object} - Formatted validation errors
 */
const formatValidationErrors = (err) => {
  const formattedErrors = {};
  
  if (err.errors) {
    Object.keys(err.errors).forEach(key => {
      formattedErrors[key] = err.errors[key].message;
    });
  }
  
  return formattedErrors;
};

/**
 * Extract the duplicate field from a MongoDB duplicate key error
 * @param {Error} err - MongoDB duplicate key error
 * @returns {string} - Name of the duplicate field
 */
const extractDuplicateField = (err) => {
  if (err.keyPattern) {
    return Object.keys(err.keyPattern).join(', ');
  }
  return 'unknown';
};

/**
 * Async error handler wrapper to avoid try/catch blocks in route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Create a not found error for non-existent routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFoundHandler = (req, res, next) => {
  const err = new ApiError(`Route not found: ${req.originalUrl}`, 404);
  next(err);
};

export {
  ApiError,
  handleApiError,
  asyncHandler,
  notFoundHandler
};