import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
export async function registerUser(req, res) {
  try {
    const { email, password, full_name } = req.validatedBody;

    // Check if user already exists
    const existing = await db.select('users', { email });
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'USER_EXISTS',
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const [user] = await db.insert('users', {
      email,
      password_hash,
      full_name,
      role: 'agronomist',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'An error occurred during registration.',
    });
  }
}

/**
 * Login user and return JWT
 */
export async function loginUser(req, res) {
  try {
    const { email, password } = req.validatedBody;

    const users = await db.select('users', { email });
    const user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'An error occurred during login.',
    });
  }
}

export default { registerUser, loginUser };
