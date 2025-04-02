import express from 'express';
import {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  updateAvatar,
  getProfile
} from '../controllers/userController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.post('/change-password', protect, changePassword);
router.put('/avatar', protect, updateAvatar);

export default router; 