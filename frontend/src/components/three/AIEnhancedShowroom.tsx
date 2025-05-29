import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// AI統合サービス設定
interface AIService {
  name: string;
  type: 'texture' | 'model' | 'lighting';
  apiEndpoint: string;
  description: string;
  cost: string;
}

const AI_SERVICES: AIService[] = [
  {
    name: 'OpenAI DALL-E 3',
    type: 'texture',
    apiEndpoint: '/api/ai/generate-texture',
    description: 'プロンプトから高品質テクスチャ生成',
    cost: '$0.040/画像'
  },
  {
    name: 'Stability AI',
    type: 'texture',
    apiEndpoint: '/api/ai/stable-diffusion',
    description: 'PBRマテリアル用テクスチャセット生成',
    cost: '$0.02/画像'
  },
  {
    name: 'Stable Fast 3D',
    type: 'model',
    apiEndpoint: '/api/ai/stable-fast-3d',
    description: '画像から3Dモデル生成（0.5秒）',
    cost: '無料* (2クレジット)'
  },
  {
    name: 'Stable Point Aware 3D',
    type: 'model',
    apiEndpoint: '/api/ai/stable-point-aware-3d',
    description: '高品質3D生成・リアルタイム編集対応',
    cost: '無料* (4クレジット)'
  },
  {
    name: 'Text-to-3D',
    type: 'model',
    apiEndpoint: '/api/ai/text-to-3d',
    description: 'テキストから直接3Dモデル生成',
    cost: '無料*'
  },
  {
    name: 'Meshy AI',
    type: 'model',
    apiEndpoint: '/api/ai/generate-3d-model',
    description: 'テキストから3Dモデル生成',
    cost: '$0.20/モデル'
  }
];

// AI強化されたマテリアル
interface AIEnhancedMaterial {
  id: string;
  prompt: string;
  baseColor: string;
  normalMap?: string;
  roughnessMap?: string;
  metallicMap?: string;
  generated: boolean;
}

// AI統合フック
const useAIEnhancement = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTextures, setGeneratedTextures] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);

  // API状態確認
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ai/api-keys/status');
        const data = await response.json();
        setApiStatus(data);
        console.log('🔑 API Status:', data);
      } catch (error) {
        console.error('❌ API status check failed:', error);
      }
    };

    checkApiStatus();
  }, []);

  const generateTexture = async (prompt: string, service: AIService) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`🎨 Generating texture with ${service.name}:`, prompt);

      // APIキー不要（サーバー側で管理）
      const response = await fetch(`http://localhost:3001${service.apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          size: '1024x1024',
          quality: 'hd',
          style: 'natural'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const textureUrl = data.url || data.data?.[0]?.url;

      if (textureUrl) {
        setGeneratedTextures(prev => new Map(prev.set(prompt, textureUrl)));
        console.log('✅ Texture generated successfully:', textureUrl);
        return textureUrl;
      } else {
        throw new Error('テクスチャURLが取得できませんでした');
      }
    } catch (err) {
      console.error('❌ Texture generation failed:', err);
      setError(err instanceof Error ? err.message : 'テクスチャ生成に失敗しました');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generate3DModel = async (prompt: string, service: AIService) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`🎯 Generating 3D model with ${service.name}:`, prompt);

      const response = await fetch(`http://localhost:3001${service.apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          format: 'glb',
          quality: 'high',
          optimization: 'web'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const modelUrl = data.model_url || data.url;

      if (modelUrl) {
        console.log('✅ 3D Model generated successfully:', modelUrl);
        return modelUrl;
      } else {
        throw new Error('3Dモデルが取得できませんでした');
      }
    } catch (err) {
      console.error('❌ 3D Model generation failed:', err);
      setError(err instanceof Error ? err.message : '3Dモデル生成に失敗しました');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTextTo3D = async (prompt: string, service: AIService) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`🎯 Generating 3D model from text with ${service.name}:`, prompt);

      const response = await fetch(`http://localhost:3001${service.apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          textureResolution: 1024,
          style: 'photographic'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.model_url) {
        console.log('✅ Text-to-3D model generated successfully:', data);
        // 3Dモデルの情報を保存（実際のアプリでは状態管理に保存）
        return data;
      } else {
        throw new Error('3Dモデルが取得できませんでした');
      }
    } catch (err) {
      console.error('❌ Text-to-3D generation failed:', err);
      setError(err instanceof Error ? err.message : 'Text-to-3D生成に失敗しました');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImageTo3D = async (imageUrl: string, service: AIService) => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log(`🚀 Generating 3D model from image with ${service.name}:`, imageUrl);

      const response = await fetch(`http://localhost:3001${service.apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          textureResolution: 1024,
          foregroundRatio: 0.85
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.model_url) {
        console.log('✅ Image-to-3D model generated successfully:', data);
        return data;
      } else {
        throw new Error('3Dモデルが取得できませんでした');
      }
    } catch (err) {
      console.error('❌ Image-to-3D generation failed:', err);
      setError(err instanceof Error ? err.message : 'Image-to-3D生成に失敗しました');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateTexture,
    generate3DModel,
    generateTextTo3D,
    generateImageTo3D,
    isGenerating,
    generatedTextures,
    error,
    apiStatus,
    clearError: () => setError(null)
  };
};

