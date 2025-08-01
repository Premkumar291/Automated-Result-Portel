import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDb } from './dataBase/connectDb.js';
import authRoutes from './routes/auth.route.js';
import gridFSPdfRoutes from './routes/gridFSPdfSplit.route.js';
import pdfCoAnalysisRoutes from './routes/pdfCoAnalysis.route.js';
import { scheduleCleanup } from './utils/cleanupExpiredPDFs.js';
import serverless from 'serverless-http';

dotenv.config();

const app = express();
const URL = process.env.FRONTEND_URL;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: [URL],
  credentials: true
}));

// In-memory session storage for temporary data
const tempSessionStorage = new Map();

// Routes
app.get("/", (req, res) => {
  res.send("Server Started successfully!");
});

app.use("/api/auth", authRoutes);
app.use("/api/pdf", gridFSPdfRoutes);
app.use("/api/analyze", pdfCoAnalysisRoutes);

// Connect to DB and start cleanup (run once at cold start)
await connectDb();
scheduleCleanup(30); // runs every 30 minutes

// Export the serverless handler
export const handler = serverless(app);
