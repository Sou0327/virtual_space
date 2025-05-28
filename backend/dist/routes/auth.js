"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../utils/database"));
const router = express_1.default.Router();
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
        try {
            const existingUser = database_1.default.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email or username already exists'
                });
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Insert user
            const insertStmt = database_1.default.prepare('INSERT INTO users (email, username, displayName, password, userType) VALUES (?, ?, ?, ?, ?)');
            const result = insertStmt.run(email, username, displayName, hashedPassword, userType);
            // Generate JWT
            const token = jsonwebtoken_1.default.sign({ userId: result.lastInsertRowid }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    token,
                    user: {
                        id: result.lastInsertRowid,
                        email,
                        username,
                        displayName,
                        userType
                    }
                }
            });
        }
        catch (dbError) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
    }
    catch (error) {
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
        try {
            const user = database_1.default.prepare('SELECT * FROM users WHERE email = ?').get(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            // Check password
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            // Generate JWT
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
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
        }
        catch (dbError) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map