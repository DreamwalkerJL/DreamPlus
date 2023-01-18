import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { db } from "../server.js";
import e from "express";
// import User from '../models/userModel'

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await new Promise((resolve) => {
        db.query(
          `SELECT * FROM users WHERE email = '${decoded.id}'`,
          (err, data) => {
            resolve(data[0]);
          }
        );
      });

      next();
    } catch {
      res.status(401);
      res.json("Not authorized");
    }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };
