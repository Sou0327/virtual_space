"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../utils/database"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        // Get user from database
        database_1.default.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
            if (err || !user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            req.user = user;
            next();
        });
    });
};
exports.authenticateToken = authenticateToken;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next(); // No token, but that's okay
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, decoded) => {
        if (err) {
            return next(); // Invalid token, but we'll continue without user
        }
        database_1.default.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
            if (!err && user) {
                req.user = user;
            }
            next();
        });
    });
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map