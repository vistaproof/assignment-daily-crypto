import express from 'express';
import {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  upload
} from '../controllers/bookController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/:id', getBook);

// Protected routes
router.post('/', protect, upload.single('cover_image'), createBook);
router.put('/:id', protect, upload.single('cover_image'), updateBook);
router.delete('/:id', protect, deleteBook);

export default router; 