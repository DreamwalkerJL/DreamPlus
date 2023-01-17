import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel'

// @desc    Register new user
// @route   POST /api/users
// @access  Public
