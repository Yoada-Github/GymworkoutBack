import express from 'express';
import cors from 'cors'; // Import CORS
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from "./config.js"; // ✅ Correct import
import userRoute from './routes/userRoute.js'
import gymRoute from './routes/gymRoute.js'

dotenv.config();


const app = express();
app.set("trust proxy", true)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use CORS middleware (allow all origins for now, but restrict it in production)
app.use(cors(
  {
    origin: "*"
  }
));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Book API');
});


 app.use("/user", userRoute)
 app.use("/gym", gymRoute)


// Connect to the database and start the server
const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    const PORT = process.env.PORT || 5003;

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start the server:', error.message);
    process.exit(1);
  }
};

startServer();





