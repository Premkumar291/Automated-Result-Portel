import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDb } from './dataBase/connectDb.js';
import authRoutes from './routes/auth.route.js';

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for large files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));

// In-memory session storage for temporary data (use Redis in production)
const tempSessionStorage = new Map();

// Routes
app.get("/", (req, res) => {
  res.send("Server Started successfully!");
});

app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);
});