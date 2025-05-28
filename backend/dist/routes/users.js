"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../utils/database"));
const router = express_1.default.Router();
// Get current user profile
router.get('/profile', auth_1.authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user
        }
    });
});
// Update user profile
router.put('/profile', auth_1.authenticateToken, (req, res) => {
    const { displayName, bio, socialLinks } = req.body;
    const userId = req.user?.id;
    if (!displayName) {
        return res.status(400).json({
            success: false,
            message: 'Display name is required'
        });
    }
    database_1.default.run('UPDATE users SET displayName = ?, bio = ?, socialLinks = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [displayName, bio, JSON.stringify(socialLinks), userId], function (err) {
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
    });
});
// Get user by username (public profile)
router.get('/:username', (req, res) => {
    const { username } = req.params;
    database_1.default.get('SELECT id, username, displayName, userType, avatar, bio, socialLinks, createdAt FROM users WHERE username = ?', [username], (err, user) => {
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
    });
});
exports.default = router;
//# sourceMappingURL=users.js.map