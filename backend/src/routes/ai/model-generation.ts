import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// 型定義
interface MeshyCreateResponse {
  result: string;
}

interface MeshyStatusResponse {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED';
  model_urls?: {
    glb?: string;
    obj?: string;
    fbx?: string;
    usdz?: string;
    mtl?: string;
  };
  thumbnail_url?: string;
  video_url?: string;
  progress?: number;
  texture_urls?: Array<{
    base_color?: string;
    metallic?: string;
    normal?: string;
    roughness?: string;
  }>;
  prompt?: string;
  art_style?: string;
  texture_prompt?: string;
  started_at?: number;
  created_at?: number;
  finished_at?: number;
  task_error?: {
    message: string;
  };
}

// 内部APIキー管理（環境変数から取得）
const AI_API_KEYS = {
  MESHY: process.env.MESHY_API_KEY || 'msy-test-key-placeholder',
  KAEDIM: process.env.KAEDIM_API_KEY || 'kdm-test-key-placeholder'
};

// 高品質モック3DモデルURL
const MOCK_3D_MODELS = {
  furniture: {
    chair: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf',
    table: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF/WaterBottle.gltf',
    lamp: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF/Lantern.gltf',
    default: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF/WaterBottle.gltf'
  },
  objects: {
    helmet: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/FlightHelmet/glTF/FlightHelmet.gltf',
    default: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/WaterBottle/glTF/WaterBottle.gltf'
  }
};

/**
 * プロンプトに基づいて適切なモックモデルを選択
 */
function selectMockModel(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('chair') || lowerPrompt.includes('椅子')) {
    return MOCK_3D_MODELS.furniture.chair;
  } else if (lowerPrompt.includes('table') || lowerPrompt.includes('テーブル') || lowerPrompt.includes('机')) {
    return MOCK_3D_MODELS.furniture.table;
  } else if (lowerPrompt.includes('lamp') || lowerPrompt.includes('ランプ') || lowerPrompt.includes('ライト')) {
    return MOCK_3D_MODELS.furniture.lamp;
  } else if (lowerPrompt.includes('helmet') || lowerPrompt.includes('ヘルメット')) {
    return MOCK_3D_MODELS.objects.helmet;
  }
  
  return MOCK_3D_MODELS.furniture.default;
}

/**
 * Meshy-5 API呼び出し（公式仕様準拠）
 */
async function callMeshyAPI(prompt: string, art_style: string = 'realistic', mode: 'preview' | 'refine' = 'preview', preview_task_id?: string): Promise<any> {
  const apiKey = AI_API_KEYS.MESHY;
  
  if (!apiKey || apiKey === 'msy-test-key-placeholder') {
    throw new Error('Meshy API key not configured');
  }

  console.log(`🤖 Calling Meshy-5 API - Mode: ${mode}, Prompt:`, prompt);

  if (mode === 'preview') {
    // Stage 1: Create preview task (公式仕様準拠)
    const createResponse = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'preview',
        prompt: prompt,
        art_style: art_style,
        ai_model: 'meshy-5',
        topology: 'triangle',
        target_polycount: 30000,
        should_remesh: true,
        symmetry_mode: 'auto',
        seed: Math.floor(Math.random() * 1000000),
        moderation: false
      })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('❌ Meshy API Error:', createResponse.status, errorData);
      throw new Error(`Meshy Preview API error: ${createResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const createResult = await createResponse.json() as MeshyCreateResponse;
    const taskId = createResult.result;
    
    console.log('📝 Meshy preview task created:', taskId);
    return { task_id: taskId, mode: 'preview' };

  } else if (mode === 'refine' && preview_task_id) {
    // Stage 2: Create refine task (公式仕様準拠)
    const refineResponse = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'refine',
        preview_task_id: preview_task_id,
        enable_pbr: false,
        texture_prompt: `realistic ${prompt} texture, detailed surface materials for interior design`,
        moderation: false
      })
    });

    if (!refineResponse.ok) {
      const errorData = await refineResponse.json();
      console.error('❌ Meshy Refine API Error:', refineResponse.status, errorData);
      throw new Error(`Meshy Refine API error: ${refineResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const refineResult = await refineResponse.json() as MeshyCreateResponse;
    const taskId = refineResult.result;
    
    console.log('🎨 Meshy refine task created:', taskId);
    return { task_id: taskId, mode: 'refine' };
  } else {
    throw new Error('Invalid mode or missing preview_task_id for refine mode');
  }
}

