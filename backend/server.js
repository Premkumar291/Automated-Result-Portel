import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDb } from './dataBase/connectDb.js';
import authRoutes from './routes/auth.route.js';
<<<<<<< HEAD
import pdfAnalysisRoutes from './routes/pdfAnalysis.route.js';

dotenv.config({ path: '.env' });
=======

dotenv.config({ path: '../.env' });
>>>>>>> cccbcd8ad28449916d6ddc487e1f5c6b01e4a5af

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
<<<<<<< HEAD
app.use(express.json({ limit: '50mb' })); // Increased limit for large files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
=======
app.use(express.json());
>>>>>>> cccbcd8ad28449916d6ddc487e1f5c6b01e4a5af
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
<<<<<<< HEAD
app.use("/api/pdf-analysis", pdfAnalysisRoutes);
=======
>>>>>>> cccbcd8ad28449916d6ddc487e1f5c6b01e4a5af

// Start server
app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);
});