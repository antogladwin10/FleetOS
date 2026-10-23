import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

/**
 * Centralized error handler middleware (must be last middleware)
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, errors);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists`;
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error] ${err.name}: ${err.message}`, err.stack);
  }

  return sendError(res, message, statusCode);
};

/**
 * 404 handler
 */
export const notFound = (req, res) => {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
};

/**
 * express-validator result handler — call at the top of each controller
 */
export const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendError(res, 'Validation failed', 400, errors.array({ onlyFirstError: true }));
    return true; // caller should return
  }
  return false;
};
