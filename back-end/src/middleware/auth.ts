import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../models/User';
import { IAuthRequest } from '../types';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized to access this route' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here') as { id: number };
      const user = await findUserById(decoded.id);

      if (!user || !user.id) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      (req as IAuthRequest).user = { id: user.id };
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 