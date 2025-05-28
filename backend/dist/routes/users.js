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
    try {
        const updateStmt = database_1.default.prepare('UPDATE users SET displayName = ?, bio = ?, socialLinks = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
        updateStmt.run(displayName, bio, JSON.stringify(socialLinks), userId);
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    }
    catch (err) {
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
        const stmt = database_1.default.prepare('SELECT id, username, displayName, userType, avatar, bio, socialLinks, createdAt FROM users WHERE username = ?');
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map