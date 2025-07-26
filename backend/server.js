import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDb } from './dataBase/connectDb.js';
import authRoutes from './routes/auth.route.js';
import gridFSPdfRoutes from './routes/gridFSPdfSplit.route.js';
import pdfCoAnalysisRoutes from './routes/pdfCoAnalysis.route.js';
import { scheduleCleanup } from './utils/cleanupExpiredPDFs.js';

dotenv.config();

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
app.use("/api/pdf", gridFSPdfRoutes);
app.use("/api/analyze", pdfCoAnalysisRoutes); // Using PDF.co as the primary analyzer

// Start server
app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Schedule cleanup of expired PDFs (run every 30 minutes)
  scheduleCleanup(30);
});
