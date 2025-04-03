import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bookRoutes from './routes/bookRoutes';
import userRoutes from './routes/userRoutes';
import genreRoutes from './routes/genreRoutes';

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
// Increase JSON payload size limit to 10MB
app.use(express.json({ limit: '10mb' }));
// Increase URL-encoded payload size limit to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/genres', genreRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  
  // Handle payload too large error
  if (err.name === 'PayloadTooLargeError') {
    return res.status(413).json({ 
      message: 'File too large', 
      details: 'The uploaded file exceeds the size limit of 10MB. Please try a smaller file.'
    });
  }
  
  return res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 