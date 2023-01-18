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
import { router } from "./routes/userRoutes.js";
import { registerUser, loginUser, getMe } from "./controllers/userControllers.js"
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

app.use("/users", router);

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

export {db}
