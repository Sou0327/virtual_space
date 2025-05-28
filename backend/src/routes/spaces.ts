import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { AuthRequest, VirtualSpace, SpaceTemplate } from '../types';
import db from '../utils/database';

const router = express.Router();

// Default space templates
const defaultTemplates: SpaceTemplate[] = [
  {
    id: 'cozy-room',
    name: 'コージーな部屋',
    type: 'room',
    description: '温かみのある居心地の良い個人空間',
    preview: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center',
    features: ['暖炉', 'ソファ', '本棚', '観葉植物']
  },
  {
    id: 'modern-stage',
    name: 'モダンステージ',
    type: 'stage',
    description: 'ライブパフォーマンス用のスタイリッシュなステージ',
    preview: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
    features: ['LED照明', 'スピーカー', 'ステージ', '観客席']
  },
  {
    id: 'art-gallery',
    name: 'アートギャラリー',
    type: 'gallery',
    description: '作品展示に最適な洗練されたギャラリー空間',
    preview: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&crop=center',
    features: ['展示壁', 'スポットライト', '作品台', '案内板']
  },
  {
    id: 'outdoor-park',
    name: 'アウトドアパーク',
    type: 'outdoor',
    description: '自然豊かな屋外空間でリラックス',
    preview: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
    features: ['芝生', '木々', 'ベンチ', '花壇']
  },
  {
    id: 'cyber-space',
    name: 'サイバー空間',
    type: 'futuristic',
    description: '未来的なデジタル空間',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    features: ['ネオンライト', 'ホログラム', 'デジタル壁', 'フローティングパネル']
  },
  {
    id: 'cafe-lounge',
    name: 'カフェラウンジ',
    type: 'social',
    description: 'くつろぎながら交流できるカフェ空間',
    preview: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop&crop=center',
    features: ['カウンター', 'テーブル', 'チェア', 'コーヒーマシン']
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
router.post('/', authenticateToken, (req: AuthRequest, res) => {
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

  try {
    const insertStmt = db.prepare('INSERT INTO virtual_spaces (userId, title, description, template, customization) VALUES (?, ?, ?, ?, ?)');
    const result = insertStmt.run(userId, title, description, JSON.stringify(template), JSON.stringify(defaultCustomization));

    res.status(201).json({
      success: true,
      message: 'Space created successfully',
      data: {
        spaceId: result.lastInsertRowid
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create space'
    });
  }
});

// Get user's spaces
router.get('/my-spaces', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;

  try {
    const spaces = db.prepare('SELECT * FROM virtual_spaces WHERE userId = ? ORDER BY updatedAt DESC').all(userId);

    const formattedSpaces = spaces.map((space: any) => ({
      ...space,
      template: JSON.parse(space.template),
      customization: JSON.parse(space.customization)
    }));

    res.json({
      success: true,
      data: { spaces: formattedSpaces }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Get space by ID
router.get('/:spaceId', optionalAuth, (req: AuthRequest, res) => {
  const { spaceId } = req.params;
  const userId = req.user?.id;

  try {
    const space = db.prepare('SELECT vs.*, u.username, u.displayName FROM virtual_spaces vs JOIN users u ON vs.userId = u.id WHERE vs.id = ?').get(spaceId) as any;

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
      db.prepare('UPDATE virtual_spaces SET visitCount = visitCount + 1 WHERE id = ?').run(spaceId);
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
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Update space
router.put('/:spaceId', authenticateToken, (req: AuthRequest, res) => {
  const { spaceId } = req.params;
  const { title, description, customization, isPublic } = req.body;
  const userId = req.user?.id;

  try {
    // Check ownership
    const space = db.prepare('SELECT userId FROM virtual_spaces WHERE id = ?').get(spaceId) as any;

    if (!space || space.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateStmt = db.prepare(
      'UPDATE virtual_spaces SET title = ?, description = ?, customization = ?, isPublic = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?'
    );
    updateStmt.run(title, description, JSON.stringify(customization), isPublic, spaceId);

    res.json({
      success: true,
      message: 'Space updated successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

// Delete space
router.delete('/:spaceId', authenticateToken, (req: AuthRequest, res) => {
  const { spaceId } = req.params;
  const userId = req.user?.id;

  try {
    // Check ownership
    const space = db.prepare('SELECT userId FROM virtual_spaces WHERE id = ?').get(spaceId) as any;

    if (!space || space.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const deleteStmt = db.prepare('DELETE FROM virtual_spaces WHERE id = ?');
    deleteStmt.run(spaceId);

    res.json({
      success: true,
      message: 'Space deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
});

export default router; 