// AI強化されたチェア
const AIEnhancedChair: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [material, setMaterial] = useState<AIEnhancedMaterial>({
    id: 'chair_leather',
    prompt: 'high-quality brown leather texture with natural grain patterns, realistic scratches and wear, photorealistic material for luxury furniture',
    baseColor: '#8B4513',
    generated: false
  });

  const { generateTexture, isGenerating, generatedTextures } = useAIEnhancement();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  const enhanceWithAI = async () => {
    const textureUrl = await generateTexture(material.prompt, AI_SERVICES[0]);
    if (textureUrl) {
      setMaterial(prev => ({ ...prev, generated: true }));
    }
  };

  const currentTexture = generatedTextures.get(material.prompt);

  return (
    <group ref={groupRef} position={position}>
      {/* AI生成テクスチャ表示状態 */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded text-xs">
          {isGenerating ? '🎨 AI生成中...' : currentTexture ? '✅ AI強化済み' : '🔧 通常テクスチャ'}
        </div>
      </Html>

      {/* 座面 */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.25, 1.6]} />
        <meshStandardMaterial
          color={material.baseColor}
          metalness={0.05}
          roughness={currentTexture ? 0.4 : 0.8}
          map={currentTexture ? useLoader(THREE.TextureLoader, currentTexture) : undefined}
        />
      </mesh>

      {/* 背もたれ */}
      <mesh position={[0, 1.5, -0.7]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.7, 0.25]} />
        <meshStandardMaterial
          color="#A0522D"
          metalness={0.05}
          roughness={0.7}
        />
      </mesh>

      {/* 脚（4本） */}
      {[[-0.7, 0.3, -0.6], [0.7, 0.3, -0.6], [-0.7, 0.3, 0.6], [0.7, 0.3, 0.6]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.12, 0.08, 0.6]} />
          <meshStandardMaterial
            color="#654321"
            metalness={0.2}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* AI強化ボタン */}
      <Html position={[0, -0.5, 0]} center>
        <button
          onClick={enhanceWithAI}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"
        >
          {isGenerating ? '🎨 生成中...' : '🤖 AI強化'}
        </button>
      </Html>
    </group>
  );
};

