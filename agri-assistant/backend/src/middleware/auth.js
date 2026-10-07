import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_me';
const JWT_EXPIRATION = '24h';

/**
 * Middleware: Verify JWT Bearer Token
 * Extracts user payload and attaches it to req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'ACCESS_DENIED',
      message: 'Authentication required. Provide a valid Bearer token.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(403).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Invalid authentication token.',
    });
  }
}

/**
 * Generate a signed JWT for a user
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role || 'agronomist',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}

/**
 * Middleware: Validate request body against a Zod schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));
      return res.status(422).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Request body failed validation.',
        details: errors,
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

export default { authenticateToken, generateToken, validateBody };
