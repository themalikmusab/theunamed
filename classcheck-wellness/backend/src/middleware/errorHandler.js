// Global Error Handler Middleware
// Catches and formats errors consistently

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details || []
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(err, res) {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const field = err.meta?.target?.[0] || 'field';
      return res.status(409).json({
        error: 'Conflict',
        message: `A record with this ${field} already exists`,
        field
      });

    case 'P2025':
      // Record not found
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested record was not found'
      });

    case 'P2003':
      // Foreign key constraint failed
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Referenced record does not exist'
      });

    case 'P2014':
      // Invalid relation
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid relationship between records'
      });

    default:
      // Generic Prisma error
      return res.status(500).json({
        error: 'Database Error',
        message: 'A database error occurred',
        ...(process.env.NODE_ENV === 'development' && { code: err.code })
      });
  }
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = errorHandler;
module.exports.asyncHandler = asyncHandler;
module.exports.notFound = notFound;