// AI統合コントロールパネル
const AIControlPanel: React.FC = () => {
  const [selectedService, setSelectedService] = useState<AIService>(AI_SERVICES[0]);
  const [prompt, setPrompt] = useState('高品質レザーテクスチャ、自然な革の質感、リアルな傷と摩耗');
  const { generateTexture, generate3DModel, generateTextTo3D, generateImageTo3D, isGenerating, error, apiStatus, clearError } = useAIEnhancement();

  const handleGenerateTexture = async () => {
    if (!prompt.trim()) return;
    await generateTexture(prompt, selectedService);
  };

  const handleGenerate3DModel = async () => {
    if (!prompt.trim()) return;
    await generate3DModel(prompt, selectedService);
  };

  const handleGenerateTextTo3D = async () => {
    if (!prompt.trim()) return;
    await generateTextTo3D(prompt, selectedService);
  };

  const handleGenerateImageTo3D = async () => {
    if (!prompt.trim()) return;
    await generateImageTo3D(prompt, selectedService);
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-gray-900 bg-opacity-95 text-white p-6 rounded-lg max-w-md">
      <h3 className="text-xl font-bold mb-4 text-center">🤖 AI 3D強化システム</h3>

      {/* API状態表示 */}
      {apiStatus && (
        <div className={`mb-4 p-4 rounded-lg text-sm border-2 ${apiStatus.development_mode
            ? 'bg-yellow-900 border-yellow-600 text-yellow-100'
            : 'bg-green-900 border-green-600 text-green-100'
          }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg">
              {apiStatus.development_mode ? '🎭 デモモード' : '🔥 実際のAI生成モード'}
            </span>
            <span className="text-xs px-2 py-1 rounded bg-black bg-opacity-30">
              {apiStatus.mock_enabled ? 'サンプル画像使用' : 'リアルAI生成'}
            </span>
          </div>

          <div className="text-sm mb-3">
            {apiStatus.message}
          </div>

          {/* APIキー設定状況 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className={`flex items-center space-x-2 ${apiStatus.api_keys_configured.openai ? 'text-green-300' : 'text-gray-400'}`}>
              <span>{apiStatus.api_keys_configured.openai ? '✅' : '❌'}</span>
              <span className="text-xs">OpenAI DALL-E 3</span>
            </div>
            <div className={`flex items-center space-x-2 ${apiStatus.api_keys_configured.stability ? 'text-green-300' : 'text-gray-400'}`}>
              <span>{apiStatus.api_keys_configured.stability ? '✅' : '❌'}</span>
              <span className="text-xs">Stability AI</span>
            </div>
            <div className={`flex items-center space-x-2 ${apiStatus.api_keys_configured.meshy ? 'text-green-300' : 'text-gray-400'}`}>
              <span>{apiStatus.api_keys_configured.meshy ? '✅' : '❌'}</span>
              <span className="text-xs">Meshy AI</span>
            </div>
            <div className={`flex items-center space-x-2 ${apiStatus.api_keys_configured.kaedim ? 'text-green-300' : 'text-gray-400'}`}>
              <span>{apiStatus.api_keys_configured.kaedim ? '✅' : '❌'}</span>
              <span className="text-xs">Kaedim3D</span>
            </div>
          </div>

          {/* セットアップ手順（デモモードの場合） */}
          {apiStatus.setup_instructions && (
            <div className="bg-black bg-opacity-30 p-3 rounded text-xs">
              <div className="font-medium text-yellow-200 mb-2">🚀 実際のAI生成を有効化:</div>
              <div className="space-y-1 text-yellow-100">
                <div>1. APIキーを取得: <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-300 underline">OpenAI</a> / <a href="https://platform.stability.ai/account/keys" target="_blank" className="text-blue-300 underline">Stability AI</a></div>
                <div>2. backend/.env ファイルに設定</div>
                <div>3. サーバー再起動</div>
                <div className="text-orange-200 mt-2">📖 詳細: backend/README_AI_SETUP.md</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AIサービス選択 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">AIサービス選択:</label>
        <select
          value={selectedService.name}
          onChange={(e) => setSelectedService(AI_SERVICES.find(s => s.name === e.target.value) || AI_SERVICES[0])}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
        >
          {AI_SERVICES.map(service => (
            <option key={service.name} value={service.name}>
              {service.name} ({service.cost})
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-400 mt-1">
          {selectedService.description}
        </div>
      </div>

      {/* プロンプト入力 */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">生成プロンプト:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例: luxury wooden table texture with natural grain patterns"
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white h-24 resize-none"
        />
      </div>

      {/* 生成ボタン */}
      <div className="space-y-2 mb-4">
        {/* テクスチャ生成 */}
        {selectedService.type === 'texture' && (
          <button
            onClick={handleGenerateTexture}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium"
          >
            {isGenerating ? '🎨 生成中...' : '🎨 テクスチャ生成'}
          </button>
        )}

        {/* 3Dモデル生成 */}
        {selectedService.type === 'model' && selectedService.name === 'Meshy AI' && (
          <button
            onClick={handleGenerate3DModel}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium"
          >
            {isGenerating ? '🎯 生成中...' : '🎯 3Dモデル生成'}
          </button>
        )}

        {/* Text-to-3D */}
        {selectedService.name === 'Text-to-3D' && (
          <button
            onClick={handleGenerateTextTo3D}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium"
          >
            {isGenerating ? '🚀 生成中...' : '🚀 Text-to-3D生成'}
          </button>
        )}

        {/* Stable Fast 3D（画像アップロード） */}
        {selectedService.name === 'Stable Fast 3D' && (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    handleGenerateImageTo3D();
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
            />
            <button
              onClick={handleGenerateImageTo3D}
              disabled={isGenerating}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium"
            >
              {isGenerating ? '🚀 変換中...' : '🚀 画像→3D変換 (0.5秒)'}
            </button>
          </div>
        )}

        {/* Stable Point Aware 3D（高品質画像アップロード） */}
        {selectedService.name === 'Stable Point Aware 3D' && (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    handleGenerateImageTo3D();
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-purple-600 file:text-white file:cursor-pointer"
            />
            <button
              onClick={handleGenerateImageTo3D}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium"
            >
              {isGenerating ? '🎯 高品質生成中...' : '🎯 高品質3D生成 (3-5秒)'}
            </button>
            <div className="text-xs text-purple-300 bg-purple-900 bg-opacity-30 p-2 rounded">
              ✨ 特徴: リアルタイム編集・ポイントクラウド拡散・裏面詳細向上
            </div>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          <div className="flex justify-between items-start">
            <span className="text-sm">{error}</span>
            <button onClick={clearError} className="text-white hover:text-gray-200 ml-2">✕</button>
          </div>
        </div>
      )}

      {/* プリセットプロンプト */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">🎯 プリセット:</div>
        <div className="flex flex-wrap gap-1">
          {selectedService.type === 'texture' ? [
            'リアルな革のテクスチャ',
            '高級木材の質感',
            '金属マテリアル',
            'ファブリック素材',
            'ガラス質感'
          ] : [
            'モダンな椅子',
            'ヴィンテージテーブル',
            'スタイリッシュなランプ',
            '観葉植物',
            'デザイン家具'
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => setPrompt(preset + (selectedService.type === 'texture' ? ', 4K品質, フォトリアル, シームレス' : ', 高品質, プロダクト写真, 白背景'))}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* ヒント */}
      <div className="p-3 bg-blue-900 bg-opacity-50 rounded text-xs">
        <div className="font-medium text-blue-200 mb-1">💡 使い方:</div>
        <ul className="text-blue-300 space-y-1">
          {selectedService.type === 'texture' ? (
            <>
              <li>• プロンプトを入力して「🎨 テクスチャ生成」</li>
              <li>• 生成されたテクスチャが椅子に適用されます</li>
            </>
          ) : selectedService.name === 'Stable Fast 3D' ? (
            <>
              <li>• 画像ファイルをアップロードして3Dモデルに変換</li>
              <li>• 処理時間わずか0.5秒の高速変換</li>
              <li>• JPEGやPNG形式に対応</li>
            </>
          ) : selectedService.name === 'Text-to-3D' ? (
            <>
              <li>• テキストから直接3Dモデルを生成</li>
              <li>• Step1: テキスト→画像生成</li>
              <li>• Step2: 画像→3Dモデル変換</li>
            </>
          ) : (
            <>
              <li>• プロンプトを入力して3Dモデル生成</li>
              <li>• 生成されたモデルがシーンに配置されます</li>
            </>
          )}
          <li>• デモモードでは高品質なサンプルを使用</li>
          <li>• <span className="text-yellow-300">無料*</span>: 年収$1M以下の個人・組織</li>
        </ul>
      </div>
    </div>
  );
};

// AI強化されたショールーム
const AIEnhancedShowroom: React.FC = () => {
  console.log('🤖 AI Enhanced Showroom loading...');

  return (
    <>
      <Environment preset="studio" background={false} />

      <ambientLight intensity={0.3} />
      <directionalLight
        position={[15, 15, 8]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* AI強化された家具 */}
      <AIEnhancedChair position={[-2, 0, -1]} />

      {/* 基本的なフロア */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>

      <ContactShadows
        position={[0, 0.005, 0]}
        opacity={0.4}
        scale={20}
        blur={1.5}
        far={10}
      />

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        target={[0, 1, 0]}
        minDistance={3}
        maxDistance={15}
      />
    </>
  );
};

export const AIEnhanced3DShowroom: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-100">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-800 mb-4">AI統合エラー</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-blue-100">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">AI 3D強化システム準備中...</h2>
          <p className="text-blue-600">AIサービス接続確認中</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative bg-gray-900">
      <Canvas
        camera={{ position: [8, 6, 8], fov: 75 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <AIEnhancedShowroom />
      </Canvas>

      <AIControlPanel />

      {/* ステータス表示 */}
      <div className="fixed bottom-4 left-4 z-50 bg-black bg-opacity-90 text-white p-4 rounded">
        <h4 className="font-bold mb-2">🤖 AI強化 3Dショールーム</h4>
        <ul className="text-sm space-y-1">
          <li>✅ AI テクスチャ生成対応</li>
          <li>✅ AI 3Dモデル生成対応</li>
          <li>🎨 DALL-E 3, Stability AI</li>
          <li>🎯 Meshy AI, Stable Fast 3D, Text-to-3D</li>
          <li>💡 リアルタイム品質向上</li>
        </ul>
      </div>
    </div>
  );
}; 