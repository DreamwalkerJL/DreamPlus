import express from "express";
import mysql from "mysql"
import cors from "cors";
import path from "path"
import {fileURLToPath} from 'url';
import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors())
const port = process.env.PORT || 5000

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.SQL_PAS,
    database: "test",
  });