/**
 * Meshy タスクステータス確認（公式仕様準拠）
 */
async function checkMeshyTaskStatus(taskId: string): Promise<any> {
  const apiKey = AI_API_KEYS.MESHY;
  
  if (!apiKey || apiKey === 'msy-test-key-placeholder') {
    throw new Error('Meshy API key not configured');
  }

  console.log(`🔄 Checking Meshy task ${taskId} status...`);

  const statusResponse = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!statusResponse.ok) {
    const errorData = await statusResponse.json();
    console.error('❌ Meshy Status API Error:', statusResponse.status, errorData);
    throw new Error(`Status check failed: ${statusResponse.status} - ${JSON.stringify(errorData)}`);
  }

  const statusResult = await statusResponse.json() as MeshyStatusResponse;
  console.log(`📊 Meshy task ${taskId} status: ${statusResult.status} (${statusResult.progress || 0}%)`);
  
  // 完了時の詳細なレスポンス構造をログ出力
  if (statusResult.status === 'SUCCEEDED') {
    console.log('✅ 完了タスクの詳細構造:', JSON.stringify(statusResult, null, 2));
    console.log('📁 Model URLs:', statusResult.model_urls);
    console.log('🎨 Texture URLs:', statusResult.texture_urls);
    console.log('🖼️ Thumbnail URL:', statusResult.thumbnail_url);
  }

  return statusResult;
}

/**
 * Text-to-3D生成エンドポイント（Meshy-5 API統合 - 正しい2段階プロセス）
 */
