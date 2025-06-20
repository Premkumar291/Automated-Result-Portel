import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDb } from './dataBase/connectDb.js';
import authRoutes from './routes/auth.route.js';

dotenv.config(); // Load environment variables first

const app = express();
const PORT = process.env.PORT || 8080 ;

// Middleware 
app.use(express.json());
app.use(cors());  

//Home page simple route
app.get("/", (req, res) => {
  res.send("Server Started successfully!");
});

app.use("/api/auth",authRoutes)

//listening the server at start position with port 8080
app.listen(PORT, () => {
  connectDb();
<<<<<<< HEAD
  console.log(`Server is running on http://localhost:${PORT}`);
});
=======
      console.log(`Server is running on http://localhost:${PORT}`);

});
>>>>>>> Prem-dev
