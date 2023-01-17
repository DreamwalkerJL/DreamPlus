import mysql from "mysql";

async function connectDB() { 
    try {
    mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.SQL_PAS,
    database: "test",
  });
} catch {
    console.log(error)
    process.exit(1)
}
}
  export {connectDB}
