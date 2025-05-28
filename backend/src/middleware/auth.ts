import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest, User } from '../types';
import db from '../utils/database';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    try {
      // Get user from database using better-sqlite3 synchronous API
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(decoded.userId) as User;
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  });
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // No token, but that's okay
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded: any) => {
    if (err) {
      return next(); // Invalid token, but we'll continue without user
    }

    try {
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(decoded.userId) as User;
      
      if (user) {
        req.user = user;
      }
      next();
    } catch (error) {
      // Database error, but we'll continue without user
      next();
    }
  });
}; 