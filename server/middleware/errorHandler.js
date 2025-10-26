/**
 * Error Handler Middleware
 * Returns FHIR OperationOutcome for errors
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const isFhirRequest = req.path.startsWith('/fhir');

  if (isFhirRequest) {
    // Return FHIR OperationOutcome
    res.status(statusCode).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: statusCode >= 500 ? 'error' : 'warning',
        code: err.code || 'processing',
        diagnostics: err.message || 'An error occurred'
      }]
    });
  } else {
    // Return standard JSON error
    res.status(statusCode).json({
      error: {
        message: err.message || 'Internal server error',
        code: err.code,
        statusCode
      }
    });
  }
}

export class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'internal_error') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'not_found');
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed') {
    super(message, 400, 'validation_error');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'unauthorized');
  }
}
