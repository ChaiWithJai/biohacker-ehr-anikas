import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../index.js';
import { generateToken } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /auth/register
 * Register new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role = 'patient' } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash,
        role,
        properties: {}
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new ValidationError('Email already exists');
      }
      throw error;
    }

    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      throw new ValidationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new ValidationError('Invalid email or password');
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

export default router;
