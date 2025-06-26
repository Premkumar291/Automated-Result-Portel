import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDb } from './dataBase/connectDb.js';
import authRoutes from './routes/auth.route.js';
import pdfRoutes from './routes/pdf.route.js';
import cors from "cors";


dotenv.config({ path: './.env' });

console.log('=== Environment Variables Debug ===');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('=====================================');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware 
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

//Home page simple route
app.get("/", (req, res) => {
  res.send("Server Started successfully!");
});

app.use("/api/auth",authRoutes)
app.use("/api/pdf",pdfRoutes)

//listening the server at start position with port 8080
app.listen(PORT,async () => {
  await connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);

});