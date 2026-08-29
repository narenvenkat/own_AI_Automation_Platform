import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request input validation failed.',
        details: errors.array().map((err) => ({
          field: err.path || err.param,
          message: err.msg,
          value: err.value,
        })),
      },
    });
  }
  next();
};
