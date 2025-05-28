import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, ApiResponse } from '../types';
import db from '../utils/database';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, username, displayName, password, userType } = req.body;

    // Validation
    if (!email || !username || !displayName || !password || !userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email or username already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.run(
        'INSERT INTO users (email, username, displayName, password, userType) VALUES (?, ?, ?, ?, ?)',
        [email, username, displayName, hashedPassword, userType],
        function(err) {
          if (err) {
            return res.status(500).json({ success: false, message: 'Failed to create user' });
          }

          // Generate JWT
          const token = jwt.sign(
            { userId: this.lastID },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
          );

          res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
              token,
              user: {
                id: this.lastID,
                email,
                username,
                displayName,
                userType
              }
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: User) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, (user as any).password);
      
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            userType: user.userType,
            avatar: user.avatar,
            bio: user.bio
          }
        }
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router; 