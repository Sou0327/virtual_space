import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// 内部APIキー管理（環境変数から取得）
const AI_API_KEYS = {
  OPENAI: process.env.OPENAI_API_KEY || 'sk-test-key-placeholder',
  STABILITY: process.env.STABILITY_API_KEY || 'sk-test-key-placeholder',
  MESHY: process.env.MESHY_API_KEY || 'msy-test-key-placeholder',
  KAEDIM: process.env.KAEDIM_API_KEY || 'kdm-test-key-placeholder'
};

// 高品質モックテクスチャURL
const ARCHITECTURAL_TEXTURES = {
  wall: {
    concrete: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1024&h=1024&fit=crop&auto=format',
    brick: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7ddc?w=1024&h=1024&fit=crop&auto=format',
    wood: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=1024&h=1024&fit=crop&auto=format',
    default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1024&h=1024&fit=crop&auto=format'
  },
  floor: {
    wood: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop&auto=format',
    tile: 'https://images.unsplash.com/photo-1565183997392-7a8b2d96e3d7?w=1024&h=1024&fit=crop&auto=format',
    default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1024&h=1024&fit=crop&auto=format'
  }
};

/**
 * 材質に基づいてテクスチャURLを選択
 */
function selectTextureUrl(type: 'wall' | 'floor', material: string): string {
  if (type === 'wall') {
    const wallTextures = ARCHITECTURAL_TEXTURES.wall;
    if (material.includes('concrete') || material.includes('コンクリート')) {
      return wallTextures.concrete;
    } else if (material.includes('brick') || material.includes('レンガ')) {
      return wallTextures.brick;
    } else if (material.includes('wood') || material.includes('木')) {
      return wallTextures.wood;
    }
    return wallTextures.default;
  } else {
    const floorTextures = ARCHITECTURAL_TEXTURES.floor;
    if (material.includes('wood') || material.includes('木')) {
      return floorTextures.wood;
    } else if (material.includes('tile') || material.includes('タイル')) {
      return floorTextures.tile;
    }
    return floorTextures.default;
  }
}

/**
 * 壁・床テクスチャ生成エンドポイント
 * 現在は高品質モックテクスチャを使用（AI API統合は将来実装）
 */
async function generateTextureHandler(req: express.Request, res: express.Response) {
  try {
    const { type, material, size = { width: 10, height: 5, depth: 0.2 } } = req.body;
    
    console.log(`🏗️ ${type} texture generation:`, material, size);

    // 現在は高品質モックテクスチャを使用
    console.log(`🎭 Using high-quality architectural texture for ${type}...`);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // リアルな待機時間
    
    const textureUrl = selectTextureUrl(type, material);
    const mockModelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SimpleMeshes/glTF/SimpleMeshes.gltf';
    
    const result = {
      type: type,
      material: material,
      size: size,
      texture_url: textureUrl,
      model_url: mockModelUrl,
      format: 'architectural_texture',
      processing_time: '1.5s',
      api_used: 'High-Quality Architectural Textures',
      status: 'success_architectural_texture',
      texture_info: {
        resolution: '1024x1024',
        quality: 'High',
        format: 'JPEG',
        source: 'Curated architectural textures',
        seamless: false,
        optimized_for: 'room_building'
      }
    };
    
    console.log(`✅ High-quality ${type} texture selected:`, textureUrl);
    res.json(result);
    
  } catch (error) {
    console.error(`❌ ${req.body.type || 'architectural'} texture generation error:`, error);
    
    const fallbackResult = {
      type: req.body.type || 'wall',
      material: req.body.material || 'concrete',
      texture_url: ARCHITECTURAL_TEXTURES.wall.default,
      model_url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SimpleMeshes/glTF/SimpleMeshes.gltf',
      format: 'architectural_fallback',
      status: 'error_fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.json(fallbackResult);
  }
}

router.post('/generate-wall-floor', generateTextureHandler);
router.post('/generate-texture', generateTextureHandler);

export default router; 