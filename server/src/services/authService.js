import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

/**
 * Sign JWT Token
 */
export const signToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user
 */
export const registerUser = async ({ name, email, password, role = 'operator' }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // First user can be admin if role specified
  const userCount = await User.countDocuments();
  const assignedRole = userCount === 0 ? 'admin' : (role || 'operator');

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    password,
    role: assignedRole,
    lastLogin: new Date(),
  });

  const token = signToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Login user with email & password
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  user.lastLogin = new Date();
  await user.save();

  const token = signToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Fetch profile by user ID
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
};
