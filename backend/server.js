import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { connectDb } from './dataBase/connectDb.js';
import { createIndexes } from './models/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { securityMiddleware, corsOptions } from './middleware/security.js';
import adminRoutes from './routes/admin.route.js';
import protectedRoutes from './routes/protected.route.js';
import gridFSPdfRoutes from './routes/gridFSPdfSplit.route.js';
import pdfCoAnalysisRoutes from './routes/pdfCoAnalysis.route.js';
import pdfReportRoutes from './routes/pdfReport.route.js';
import authRoutes from './routes/auth.route.js';
import studentRoutes from './routes/student.route.js';
import subjectRoutes from './routes/subject.route.js';
import facultyRoutes from './routes/faculty.route.js';
import adminHierarchyRoutes from './routes/adminHierarchy.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// trust proxy if behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.set('trust proxy', 1);

// CORS configuration (must be first)
app.use(cors(corsOptions));

// Security middleware
app.use(securityMiddleware);

// Compression
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Simple health check routes that respond immediately
app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    message: "Acadex Backend API",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/pdf", gridFSPdfRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin-hierarchy", adminHierarchyRoutes);
app.use("/api/analyze", pdfCoAnalysisRoutes);
app.use("/api/reports", pdfReportRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Database initialization (async, non-blocking)
// Database initialization handled in request wrapper

// Helper to start server
const startServer = async () => {
  try {
    await connectDb();
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if not running in Serverless mode (Vercel)
// We assume Vercel uses the exported function and doesn't run this top-level script directly in the same way,
// OR we check for an environment variable specific to the runtime if needed.
// A common pattern is checking if the file is the main module.
// However, in ES modules, require.main is not available.
// We can check process.env.VERCEL. If NOT Vercel, we start the server.
import cluster from 'cluster';
import os from 'os';

// Start server if not running in Serverless mode (Vercel)
if (!process.env.VERCEL) {
  // Check if clustering is enabled via WEB_CONCURRENCY (standard on Render/Heroku)
  // If not set, default to 1 (no clustering) to stay safe on shared instances with limited RAM
  const numWorkers = process.env.WEB_CONCURRENCY || 1;

  if (cluster.isPrimary && numWorkers > 1 && process.env.NODE_ENV === 'production') {
    console.log(`Primary ${process.pid} is running`);
    console.log(`Forking ${numWorkers} workers...`);

    // Fork workers.
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
      // Replace the dead worker
      cluster.fork();
    });
  } else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    startServer();
    if (cluster.isWorker) {
      console.log(`Worker ${process.pid} started`);
    }
  }
}

// Export for Vercel (Native Express)
export default async (req, res) => {
  // Skip DB connection for health checks
  if (req.url === '/' || req.url === '/health' || req.method === 'OPTIONS') {
    return app(req, res);
  }

  try {
    // Ensure DB is connected before handling request
    await connectDb();

    // Pass request to Express app
    return app(req, res);
  } catch (error) {
    console.error('[Vercel] DB Connection Error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};
