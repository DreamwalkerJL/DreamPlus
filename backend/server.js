import express from "express";
import mysql from "mysql";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
dotenv.config();

connectDB();

const app = express();
app.use(cors());
const port = process.env.PORT || 5000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PAS,
  database: "dreamplus",
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use("/users", import("./routes/userRoutes.js"));

app.get("/users/me", (req, res) => {
  const q = "SELECT * FROM users;";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// @desc    Register new user
// @route   POST /users
// @access  Public

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check fields if true
  if (!username || !email || !password) {
    res.status(400);
    return res.json("Please add all fields");
  }

  // Check if user exists
  const userExists = await db.query(
    `SELECT email FROM users WHERE email = '${email}'`,
    (err, data) => {
      if (err) return res.json(err);
      if (data[0]) return res.json("User already exists");
    }
  );

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const values = [req.body.username, req.body.email, hashedPassword];

  // Create User
  const createUser = await db.query(
    "INSERT INTO users(`username`, `email`, `password`) VALUES (?)",
    [values],
    (err, data) => {
      if (err) return res.json(err);
      return res.json("User has been created");
    }
  );
});

app.post("/users", registerUser);

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const userExists = await db.query(
    `SELECT email FROM users WHERE email = '${email}'`,
    (err, data) => {
      if (err) return res.json(err);
      if (!data[0]) return;
      res.status(400);
      res.json("User doesnt exist");
    }
  );

  // Compare Passwords
  const comparePassword = await db.query(
    `SELECT password FROM users WHERE email = '${email}'`,
    (err, data) => {
      if (err) return res.json(err);
      bcrypt.compare(password, data[0].password, (err, result) => {
        if (result) {
          res.json("Login successful");
        } else {
          res.status(400);
          res.json("Invalid Credentials")
        }
      });
    }
  );
});

app.post("/users/login", loginUser);

app.post("/users/login", (req, res) => {
  const { email, password } = req.body;
  const values = [req.body.email, req.body.password];
  // Check for user email
  const q = "SELECT * FROM users WHERE `email` = ? && `password` = ?";

  db.query(q, [...values], (err, data) => {
    if (err) return res.json(err);
    return res.json("login successfully");
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(
      path.resolve(__dirname, "../", "frontend", "build", "index.html")
    )
  );
} else {
  app.get("/", (req, res) => res.send("Please set to production"));
}

app.listen(port, () => console.log(`Server started on port ${port}`));
