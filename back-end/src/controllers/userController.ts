import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { IAuthRequest } from '../types';
import pool from '../config/db';

// Generate JWT Token
const generateToken = (id: number): string => {
  const secret = Buffer.from(process.env.JWT_SECRET || 'your_jwt_secret_key_here');
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || '30d') as jwt.SignOptions['expiresIn']
  };
  return jwt.sign({ id }, secret, options);
};

// Register user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, user_id, password, confirm_password } = req.body;

    // Validate password match
    if (password !== confirm_password) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    // Check if user exists with email
    const userExistsByEmail = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userExistsByEmail.rows.length > 0) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    // Check if user exists with user_id
    const userExistsById = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      [user_id]
    );
    if (userExistsById.rows.length > 0) {
      res.status(400).json({ message: 'User ID already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, user_id, password) VALUES ($1, $2, $3) RETURNING id, email, user_id, avatar_url, created_at, updated_at',
      [email, user_id, hashedPassword]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        user_id: user.user_id,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// Change password
export const changePassword = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!current_password || !new_password) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    // Get user with password
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];

    if (!user.password) {
      res.status(400).json({ message: 'User password not found' });
      return;
    }

    // Check current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(400).json({ message: 'Invalid password data' });
  }
};

// Reset password request
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [hashedToken, new Date(Date.now() + 10 * 60 * 1000), user.id]
    );

    res.status(200).json({ 
      message: 'Password reset token generated',
      resetToken // In production, this should be sent via email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const result = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [hashedToken]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    const user = result.rows[0];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, password } = req.body;

    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR user_id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        user_id: user.user_id,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user avatar
export const updateAvatar = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { avatar_url } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ 
        message: 'User not authenticated',
        details: 'Please log in to update your avatar'
      });
      return;
    }

    if (!avatar_url) {
      res.status(400).json({ 
        message: 'Avatar URL is required',
        details: 'Please provide a valid image URL or base64 data for your avatar'
      });
      return;
    }

    let finalAvatarUrl = avatar_url;

    // Handle base64 image data
    if (avatar_url.startsWith('data:image')) {
      // Validate base64 format
      const base64Regex = /^data:image\/(jpeg|png|gif|webp);base64,/;
      if (!base64Regex.test(avatar_url)) {
        res.status(400).json({ 
          message: 'Invalid base64 format',
          details: 'Please provide a valid base64 encoded image (JPEG, PNG, GIF, or WebP)'
        });
        return;
      }

      // Extract base64 data
      const base64Data = avatar_url.split(',')[1];
      
      // Validate base64 string
      if (!base64Data || !/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
        res.status(400).json({ 
          message: 'Invalid base64 data',
          details: 'The provided base64 data is not valid'
        });
        return;
      }

      // Calculate image size
      const imageSize = Math.ceil((base64Data.length * 3) / 4);
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (imageSize > maxSize) {
        res.status(400).json({ 
          message: 'Image too large',
          details: 'The image size exceeds 10MB. Please use a smaller image or compress it before uploading.'
        });
        return;
      }

      // You might want to store the base64 data directly or convert it to a URL
      // For now, we'll use it as is
      finalAvatarUrl = avatar_url;
    } else {
      // Handle URL format
      try {
        new URL(avatar_url);
      } catch (error) {
        res.status(400).json({ 
          message: 'Invalid avatar URL format',
          details: 'Please provide a valid URL starting with http:// or https://'
        });
        return;
      }

      // Validate image URL (basic check)
      if (!avatar_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        res.status(400).json({ 
          message: 'Invalid image format',
          details: 'Please provide a URL ending with .jpg, .jpeg, .png, .gif, or .webp'
        });
        return;
      }
    }

    // Update user avatar
    const result = await pool.query(
      'UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, user_id, avatar_url, created_at, updated_at',
      [finalAvatarUrl, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ 
        message: 'User not found',
        details: 'The user account could not be found. Please try logging in again.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Avatar update error:', error);
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.name === 'PayloadTooLargeError') {
        res.status(413).json({ 
          message: 'File too large', 
          details: 'The uploaded file exceeds the size limit of 10MB. Please try a smaller file.'
        });
        return;
      }
    }
    
    res.status(400).json({ 
      message: 'Error updating avatar',
      details: 'There was a problem updating your avatar. Please try again later.'
    });
  }
};

// Get user profile
export const getProfile = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ 
        message: 'User not authenticated',
        details: 'Please log in to view your profile'
      });
      return;
    }

    // Get user profile
    const userResult = await pool.query(
      'SELECT id, email, user_id, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ 
        message: 'User not found',
        details: 'The user account could not be found. Please try logging in again.'
      });
      return;
    }

    // Get user's books
    const booksResult = await pool.query(
      `SELECT b.id, b.title, b.author, b.description, b.cover_image, b.genre_id, 
              b.created_at, b.updated_at, g.name as genre_name
       FROM books b
       LEFT JOIN genres g ON b.genre_id = g.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...userResult.rows[0],
        books: booksResult.rows
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Error fetching profile',
      details: 'There was a problem fetching your profile. Please try again later.'
    });
  }
}; 