router.post('/text-to-3d', async (req, res) => {
  console.log('🚀 Text-to-3D generation request:', req.body);
  
  try {
    const { 
      prompt, 
      art_style = 'realistic',
      mode = 'preview',
      preview_task_id,
      ai_model = 'meshy-5'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'プロンプトが必要です' });
    }

    // APIキーが設定されている場合は実際のMeshy-5 APIを使用
    if (AI_API_KEYS.MESHY !== 'msy-test-key-placeholder') {
      try {
        console.log(`🤖 Using real Meshy-5 API - Mode: ${mode}...`);
        const meshyResult = await callMeshyAPI(prompt, art_style, mode, preview_task_id);
        
        const result = {
          prompt: prompt,
          task_id: meshyResult.task_id,
          mode: meshyResult.mode,
          status: 'PENDING',
          estimated_time: mode === 'preview' ? '2-4 minutes' : '2-3 minutes',
          ai_model_used: 'meshy-5',
          stage: mode === 'preview' ? '1/2 (Preview - Geometry)' : '2/2 (Refine - Textures)',
          steps: [
            { 
              step: mode === 'preview' ? 1 : 2, 
              name: mode === 'preview' ? 'Meshy-5 Preview Generation' : 'Meshy-5 Texture Refinement', 
              time: mode === 'preview' ? '2-4min' : '2-3min', 
              status: 'pending',
              api_used: 'Meshy-5 API',
              note: mode === 'preview' ? 'Generating base mesh geometry' : 'Adding realistic textures'
            }
          ],
          api_info: {
            service: 'Meshy-5 API',
            workflow: '2-stage (preview → refine)',
            api_version: 'v2',
            current_stage: mode
          }
        };
        
        console.log(`✅ Meshy-5 ${mode} task created:`, meshyResult.task_id);
        return res.json(result);
        
      } catch (apiError) {
        console.error('❌ Meshy API failed, falling back to mock:', apiError);
        // APIが失敗した場合はモックにフォールバック
      }
    }

    // フォールバック: モック3Dモデル
    console.log('🎭 Using mock 3D model generation...');
    
    // オブジェクトタイプに基づくモックモデル
    const objectType = prompt.toLowerCase();
    let mockModelUrl = 'https://threejs.org/examples/models/gltf/DamagedHelmet/DamagedHelmet.gltf';
    let mockPreviewImage = 'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=3D+Model';

    // より適切なモックURLの選択
    if (objectType.includes('chair') || objectType.includes('椅子')) {
      mockModelUrl = 'https://threejs.org/examples/models/gltf/DamagedHelmet/DamagedHelmet.gltf';
      mockPreviewImage = 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Chair';
    } else if (objectType.includes('table') || objectType.includes('テーブル')) {
      mockPreviewImage = 'https://via.placeholder.com/400x300/DEB887/FFFFFF?text=Table';
    } else if (objectType.includes('lamp') || objectType.includes('ランプ')) {
      mockPreviewImage = 'https://via.placeholder.com/400x300/FFD700/FFFFFF?text=Lamp';
    } else if (objectType.includes('bookshelf') || objectType.includes('本棚')) {
      mockPreviewImage = 'https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Bookshelf';
    }

    const result = {
      prompt: prompt,
      model_url: mockModelUrl,
      preview_image: mockPreviewImage,
      format: 'gltf',
      total_processing_time: 'instant (mock)',
      ai_model_used: 'mock-generator',
      task_id: `mock-${Date.now()}`,
      steps: [
        { 
          step: 1, 
          name: 'Mock 3D Generation', 
          time: 'instant', 
          status: 'completed',
          api_used: 'Mock API',
          note: 'Development mode - using placeholder model'
        }
      ],
      status: 'success_mock',
      credits_used: 0,
      api_info: {
        service: 'Mock Generator',
        model_generation: 'placeholder',
        api_version: 'mock'
      }
    };
    
    console.log('✅ Mock 3D model generated');
    return res.json(result);

  } catch (error) {
    console.error('❌ Text-to-3D generation error:', error);
    res.status(500).json({ 
      error: 'テキストから3Dモデルの生成に失敗しました',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * フロントエンド用のgenerate-3d-modelエンドポイント（実際のMeshy API統合）
 */
router.post('/generate-3d-model', async (req, res) => {
  console.log('🎯 Generate 3D Model request:', req.body);
  console.log('🔑 Current Meshy API key status:', {
    exists: !!AI_API_KEYS.MESHY,
    length: AI_API_KEYS.MESHY ? AI_API_KEYS.MESHY.length : 0,
    prefix: AI_API_KEYS.MESHY ? AI_API_KEYS.MESHY.substring(0, 10) + '...' : 'none',
    isPlaceholder: AI_API_KEYS.MESHY === 'msy-test-key-placeholder'
  });
  
  try {
    const { 
      prompt, 
      art_style = 'realistic',
      negative_prompt 
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'プロンプトが必要です' });
    }

    // 実際のMeshy APIが利用可能な場合は使用
    if (AI_API_KEYS.MESHY && AI_API_KEYS.MESHY !== 'msy-test-key-placeholder' && AI_API_KEYS.MESHY.length > 20) {
      try {
        console.log('🤖 Using real Meshy-5 API for generation...');
        console.log('📡 Calling Meshy API with prompt:', prompt);
        
        // Meshy APIでpreview生成を開始
        const meshyResult = await callMeshyAPI(prompt, art_style, 'preview');
        
        const result = {
          success: true,
          taskId: meshyResult.task_id,
          status: 'pending',
          objectName: prompt,
          message: `${prompt}の3Dモデル生成を開始しました（Meshy-5 API）`,
          estimatedTime: '2-4分',
          apiUsed: 'Meshy-5 API',
          mode: 'preview'
        };
        
        console.log('✅ Real Meshy-5 task created:', meshyResult.task_id);
        return res.json(result);
        
      } catch (apiError) {
        console.error('❌ Meshy API failed, using mock fallback:', apiError);
        // APIが失敗した場合はモックにフォールバック
      }
    } else {
      console.log('🔑 Meshy API key not configured properly, using mock generation');
      console.log('   Reason:', !AI_API_KEYS.MESHY ? 'Key missing' : 
                     AI_API_KEYS.MESHY === 'msy-test-key-placeholder' ? 'Placeholder key' :
                     AI_API_KEYS.MESHY.length <= 20 ? 'Key too short' : 'Unknown');
    }

    // フォールバック: モック3Dモデル生成
    console.log('🎭 Using mock 3D model generation for quick prototyping...');
    
    // オブジェクトタイプに基づくモックモデル
    const objectType = prompt.toLowerCase();
    let mockModelUrl = 'https://threejs.org/examples/models/gltf/DamagedHelmet/DamagedHelmet.gltf';
    let objectName = prompt;

    // より適切なモックURLの選択
    if (objectType.includes('chair') || objectType.includes('椅子')) {
      objectName = '椅子';
    } else if (objectType.includes('table') || objectType.includes('テーブル')) {
      objectName = 'テーブル';
    } else if (objectType.includes('lamp') || objectType.includes('ランプ')) {
      objectName = 'ランプ';
    } else if (objectType.includes('bookshelf') || objectType.includes('本棚')) {
      objectName = '本棚';
    }

    const taskId = `mock-${Date.now()}`;
    const result = {
      success: true,
      taskId: taskId,
      modelUrl: mockModelUrl,
      objectName: objectName,
      status: 'completed',
      message: `${objectName}のモックモデルが生成されました`,
      apiUsed: 'Mock Generator'
    };
    
    console.log('✅ Mock 3D model generated successfully:', objectName);
    return res.json(result);

  } catch (error) {
    console.error('❌ Generate 3D Model error:', error);
    res.status(500).json({ 
      error: '3Dモデルの生成に失敗しました',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Meshy タスクステータス確認エンドポイント
 */
router.get('/text-to-3d/:taskId/status', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('🔍 Checking Meshy task status:', taskId);

    // APIキーが設定されている場合は実際のMeshy APIをチェック
    if (AI_API_KEYS.MESHY !== 'msy-test-key-placeholder') {
      try {
        const statusResult = await checkMeshyTaskStatus(taskId);
        
        const result = {
          task_id: taskId,
          status: statusResult.status,
          progress: statusResult.progress || 0,
          model_url: statusResult.model_urls?.glb || statusResult.model_urls?.obj,
          thumbnail_url: statusResult.thumbnail_url,
          texture_urls: statusResult.texture_urls,
          started_at: statusResult.started_at,
          finished_at: statusResult.finished_at,
          task_error: statusResult.task_error
        };

        console.log(`📊 Task ${taskId} status:`, result.status);
        return res.json(result);

      } catch (apiError) {
        console.error('❌ Status check failed:', apiError);
        return res.status(500).json({ 
          error: 'ステータス確認に失敗しました',
          details: apiError instanceof Error ? apiError.message : String(apiError)
        });
      }
    }

    // モックレスポンス
    const result = {
      task_id: taskId,
      status: 'SUCCEEDED',
      progress: 100,
      model_url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/DamagedHelmet.gltf',
      thumbnail_url: 'https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Mock+3D',
      started_at: Date.now() - 30000,
      finished_at: Date.now()
    };

    console.log('🎭 Mock status check completed');
    return res.json(result);

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({ 
      error: 'ステータス確認に失敗しました',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * CORS対応のモデルプロキシエンドポイント（ダウンロード保存機能付き）
 */
router.get('/proxy-model/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    console.log('🔄 Proxying model for task:', taskId);

    // APIキーが設定されている場合は実際のMeshy APIから取得
    if (AI_API_KEYS.MESHY !== 'msy-test-key-placeholder') {
      try {
        const statusResult = await checkMeshyTaskStatus(taskId);
        
        if (statusResult.status === 'SUCCEEDED' && statusResult.model_urls?.glb) {
          const modelUrl = statusResult.model_urls.glb;
          
          // まずローカルファイルをチェック
          const fs = require('fs');
          const path = require('path');
          const uploadsDir = path.join(__dirname, '../../../uploads');
          const localFilename = `meshy_${taskId}.glb`;
          const localFilePath = path.join(uploadsDir, localFilename);
          
          // ローカルファイルが存在する場合はそれを使用
          if (fs.existsSync(localFilePath)) {
            console.log('📁 Using local cached GLB file:', localFilename);
            const buffer = fs.readFileSync(localFilePath);
            
            res.setHeader('Content-Type', 'model/gltf-binary');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            return res.send(buffer);
          }
          
          // ローカルファイルがない場合はMeshyからダウンロード
          console.log('🌐 Downloading GLB from Meshy:', modelUrl);
          const modelResponse = await fetch(modelUrl);
          
          if (modelResponse.ok) {
            const buffer = await modelResponse.arrayBuffer();
            const bufferData = Buffer.from(buffer);
            
            // uploadsフォルダに保存
            try {
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }
              
              fs.writeFileSync(localFilePath, bufferData);
              console.log('💾 GLB file saved to uploads:', localFilename, `(${(bufferData.length / 1024 / 1024).toFixed(1)}MB)`);
            } catch (saveError) {
              console.warn('⚠️ Failed to save GLB file locally:', saveError);
              // 保存に失敗してもプロキシは続行
            }
            
            res.setHeader('Content-Type', 'model/gltf-binary');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            return res.send(bufferData);
          }
        }
      } catch (error) {
        console.error('❌ Model proxy error:', error);
      }
    }

    // フォールバック: 404
    res.status(404).json({ error: 'Model not found or not available' });

  } catch (error) {
    console.error('❌ Model proxy error:', error);
    res.status(500).json({ 
      error: 'モデルプロキシに失敗しました',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * 開発者向け: uploadsフォルダのGLBファイル一覧取得
 */
router.get('/dev/uploaded-models', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const uploadsDir = path.join(__dirname, '../../../uploads');
    console.log('📁 Scanning uploads directory:', uploadsDir);
    
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ models: [], message: 'uploads directory not found' });
    }
    
    const files = fs.readdirSync(uploadsDir);
    const glbFiles = files.filter((file: string) => file.endsWith('.glb') && file.startsWith('meshy_'));
    
    interface UploadedModel {
      id: string;
      filename: string;
      taskId: string;
      size: number;
      sizeFormatted: string;
      createdAt: string;
      modifiedAt: string;
      url: string;
      devUrl: string;
    }
    
    const models: UploadedModel[] = glbFiles.map((filename: string) => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      const taskId = filename.replace('meshy_', '').replace('.glb', '');
      
      return {
        id: taskId,
        filename,
        taskId,
        size: stats.size,
        sizeFormatted: (stats.size / (1024 * 1024)).toFixed(1) + 'MB',
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        url: `/uploads/${filename}`,
        devUrl: `http://localhost:3001/uploads/${filename}`
      };
    });
    
    // 作成日時でソート（新しい順）
    models.sort((a: UploadedModel, b: UploadedModel) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`🗃️ Found ${models.length} GLB files in uploads`);
    
    res.json({
      models,
      count: models.length,
      totalSize: models.reduce((sum: number, model: UploadedModel) => sum + model.size, 0),
      message: `Found ${models.length} Meshy GLB files`
    });
    
  } catch (error) {
    console.error('❌ Dev uploaded models error:', error);
    res.status(500).json({ 
      error: 'アップロード済みモデルの取得に失敗しました',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router; 