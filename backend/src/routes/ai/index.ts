import express from 'express';
import textureGenerationRouter from './texture-generation';
import modelGenerationRouter from './model-generation';

const router = express.Router();

// APIキー状態確認エンドポイント
router.get('/api-keys/status', (req, res) => {
  const status = {
    openai: process.env.OPENAI_API_KEY ? 
      (process.env.OPENAI_API_KEY.startsWith('sk-') ? 'configured' : 'invalid_format') : 
      'not_configured',
    stability: process.env.STABILITY_API_KEY ? 
      (process.env.STABILITY_API_KEY.startsWith('sk-') ? 'configured' : 'invalid_format') : 
      'not_configured',
    meshy: process.env.MESHY_API_KEY ? 
      (process.env.MESHY_API_KEY.startsWith('msy_') ? 'configured' : 'invalid_format') : 
      'not_configured',
    kaedim: process.env.KAEDIM_API_KEY ? 
      (process.env.KAEDIM_API_KEY.startsWith('kdm-') ? 'configured' : 'invalid_format') : 
      'not_configured'
  };
  
  console.log('🔑 API Keys Status:', status);
  res.json(status);
});

// 分割されたルートを統合
router.use('/', textureGenerationRouter);
router.use('/', modelGenerationRouter);

export default router; 