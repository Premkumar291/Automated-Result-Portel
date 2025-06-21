import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDb } from './dataBase/connectDb.js';
import authRoutes from './routes/auth.route.js';
import cors from "cors";

dotenv.config(); // Load environment variables first

const app = express();
const PORT = process.env.PORT || 8080 ;

// Middleware 
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // your frontend URL
  credentials: true
}));

//Home page simple route
app.get("/", (req, res) => {
  res.send("Server Started successfully!");
});

app.use("/api/auth",authRoutes)

app.use("/api/auth",authRoutes)

//listening the server at start position with port 8080
app.listen(PORT,async () => {
  await connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);

});