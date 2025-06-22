import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDb } from './dataBase/connectDb.js';
import authRoutes from './routes/auth.route.js';
import cors from "cors";

// Load environment variables with explicit path
dotenv.config({ path: './.env' });

// Debug logging for environment variables
console.log('=== Environment Variables Debug ===');
console.log('Current working directory:', process.cwd());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('MONGO_URI length:', process.env.MONGO_URI ? process.env.MONGO_URI.length : 0);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('=====================================');

const app = express();
const PORT = process.env.PORT || 8080;

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

//listening the server at start position with port 8080
app.listen(PORT,async () => {
  await connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);

});