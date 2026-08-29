export const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: messages.join(', '),
      },
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: `An account/resource with this ${field} already exists.`,
      },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_EXPIRED',
        message: 'Your session has expired. Please log in again.',
      },
    });
  }

  // Custom Integration error codes
  if (err.message === 'INTEGRATION_NOT_CONNECTED' || err.code === 'INTEGRATION_NOT_CONNECTED') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INTEGRATION_NOT_CONNECTED',
        message: err.customMessage || 'Required third-party integration is not connected.',
        details: err.details || null,
      },
    });
  }

  if (err.message === 'AUTH_EXPIRED' || err.code === 'AUTH_EXPIRED') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_EXPIRED',
        message: 'Third-party integration credentials have expired. Please re-authenticate.',
      },
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred.',
    },
  });
};
