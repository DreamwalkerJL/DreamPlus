import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import mysql from "mysql";
import { db } from "../server.js";
// import User from "../models/userModel";

// @desc    Register new user
// @route   POST /users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const token = generateToken(req.body.email);
  const values = [req.body.username, req.body.email, hashedPassword, token];

  const q1 = `SELECT email FROM users WHERE email = '${email}'`;
  const q2 =
    "INSERT INTO users(`username`, `email`, `password`, `token`) VALUES (?)";

  // Check fields if true
  if (!username || !email || !password) {
    res.status(400);
    return res.json("Please add all fields");
  }

  // Check if user exists, if not, create one
  db.query(q1, (err, data) => {
    if (err) return res.json(err);
    if (data[0]) {
      res.json("User already exists");
    } else {
      db.query(q2, [values], (err, data) => {
        if (err) {
          return res.json(err);
        } else {
          return res.json("User has been created");
        }
      });
    }
  });
});

// @desc    Authenticate a user
// @route   POST /users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check fields if true
  if (!email || !password) {
    res.status(400);
    return res.json("Please add all fields");
  }

  // Check if user exists && valid credentials
  db.query(
    `SELECT password FROM users WHERE email = '${email}'`,
    (err, data) => {
      if (err) return res.json(err);
      if (!data[0]) {
        res.status(404);
        return res.json("Invalid Credentials");
      } else {
        bcrypt.compare(password, data[0].password, (err, result) => {
          if (result) {
            res.json("Login successful");
          } else {
            res.status(404);
            res.json("Invalid Credentials");
          }
        });
      }
    }
  );
});

// @desc    Get user data
// @route   GET /users/me
// @access  Private

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export { registerUser, loginUser, getMe };

// module.exports = {
//     registerUser,
//     loginUser,
//     getMe,
//   }
