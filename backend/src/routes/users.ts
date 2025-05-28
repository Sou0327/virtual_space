import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import db from '../utils/database';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// Update user profile
router.put('/profile', authenticateToken, (req: AuthRequest, res) => {
  const { displayName, bio, socialLinks } = req.body;
  const userId = req.user?.id;

  if (!displayName) {
    return res.status(400).json({
      success: false,
      message: 'Display name is required'
    });
  }

  db.run(
    'UPDATE users SET displayName = ?, bio = ?, socialLinks = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [displayName, bio, JSON.stringify(socialLinks), userId],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update profile'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    }
  );
});

// Get user by username (public profile)
router.get('/:username', (req, res) => {
  const { username } = req.params;

  db.get(
    'SELECT id, username, displayName, userType, avatar, bio, socialLinks, createdAt FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    }
  );
});

export default router; 