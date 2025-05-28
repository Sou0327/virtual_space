"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../utils/database"));
const router = express_1.default.Router();
// Default space templates
const defaultTemplates = [
    {
        id: 'cozy-room',
        name: 'コージーな部屋',
        type: 'room',
        preview: '/templates/cozy-room.jpg'
    },
    {
        id: 'modern-stage',
        name: 'モダンステージ',
        type: 'stage',
        preview: '/templates/modern-stage.jpg'
    },
    {
        id: 'art-gallery',
        name: 'アートギャラリー',
        type: 'gallery',
        preview: '/templates/art-gallery.jpg'
    },
    {
        id: 'outdoor-park',
        name: 'アウトドアパーク',
        type: 'outdoor',
        preview: '/templates/outdoor-park.jpg'
    }
];
// Get available templates
router.get('/templates', (req, res) => {
    res.json({
        success: true,
        data: { templates: defaultTemplates }
    });
});
// Create new space
router.post('/', auth_1.authenticateToken, (req, res) => {
    const { title, description, templateId } = req.body;
    const userId = req.user?.id;
    if (!title || !templateId) {
        return res.status(400).json({
            success: false,
            message: 'Title and template are required'
        });
    }
    const template = defaultTemplates.find(t => t.id === templateId);
    if (!template) {
        return res.status(400).json({
            success: false,
            message: 'Invalid template'
        });
    }
    // Default customization
    const defaultCustomization = {
        wallTexture: 'default',
        floorTexture: 'default',
        lighting: {
            ambientColor: '#404040',
            directionalColor: '#ffffff',
            intensity: 1.0
        },
        objects: [],
        content: []
    };
    database_1.default.run('INSERT INTO virtual_spaces (userId, title, description, template, customization) VALUES (?, ?, ?, ?, ?)', [userId, title, description, JSON.stringify(template), JSON.stringify(defaultCustomization)], function (err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create space'
            });
        }
        res.status(201).json({
            success: true,
            message: 'Space created successfully',
            data: {
                spaceId: this.lastID
            }
        });
    });
});
// Get user's spaces
router.get('/my-spaces', auth_1.authenticateToken, (req, res) => {
    const userId = req.user?.id;
    database_1.default.all('SELECT * FROM virtual_spaces WHERE userId = ? ORDER BY updatedAt DESC', [userId], (err, spaces) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        const formattedSpaces = spaces.map((space) => ({
            ...space,
            template: JSON.parse(space.template),
            customization: JSON.parse(space.customization)
        }));
        res.json({
            success: true,
            data: { spaces: formattedSpaces }
        });
    });
});
// Get space by ID
router.get('/:spaceId', auth_1.optionalAuth, (req, res) => {
    const { spaceId } = req.params;
    const userId = req.user?.id;
    database_1.default.get('SELECT vs.*, u.username, u.displayName FROM virtual_spaces vs JOIN users u ON vs.userId = u.id WHERE vs.id = ?', [spaceId], (err, space) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        if (!space) {
            return res.status(404).json({
                success: false,
                message: 'Space not found'
            });
        }
        // Check if space is public or user is owner
        if (!space.isPublic && space.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        // Increment visit count if not owner
        if (space.userId !== userId) {
            database_1.default.run('UPDATE virtual_spaces SET visitCount = visitCount + 1 WHERE id = ?', [spaceId]);
        }
        const formattedSpace = {
            ...space,
            template: JSON.parse(space.template),
            customization: JSON.parse(space.customization)
        };
        res.json({
            success: true,
            data: { space: formattedSpace }
        });
    });
});
// Update space
router.put('/:spaceId', auth_1.authenticateToken, (req, res) => {
    const { spaceId } = req.params;
    const { title, description, customization, isPublic } = req.body;
    const userId = req.user?.id;
    // Check ownership
    database_1.default.get('SELECT userId FROM virtual_spaces WHERE id = ?', [spaceId], (err, space) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        if (!space || space.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        database_1.default.run('UPDATE virtual_spaces SET title = ?, description = ?, customization = ?, isPublic = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [title, description, JSON.stringify(customization), isPublic, spaceId], function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update space'
                });
            }
            res.json({
                success: true,
                message: 'Space updated successfully'
            });
        });
    });
});
// Delete space
router.delete('/:spaceId', auth_1.authenticateToken, (req, res) => {
    const { spaceId } = req.params;
    const userId = req.user?.id;
    // Check ownership
    database_1.default.get('SELECT userId FROM virtual_spaces WHERE id = ?', [spaceId], (err, space) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        if (!space || space.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        database_1.default.run('DELETE FROM virtual_spaces WHERE id = ?', [spaceId], function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete space'
                });
            }
            res.json({
                success: true,
                message: 'Space deleted successfully'
            });
        });
    });
});
exports.default = router;
//# sourceMappingURL=spaces.js.map