import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest, User } from '../types';
import db from '../utils/database';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔐 Auth Debug:', {
    authHeader: authHeader ? `Bearer ${authHeader.split(' ')[1]?.substring(0, 10)}...` : 'None',
    hasToken: !!token,
    url: req.url,
    method: req.method
  });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded: any) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ success: false, message: 'Invalid token', error: err.message });
    }

    console.log('✅ Token verified, userId:', decoded.userId);

    try {
      // Get user from database using better-sqlite3 synchronous API
      const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(decoded.userId) as User & { socialLinks?: string };

      // Parse JSON fields stored as TEXT
      if (user && typeof user.socialLinks === 'string') {
        try {
          user.socialLinks = JSON.parse(user.socialLinks);
        } catch (parseError) {
          console.warn('⚠️ Failed to parse socialLinks JSON:', parseError);
          user.socialLinks = undefined;
        }
      }
      
      if (!user) {
        console.log('❌ User not found for userId:', decoded.userId);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      console.log('✅ User authenticated:', { id: user.id, username: user.username });
      req.user = user;
      next();
    } catch (error) {
      console.error('❌ Database error during auth:', error);
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
      const user = stmt.get(decoded.userId) as User & { socialLinks?: string };

      if (user && typeof user.socialLinks === 'string') {
        try {
          user.socialLinks = JSON.parse(user.socialLinks);
        } catch {
          user.socialLinks = undefined;
        }
      }
      
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