import express from 'express';
import { getAllGenres } from '../controllers/genreController';

const router = express.Router();

// Public route
router.get('/', getAllGenres);

export default router; 