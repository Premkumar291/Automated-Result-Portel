import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './dataBase/connectDb.js';

dotenv.config(); // Load environment variables first

const app = express();
const PORT = process.env.PORT || 8080 ;

//Home page simple route
app.get("/", (req, res) => {
  res.send("Server Started successfully!");
});

//listening the server at start position with port 8080
app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);
});
