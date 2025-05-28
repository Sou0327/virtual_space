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

  try {
    const updateStmt = db.prepare(
      'UPDATE users SET displayName = ?, bio = ?, socialLinks = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?'
    );
    updateStmt.run(displayName, bio, JSON.stringify(socialLinks), userId);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user by username (public profile)
router.get('/:username', (req, res) => {
  const { username } = req.params;

  try {
    const stmt = db.prepare(
      'SELECT id, username, displayName, userType, avatar, bio, socialLinks, createdAt FROM users WHERE username = ?'
    );
    const user = stmt.get(username);

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
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

export default router; 