// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message) {
    super(message, 401)
    this.name = 'AuthError'
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

// Global error handler for API routes
export function handleError(error) {
  console.error('[ERROR]', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  if (error instanceof AppError) {
    return { error: error.message, statusCode: error.statusCode }
  }

  // Unknown error
  return { error: 'Internal server error', statusCode: 500 }
}

// Safe JSON parse
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

// Safe async handler for API routes
export function asyncHandler(fn) {
  return async (req, res) => {
    try {
      return await fn(req, res)
    } catch (error) {
      const { error: message, statusCode } = handleError(error)
      return new Response(JSON.stringify({ error: message }), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
